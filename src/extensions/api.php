<?php

use Kirby\Exception\NotFoundException;
use Kirby\Form\Form;
use Kirby\Http\Response;

return [
    'routes' => fn (\Kirby\Cms\App $kirby) => [
        [
            'pattern' => '__live-preview__/render',
            'method' => 'POST',
            'action' => function () use ($kirby) {
                $request = $kirby->request();
                $id = $request->get('id', $kirby->site()->homePageId());
                $content = $request->get('content', []);
                $interactable = $request->get('interactable', true);
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

                if (!$plugin) {
                    throw new NotFoundException('Plugin assets not found');
                }

                $scriptUrl = $plugin->asset('iframe.js')->url();

                $dom = new \DOMDocument();
                @$dom->loadHTML($html);

                $body = $dom->getElementsByTagName('body')->item(0);
                $script = $dom->createElement('script');
                $script->setAttribute('type', 'module');
                $script->setAttribute('src', $scriptUrl);
                $body->appendChild($script);

                $head = $dom->getElementsByTagName('head')->item(0);

                if (!$head) {
                    throw new NotFoundException('Head tag not found');
                }

                // Inject `<base>` tag for relative URLs
                if (!$head->getElementsByTagName('base')->length) {
                    $base = $dom->createElement('base');
                    $base->setAttribute('href', $kirby->site()->url($kirby->languageCode()));
                    $head->insertBefore($base, $head->firstChild);
                }

                // If pointer events are disabled, update the document styles
                if (!$interactable) {
                    $style = $dom->createElement('style', '* { pointer-events: none !important; }');
                    $head->appendChild($style);
                }

                $html = $dom->saveHTML();

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
