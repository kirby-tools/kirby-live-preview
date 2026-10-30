<?php

declare(strict_types = 1);

use JohannSchopplich\LivePreview\PreviewField;
use Kirby\Cms\App;
use Kirby\Exception\InvalidArgumentException;
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
            'pageId' => 'home',
            'updateStrategy' => 'blur',
            'updateInterval' => 1000,
            'interactable' => false,
            'aspectRatio' => '16/9'
        ])->toArray();

        $expected = [
            'aspectRatio' => '16/9',
            'interactable' => false,
            'licenseDialog' => 'johannschopplich-kirby-live-preview/activate',
            'licenseStatus' => 'inactive',
            'pageId' => 'home',
            'updateInterval' => 1000,
            'updateStrategy' => 'blur'
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
    public function updateStrategy_rejects_an_unknown_strategy(): void
    {
        $this->expectException(InvalidArgumentException::class);

        $this->field(['updateStrategy' => 'foo'])->updateStrategy();
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
}
