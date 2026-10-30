<?php

declare(strict_types = 1);

namespace JohannSchopplich\LivePreview;

use Kirby\Exception\InvalidArgumentException;
use Kirby\Form\Field\DisplayField;
use Kirby\Reflection\Attributes\Prop;
use Kirby\Toolkit\Str;

final class PreviewField extends DisplayField
{
    private const UPDATE_STRATEGIES = ['interval', 'blur'];

    #[Prop(computed: true)]
    protected string|null $pageId = null;

    #[Prop(computed: true)]
    protected string $updateStrategy = 'interval';

    /**
     * `mixed`, so a string like `"500"` reaches the getter as a string and is
     * rejected instead of coerced.
     */
    #[Prop(computed: true)]
    protected mixed $updateInterval = 500;

    #[Prop]
    protected bool $interactable = true;

    #[Prop(computed: true)]
    protected string|null $aspectRatio = null;

    #[Prop(computed: true)]
    protected string $licenseStatus = 'inactive';

    #[Prop(computed: true)]
    protected string $licenseDialog = '';

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

    public function updateStrategy(): string
    {
        if (!in_array($this->updateStrategy, self::UPDATE_STRATEGIES, true)) {
            throw new InvalidArgumentException(
                message: 'Invalid update strategy "' . $this->updateStrategy . '", expected one of: ' . implode(', ', self::UPDATE_STRATEGIES)
            );
        }

        return $this->updateStrategy;
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
