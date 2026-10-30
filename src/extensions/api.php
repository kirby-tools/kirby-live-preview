<?php

use JohannSchopplich\LivePreview\LivePreview;
use Kirby\Cms\App;

return [
    'routes' => fn (App $kirby) => [
        [
            'pattern' => '__live-preview__/render',
            'method' => 'POST',
            'action' => function () use ($kirby) {
                $request = $kirby->request()->body();
                $preview = new LivePreview(
                    id: $request->get('pageId'),
                    parent: $request->get('parent')
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
        ]
    ]
];
