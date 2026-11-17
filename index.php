<?php

use JohannSchopplich\LivePreview\Licensing;
use JohannSchopplich\LivePreview\PreviewField;
use Kirby\Cms\App as Kirby;
use Kirby\Exception\LogicException;
use KirbyTools\Licensing\LicensePanel;
use KirbyTools\Licensing\PluginLicense;

if (version_compare(Kirby::version() ?? '0', '6.0.0-beta', '<')) {
    throw new LogicException('Kirby Live Preview requires Kirby 6');
}

@include_once __DIR__ . '/vendor/autoload.php';

Kirby::plugin(
    name: 'johannschopplich/live-preview',
    extends: [
        'areas' => [
            'system' => fn () => [
                'dialogs' => LicensePanel::dialogs(Licensing::PACKAGE_NAME, 'Kirby Live Preview')
            ]
        ],
        'fields' => [
            'preview' => PreviewField::class
        ],
        'translations' => require __DIR__ . '/src/extensions/translations.php'
    ],
    license: fn ($plugin) => new PluginLicense($plugin, Licensing::PACKAGE_NAME)
);
