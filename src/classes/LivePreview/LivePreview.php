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
// use Kirby\Plugin\Plugin;
use Kirby\Toolkit\Dom;
use Kirby\Toolkit\LazyValue;

final class LivePreview
{
    private readonly App $kirby;
    private readonly Page $page;
    // TODO: Use Kirby 5 plugin class
    // private readonly Plugin $plugin;
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

    /**
     * Renders a preview version of a page with the given content
     */
    public function render(array $content = [], bool $interactable = true): string
    {
        $this->content = $content;

        $previewPage = $this->createPreviewModel($this->page, $this->model === 'site' ? [] : $content);
        $html = $this->renderTemplate($previewPage);

        return $this->processHtml($html, $interactable);
    }

    /**
     * Renders the page template with controller data
     */
    private function renderTemplate(Page $page): string
    {
        $template = $page->template();

        if (!$template->exists()) {
            throw new NotFoundException([
                'key' => 'template.default.notFound'
            ]);
        }

        // The following line is the original code from the `render` method:
        // $this->kirby->data = $page->controller($controllerData, 'html');

        // For live preview of site content, we have to slightly change the `controller` method
        $this->kirby->data = $this->resolveTemplateData($page, 'html');

        return $template->render($this->kirby->data);
    }

    /**
     * Call the page controller
     *
     * @description This is a modified version of the original `controller` method from Kirby's `Page` class to support injecting unsaved content for site-level previews
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

        if (!empty($controllerData)) {
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
     * Creates a preview version of the page with updated content
     */
    private function createPreviewModel(ModelWithContent $model, array $content): Site|Page
    {
        $model = $model->clone();

        $form = Form::for($model, [
            'ignoreDisabled' => true,
            'input' => $content,
            'language' => $this->kirby->languageCode()
        ]);

        $this->updateModelContent($model, $form->strings());
        $this->updateModelContent($model, ['previewMode' => 'true']);

        $this->processWriterFields($model);

        return $model;
    }

    /**
     * Processes writer fields to resolve permalinks
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

    /**
     * Updates a model's content with compatibility for both Kirby 4 and Kirby 5
     */
    private function updateModelContent(ModelWithContent $model, array $data): void
    {
        // Use version API (Kirby 5) if available
        if (method_exists($model, 'version')) {
            // Prevent changes from being written to disk during preview
            if (!($model->storage() instanceof \Kirby\Content\MemoryStorage)) {
                $model = $model->changeStorage(\Kirby\Content\MemoryStorage::class, copy: true);
            }

            // Update content data through the version API
            $model->version()->update($data);
        } else {
            // Fallback for Kirby 4
            $model->content()->update($data);
        }
    }

    /**
     * Processes the rendered HTML to add preview-specific modifications
     */
    private function processHtml(string $html, bool $interactable): string
    {
        $dom = new Dom($html);
        $head = $dom->query('/html/head')[0];

        if (!$head) {
            throw new InvalidArgumentException('The HTML template requires a <head> tag for the live preview. Please check your template.');
        }

        // Add `data-preview-mode` attribute to the root element
        $dom->document()->documentElement->setAttribute('data-preview-mode', 'true');

        // Inject script to catch all links and send them to the parent window
        $script = $dom->document()->createElement('script');
        $script->setAttribute('type', 'module');
        $script->setAttribute('src', $this->plugin->asset('iframe.js')->url());
        $dom->body()->appendChild($script);

        // Inject `<base>` tag for relative URLs
        if ($head->getElementsByTagName('base')->length === 0) {
            $base = $dom->document()->createElement('base');
            $base->setAttribute('href', $this->kirby->site()->url($this->kirby->languageCode()));
            $head->insertBefore($base, $head->firstChild);
        }

        // If interactions should be disabled, disable all pointer events
        if (!$interactable) {
            $style = $dom->document()->createElement('style', '* { pointer-events: none !important; }');
            $head->appendChild($style);
        }

        return $dom->toString();
    }
}
