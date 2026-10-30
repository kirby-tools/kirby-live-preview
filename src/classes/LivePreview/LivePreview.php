<?php

declare(strict_types = 1);

namespace JohannSchopplich\LivePreview;

use Kirby\Cms\App;
use Kirby\Cms\ModelWithContent;
use Kirby\Cms\Page;
use Kirby\Cms\Pages;
use Kirby\Cms\Site;
use Kirby\Content\MemoryStorage;
use Kirby\Exception\InvalidArgumentException;
use Kirby\Exception\NotFoundException;
use Kirby\Form\Form;
use Kirby\Plugin\Plugin;
use Kirby\Toolkit\Dom;
use Kirby\Toolkit\LazyValue;

final class LivePreview
{
    private readonly App $kirby;
    private readonly Plugin $plugin;
    private readonly array $content;

    /**
     * @param $model The model the posted content belongs to
     */
    public function __construct(
        private readonly Page $page,
        private readonly ModelWithContent $model
    ) {
        $kirby = App::instance();
        $plugin = $kirby->plugin('johannschopplich/live-preview');

        if (!$plugin) {
            throw new NotFoundException('Plugin assets not found');
        }

        $this->kirby = $kirby;
        $this->plugin = $plugin;
    }

    public function render(array $content = [], bool $interactable = true): string
    {
        $this->content = $content;

        // The posted content belongs to the edited model, so any other page renders as saved.
        $isEditedPage = $this->model instanceof Page && $this->model->is($this->page);
        $previewPage = $this->createPreviewModel($this->page, $isEditedPage ? $content : []);
        $html = $this->renderTemplate($previewPage);

        return $this->processHtml($html, $interactable);
    }

    private function createPreviewModel(ModelWithContent $model, array $content): Site|Page
    {
        $model = $model->clone();

        $values = Form::for($model, $this->kirby->languageCode())
            ->submit(input: $content)
            ->toStoredValues();

        $this->updateModelContent($model, $values);
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
            throw new NotFoundException(key: 'template.default.notFound');
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
        $site = $this->model instanceof Site
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

    private function updateModelContent(ModelWithContent $model, array $data): void
    {
        // Prevents changes from being written to disk during the preview.
        if (!$model->storage() instanceof MemoryStorage) {
            $model->changeStorage(MemoryStorage::class, copy: true);
        }

        $model->version()->update($data);
    }
}
