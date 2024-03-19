<?php

use Kirby\Exception\InvalidArgumentException;
use Kirby\Toolkit\I18n;

return [
    'preview' => [
        'props' => [
            'label' => fn ($label = null) => I18n::translate($label, $label),
            'pointerEvents' => fn ($pointerEvents = true) => $pointerEvents !== false,
            'aspectRatio' => function ($aspectRatio = null) {
                if (is_string($aspectRatio) && !preg_match('!^\d+\/\d+$!', $aspectRatio)) {
                    throw new InvalidArgumentException('Invalid aspect ratio');
                }

                return $aspectRatio;
            },
            'help' => fn ($help = null) => I18n::translate($help, $help),
            'logLevel' => fn ($logLevel = null) => in_array($logLevel, ['error', 'warn', 'info', 'debug'], true) ? $logLevel : 'warn'
        ]
    ]
];
