<?php

use JohannSchopplich\Licensing\Licenses;
use Kirby\Exception\InvalidArgumentException;
use Kirby\Toolkit\I18n;

return [
    'preview' => [
        'props' => [
            'label' => fn ($label = null) => I18n::translate($label, $label),
            'updateInterval' => function ($updateInterval = 250) {
                if ($updateInterval === false) {
                    return false;
                }

                if (!is_int($updateInterval) || $updateInterval < 0) {
                    throw new InvalidArgumentException('Invalid update interval');
                }

                return max($updateInterval, 250);
            },
            'interactable' => fn ($interactable = true) => $interactable !== false,
            'aspectRatio' => function ($aspectRatio = null) {
                if (is_string($aspectRatio) && !preg_match('!^\d+\/\d+$!', $aspectRatio)) {
                    throw new InvalidArgumentException('Invalid aspect ratio');
                }

                return $aspectRatio;
            },
            'help' => fn ($help = null) => I18n::translate($help, $help),
            'logLevel' => fn ($logLevel = null) => in_array($logLevel, ['error', 'warn', 'info', 'debug'], true) ? $logLevel : 'warn'
        ],
        'computed' => [
            'help' => fn () => $this->help ? $this->kirby()->kirbytext($this->model()->toSafeString($this->help)) : null,
            'license' => function () {
                $licenses = Licenses::read('johannschopplich/kirby-live-preview');
                return $licenses->getStatus();
            }
        ]
    ]
];
