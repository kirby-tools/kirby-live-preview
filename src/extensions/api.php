<?php

use Kirby\Http\Response;
use Kirby\Form\Form;

return [
    'routes' => fn (\Kirby\Cms\App $kirby) => [
        [
            'pattern' => '__preview__/render',
            'method' => 'POST',
            'action' => function () use ($kirby) {
                $request = $kirby->request();
                $id = $request->get('id', $kirby->site()->homePageId());
                $content = $request->get('content', []);
                $pointerEvents = $request->get('pointerEvents', true);
                $page = $kirby->page($id);

                if (!$page) {
                    return Response::json([
                        'code' => 404,
                        'status' => 'Not Found'
                    ], 404);
                }

                $form = Form::for($page, [
                    'ignoreDisabled' => true,
                    'input' => $content,
                    'language' => $kirby->languageCode()
                ]);

                // Clone the page to inject the new (unsaved) content
                $page = $page->clone();
                $page->content()->update($form->strings());

                $html = $page->render();

                // Inject script to catch all links and send them to the parent window
                $plugin = $kirby->plugin('johannschopplich/live-preview');
                $scriptUrl = $plugin->asset('iframe.js')->url();

                $script = '<script type="module" src="' . $scriptUrl . '"></script>';
                $html = str_replace('</body>', $script . '</body>', $html);

                // If pointer events are disabled, update the document styles
                if (!$pointerEvents) {
                    $html = str_replace(
                        '</head>',
                        '<style>* { pointer-events: none !important; }</style></head>',
                        $html
                    );
                }

                return Response::json([
                    'code' => 200,
                    'status' => 'OK',
                    'result' => [
                        'html' => $html
                    ]
                ], 200);
            }
        ]
    ]
];
