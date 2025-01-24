<?php

declare(strict_types = 1);

namespace JohannSchopplich\LivePreview;

use Kirby\Cms\App;
use Kirby\Cms\ModelWithContent;
use Kirby\Cms\Page;
use Kirby\Cms\Pages;
use Kirby\Cms\Plugin;
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
    private readonly Plugin $plugin;
    private readonly string $id;
    private readonly array $content;

    public function __construct(string|null $id)
    {
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
        $this->id = $id;
    }

    /**
     * Renders a preview version of a page with the given content
     */
    public function render(array $content = [], bool $interactable = true): string
    {
        $this->content = $content;

        $previewPage = $this->createPreviewModel($this->page, $this->id === null ? [] : $content);
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
        $site = $this->id === null
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

        $model->content()->update($form->strings());
        $model->content()->update(['previewMode' => 'true']);

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
            $model->content()->update([
                $key => $field->value()
            ]);
        }
    }

    /**
     * Processes the rendered HTML to add preview-specific modifications
     */
    private function processHtml(string $html, bool $interactable): string
    {
        $dom = new Dom($html);
        $head = $dom->query('/html/head')[0];

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
