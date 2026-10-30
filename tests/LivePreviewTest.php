<?php

declare(strict_types = 1);

use JohannSchopplich\LivePreview\LivePreview;
use Kirby\Cms\App;
use Kirby\Exception\InvalidArgumentException;
use Kirby\Exception\NotFoundException;
use PHPUnit\Framework\Attributes\PreserveGlobalState;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

#[RunTestsInSeparateProcesses]
#[PreserveGlobalState(false)]
final class LivePreviewTest extends TestCase
{
    #[Test]
    public function render_shows_the_unsaved_content_of_the_edited_page(): void
    {
        $this->bootApp();

        $html = (new LivePreview(id: 'about', parent: 'pages/about'))->render(['text' => 'Unsaved']);

        $this->assertStringContainsString('<p>Unsaved</p>', $html);
    }

    #[Test]
    public function render_shows_another_page_as_saved(): void
    {
        $this->bootApp();

        $html = (new LivePreview(id: 'home', parent: 'pages/about'))->render(['text' => 'Unsaved']);

        $this->assertStringContainsString('<p>Saved home</p>', $html);
    }

    #[Test]
    public function render_shows_the_unsaved_site_content_on_the_site_view(): void
    {
        $this->bootApp();

        $html = (new LivePreview(id: null, parent: 'site'))->render(['title' => 'Unsaved Site']);

        $this->assertStringContainsString('<title>Unsaved Site</title>', $html);
        $this->assertStringContainsString('<h1>Home</h1>', $html);
    }

    #[Test]
    public function render_adds_the_base_url_and_the_iframe_script(): void
    {
        $app = $this->bootApp();

        $html = (new LivePreview(id: 'about', parent: 'pages/about'))->render();

        $this->assertStringContainsString('<html data-preview-mode="true">', $html);
        $this->assertStringContainsString('<base href="https://example.com">', $html);
        $this->assertStringContainsString(
            '<script type="module" src="' . $app->plugin('johannschopplich/live-preview')->asset('iframe.js')->url() . '"></script>',
            $html
        );
        $this->assertStringNotContainsString('pointer-events', $html);
    }

    #[Test]
    public function render_blocks_pointer_events_unless_interactable(): void
    {
        $this->bootApp();

        $html = (new LivePreview(id: 'about', parent: 'pages/about'))->render(interactable: false);

        $this->assertStringContainsString('<style>* { pointer-events: none !important; }</style>', $html);
    }

    #[Test]
    public function render_rejects_a_template_without_head(): void
    {
        $this->bootApp(['site' => ['children' => [['slug' => 'about', 'template' => 'headless']]]]);

        $this->expectException(InvalidArgumentException::class);

        (new LivePreview(id: 'about', parent: 'pages/about'))->render();
    }

    #[Test]
    public function render_reports_a_missing_template_with_kirbys_key(): void
    {
        $this->bootApp(['roots' => ['templates' => __DIR__]]);

        try {
            (new LivePreview(id: 'about', parent: 'pages/about'))->render();
            $this->fail('Expected a NotFoundException');
        } catch (NotFoundException $e) {
            $this->assertSame('error.template.default.notFound', $e->getKey());
        }
    }

    private function bootApp(array $props = []): App
    {
        $app = new App(array_replace_recursive([
            'roots' => [
                'index' => '/dev/null',
                'templates' => __DIR__ . '/fixtures/templates'
            ],
            'urls' => ['index' => 'https://example.com'],
            'blueprints' => [
                'pages/default' => ['fields' => ['text' => ['type' => 'text']]]
            ],
            'site' => [
                'content' => ['title' => 'Saved Site'],
                'children' => [
                    ['slug' => 'about', 'content' => ['title' => 'About', 'text' => 'Saved about']],
                    ['slug' => 'home', 'content' => ['title' => 'Home', 'text' => 'Saved home']]
                ]
            ]
        ], $props));

        $app->impersonate('kirby');

        return $app;
    }
}
