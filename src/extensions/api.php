<?php

use JohannSchopplich\Licensing\Licenses;
use JohannSchopplich\LivePreview\LivePreview;
use Kirby\Cms\App;

return [
    'routes' => fn (App $kirby) => [
        [
            'pattern' => '__live-preview__/context',
            'method' => 'GET',
            'action' => function () {
                $licenses = Licenses::read('johannschopplich/kirby-live-preview');

                return [
                    'licenseStatus' => $licenses->getStatus()
                ];
            }
        ],
        [
            'pattern' => '__live-preview__/render',
            'method' => 'POST',
            'action' => function () use ($kirby) {
                $request = $kirby->request()->body();
                $preview = new LivePreview(
                    id: $request->get('id')
                );

                $html = $preview->render(
                    content: $request->get('content', []),
                    interactable: $request->get('interactable', true)
                );

                return [
                    'status' => 'ok',
                    'code' => 200,
                    'data' => $html
                ];
            }
        ],
        [
            'pattern' => '__live-preview__/activate',
            'method' => 'POST',
            'action' => function () {
                $licenses = Licenses::read('johannschopplich/kirby-live-preview');
                return $licenses->activateFromRequest();
            }
        ]
    ]
];
