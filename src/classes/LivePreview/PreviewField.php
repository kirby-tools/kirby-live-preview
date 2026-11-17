<?php

declare(strict_types = 1);

namespace JohannSchopplich\LivePreview;

use Kirby\Api\Api;
use Kirby\Exception\InvalidArgumentException;
use Kirby\Form\Field\DisplayField;
use Kirby\Reflection\Attributes\Prop;
use Kirby\Toolkit\Str;

final class PreviewField extends DisplayField
{
    #[Prop(computed: true, export: false)]
    protected string|null $pageId = null;

    /**
     * `mixed`, so a string like `"500"` reaches the getter as a string and is
     * rejected instead of coerced.
     */
    #[Prop(computed: true)]
    protected mixed $updateInterval = 500;

    #[Prop(export: false)]
    protected bool $interactable = true;

    #[Prop(computed: true)]
    protected string|null $aspectRatio = null;

    #[Prop(computed: true)]
    protected string $licenseStatus = 'inactive';

    #[Prop(computed: true)]
    protected string $licenseDialog = '';

    public function api(): array
    {
        $field = $this;

        return [
            [
                'pattern' => 'render',
                'method' => 'POST',
                'action' => function () use ($field): array {
                    /** @var Api $api */
                    $api = $this;

                    // `Api::page()` 404s on a page the user may not access, the check the model in the URL already passed.
                    $page = $api->page($field->pageId() ?? $api->site()->homePageId());
                    $preview = new LivePreview(page: $page, model: $field->model());

                    return [
                        'status' => 'ok',
                        'code' => 200,
                        'data' => $preview->render(
                            content: $api->requestBody('content', []),
                            interactable: $field->interactable()
                        )
                    ];
                }
            ]
        ];
    }

    public function label(): string
    {
        // The blueprint normalizer sets the label to `Str::label()` of the key when
        // none is given, so that value counts as unset.
        if ($this->label === null || $this->label === Str::label($this->name ?? '')) {
            return $this->i18n('johannschopplich.preview.label');
        }

        return parent::label();
    }

    public function pageId(): string|null
    {
        return $this->pageId ?? $this->model()->id();
    }

    public function interactable(): bool
    {
        return $this->interactable;
    }

    public function updateInterval(): int|false
    {
        if ($this->updateInterval === false) {
            return false;
        }

        if (!is_int($this->updateInterval) || $this->updateInterval < 0) {
            throw new InvalidArgumentException(message: 'Invalid update interval');
        }

        return max($this->updateInterval, 250);
    }

    public function aspectRatio(): string|null
    {
        if ($this->aspectRatio !== null && !preg_match('!^\d+\/\d+$!', $this->aspectRatio)) {
            throw new InvalidArgumentException(message: 'Invalid aspect ratio');
        }

        return $this->aspectRatio;
    }

    public function licenseStatus(): string
    {
        return Licensing::status();
    }

    public function licenseDialog(): string
    {
        return Licensing::dialog();
    }
}
