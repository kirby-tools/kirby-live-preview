<?php

use JohannSchopplich\Licensing\PluginLicenseExtensions;

return array_replace_recursive(
    PluginLicenseExtensions::translations(),
    [
        'en' => [
            'johannschopplich.preview.label' => 'Live Preview',
            'johannschopplich.preview.error.render' => 'Preview failed'
        ],
        'de' => [
            'johannschopplich.preview.label' => 'Live-Vorschau',
            'johannschopplich.preview.error.render' => 'Vorschau fehlgeschlagen'
        ],
        'fr' => [
            'johannschopplich.preview.label' => 'Aperçu en direct',
            'johannschopplich.preview.error.render' => 'Aperçu échoué'
        ],
        'nl' => [
            'johannschopplich.preview.label' => 'Live voorbeeld',
            'johannschopplich.preview.error.render' => 'Voorbeeld mislukt'
        ]
    ]
);
