<?php

declare(strict_types = 1);

namespace JohannSchopplich\LivePreview;

use Kirby\Cms\App;
use Kirby\Cms\ModelWithContent;
use Kirby\Cms\Page;
use Kirby\Cms\Pages;
use Kirby\Cms\Site;
use Kirby\Exception\InvalidArgumentException;
use Kirby\Exception\NotFoundException;
use Kirby\Form\Form;
use Kirby\Toolkit\Dom;
use Kirby\Toolkit\LazyValue;

final class LivePreview
{
    private readonly App $kirby;
    private readonly Page $page;
    // TODO: Type as `Kirby\Plugin\Plugin` once Kirby 4 support is dropped.
    private readonly mixed $plugin;
    private readonly array $content;

    public function __construct(
        private readonly string|null $id,
        private readonly string $model
    ) {
        $kirby = App::instance();
        $page = $id ? $kirby->page($id) : $kirby->site()->homePage();
        $plugin = $kirby->plugin('johannschopplich/live-preview');

        if (!$page) {
            throw new NotFoundException('Page not found');
        }

        if (!$plugin) {
            throw new NotFoundException('Plugin assets not found');
        }

        $this->kirby = $kirby;
        $this->page = $page;
        $this->plugin = $plugin;
    }

    public function render(array $content = [], bool $interactable = true): string
    {
        $this->content = $content;

        $previewPage = $this->createPreviewModel($this->page, $this->model === 'site' ? [] : $content);
        $html = $this->renderTemplate($previewPage);

        return $this->processHtml($html, $interactable);
    }

    private function createPreviewModel(ModelWithContent $model, array $content): Site|Page
    {
        $model = $model->clone();

        $form = Form::for($model, [
            'ignoreDisabled' => true,
            'input' => $content,
            'language' => $this->kirby->languageCode()
        ]);

        // TODO: Migrate to the `toStoredValues` method once Kirby 4 support is dropped.
        $this->updateModelContent($model, $form->strings());
        $this->updateModelContent($model, ['previewMode' => 'true']);

        $this->processWriterFields($model);

        return $model;
    }

    /**
     * Rewrites the permalinks of all writer fields to public URLs.
     */
    private function processWriterFields(ModelWithContent $model): void
    {
        $writerFields = array_filter(
            $model->blueprint()->fields(),
            fn ($field) => $field['type'] === 'writer'
        );

        foreach (array_keys($writerFields) as $key) {
            $field = $model->content()->get($key);
            $field = $field->permalinksToUrls();

            $this->updateModelContent($model, [
                $key => $field->value()
            ]);
        }
    }

    private function renderTemplate(Page $page): string
    {
        $template = $page->template();

        if (!$template->exists()) {
            throw new NotFoundException([
                'key' => 'template.default.notFound'
            ]);
        }

        // Stands in for Kirby's `$page->controller()` call, which cannot inject unsaved site content.
        $this->kirby->data = $this->resolveTemplateData($page, 'html');

        // Mirrors Kirby's native rendering pipeline, so hooks fire for the preview as well.
        $this->kirby->data = $this->kirby->apply('page.render:before', [
            'contentType' => 'html',
            'data'        => $this->kirby->data,
            'page'        => $page
        ], 'data');

        $html = $template->render($this->kirby->data);

        return $this->kirby->apply('page.render:after', [
            'contentType' => 'html',
            'data'        => $this->kirby->data,
            'html'        => $html,
            'page'        => $page
        ], 'html');
    }

    /**
     * Resolves the template data for the given page.
     *
     * Modified version of Kirby's `Page::controller()` that injects unsaved
     * content into the `site` model for site-level previews.
     */
    private function resolveTemplateData(Page $page, string $contentType = 'html'): array
    {
        $site = $this->model === 'site'
            ? $this->createPreviewModel($this->kirby->site(), $this->content)
            : $this->kirby->site();

        $data = [
            'kirby' => $this->kirby,
            'site'  => $site,
            'pages' => new LazyValue(fn () => $site->children()),
            'page'  => new LazyValue(fn () => $site->visit($page))
        ];

        $controllerData = $this->kirby->controller(
            $page->template()->name(),
            $data,
            $contentType
        );

        if ($controllerData !== []) {
            $classes = [
                'kirby' => App::class,
                'site'  => Site::class,
                'pages' => Pages::class,
                'page'  => Page::class
            ];

            foreach ($controllerData as $key => $value) {
                $data[$key] = match (true) {
                    array_key_exists($key, $classes) === false => $value,
                    $value instanceof $classes[$key] => $value,
                    default => throw new InvalidArgumentException('The returned variable "' . $key . '" from the controller "' . $page->template()->name() . '" is not of the required type "' . $classes[$key] . '"')
                };
            }
        }

        $data = LazyValue::unwrap($data);

        return $data;
    }

    /**
     * Applies the preview-specific modifications to the rendered HTML.
     */
    private function processHtml(string $html, bool $interactable): string
    {
        $dom = new Dom($html);
        $head = $dom->query('/html/head')[0];

        if (!$head) {
            throw new InvalidArgumentException('The HTML template requires a <head> tag for the live preview. Please check your template.');
        }

        $dom->document()->documentElement->setAttribute('data-preview-mode', 'true');

        // Forwards link clicks and save shortcuts to the Panel in the parent window.
        $script = $dom->document()->createElement('script');
        $script->setAttribute('type', 'module');
        $script->setAttribute('src', $this->plugin->asset('iframe.js')->url());
        $dom->body()->appendChild($script);

        // Relative URLs have to resolve against the site, not the blob URL the Panel renders the preview from.
        if ($head->getElementsByTagName('base')->length === 0) {
            $base = $dom->document()->createElement('base');
            $base->setAttribute('href', $this->kirby->site()->url($this->kirby->languageCode()));
            $head->insertBefore($base, $head->firstChild);
        }

        if (!$interactable) {
            $style = $dom->document()->createElement('style', '* { pointer-events: none !important; }');
            $head->appendChild($style);
        }

        return $dom->toString();
    }

    /**
     * Updates a model's content through the Kirby 5 version API, falling back to
     * the content API for Kirby 4.
     */
    private function updateModelContent(ModelWithContent $model, array $data): void
    {
        if (method_exists($model, 'version')) {
            // Prevents changes from being written to disk during the preview.
            if (!($model->storage() instanceof \Kirby\Content\MemoryStorage)) {
                $model = $model->changeStorage(\Kirby\Content\MemoryStorage::class, copy: true);
            }

            $model->version()->update($data);
        } else {
            $model->content()->update($data);
        }
    }
}
