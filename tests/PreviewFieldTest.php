<?php

declare(strict_types = 1);

use JohannSchopplich\LivePreview\PreviewField;
use Kirby\Cms\App;
use Kirby\Exception\InvalidArgumentException;
use Kirby\Exception\NotFoundException;
use Kirby\Toolkit\Str;
use PHPUnit\Framework\Attributes\PreserveGlobalState;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

#[RunTestsInSeparateProcesses]
#[PreserveGlobalState(false)]
final class PreviewFieldTest extends TestCase
{
    #[Test]
    public function toArray_exports_the_preview_options_and_the_license_props(): void
    {
        $props = $this->field([
            'updateInterval' => 1000,
            'aspectRatio' => '16/9'
        ])->toArray();

        $expected = [
            'aspectRatio' => '16/9',
            'licenseDialog' => 'johannschopplich-kirby-live-preview/activate',
            'licenseStatus' => 'inactive',
            'updateInterval' => 1000
        ];

        $this->assertSame($expected, array_intersect_key($props, $expected));
    }

    #[Test]
    public function toArray_leaves_out_an_unset_aspectRatio(): void
    {
        $this->assertArrayNotHasKey('aspectRatio', $this->field()->toArray());
    }

    #[Test]
    public function pageId_falls_back_to_the_edited_page(): void
    {
        $this->assertSame('about', $this->field()->pageId());
    }

    #[Test]
    public function label_falls_back_to_the_plugin_translation_unless_the_blueprint_sets_one(): void
    {
        $this->assertSame('Live Preview', $this->field([
            'name' => 'preview',
            'label' => Str::label('preview')
        ])->label());
        $this->assertSame('Sticky Preview', $this->field(['label' => 'Sticky Preview'])->label());
    }

    #[Test]
    public function updateInterval_lifts_a_short_interval_to_250_and_keeps_false(): void
    {
        $this->assertSame(250, $this->field(['updateInterval' => 100])->updateInterval());
        $this->assertFalse($this->field(['updateInterval' => false])->updateInterval());
    }

    #[Test]
    public function updateInterval_rejects_a_negative_number(): void
    {
        $this->expectException(InvalidArgumentException::class);

        $this->field(['updateInterval' => -1])->updateInterval();
    }

    #[Test]
    public function updateInterval_rejects_a_numeric_string(): void
    {
        $this->expectException(InvalidArgumentException::class);

        $this->field(['updateInterval' => '500'])->updateInterval();
    }

    #[Test]
    public function aspectRatio_rejects_a_colon_ratio(): void
    {
        $this->expectException(InvalidArgumentException::class);

        $this->field(['aspectRatio' => '16:9'])->aspectRatio();
    }

    #[Test]
    public function render_route_renders_the_model_with_the_posted_content(): void
    {
        $html = $this->callRenderRoute(body: ['content' => ['text' => 'Unsaved']]);

        $this->assertStringContainsString('<p>Unsaved</p>', $html);
    }

    #[Test]
    public function render_route_takes_pageId_and_interactable_from_the_blueprint_not_the_body(): void
    {
        $html = $this->callRenderRoute(
            preview: ['pageId' => 'home', 'interactable' => false],
            body: ['pageId' => 'about', 'interactable' => true]
        );

        $this->assertStringContainsString('<p>Saved home</p>', $html);
        $this->assertStringContainsString('pointer-events: none', $html);
    }

    #[Test]
    public function render_route_refuses_a_pageId_the_user_may_not_access(): void
    {
        try {
            $this->callRenderRoute(preview: ['pageId' => 'secret']);
            $this->fail('Expected a NotFoundException');
        } catch (NotFoundException $e) {
            $this->assertSame('error.page.notFound', $e->getKey());
        }
    }

    private function field(array $props = []): PreviewField
    {
        $app = new App([
            'roots' => ['index' => '/dev/null'],
            'site' => [
                'children' => [
                    ['slug' => 'about']
                ]
            ]
        ]);

        return new PreviewField(...[
            'model' => $app->page('about'),
            'name' => 'preview',
            'type' => 'preview',
            ...$props
        ]);
    }

    private function callRenderRoute(array $preview = [], array $body = []): string
    {
        $app = new App([
            'roots' => [
                'index' => '/dev/null',
                'templates' => __DIR__ . '/fixtures/templates'
            ],
            'options' => ['api' => ['allowImpersonation' => true]],
            'blueprints' => [
                'pages/default' => ['fields' => [
                    'text' => ['type' => 'text'],
                    'preview' => ['type' => 'preview', ...$preview]
                ]],
                'pages/secret' => ['options' => ['access' => false]]
            ],
            'roles' => [['name' => 'editor']],
            'users' => [['email' => 'editor@example.com', 'role' => 'editor']],
            'site' => [
                'children' => [
                    ['slug' => 'about', 'content' => ['text' => 'Saved about']],
                    ['slug' => 'home', 'content' => ['text' => 'Saved home']],
                    ['slug' => 'secret', 'template' => 'secret', 'content' => ['text' => 'Saved secret']]
                ]
            ]
        ]);

        $app->impersonate('editor@example.com');

        return $app->api()->call('pages/about/fields/preview/render', 'POST', ['body' => $body])['data'];
    }
}
