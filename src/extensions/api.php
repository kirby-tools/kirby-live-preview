<?php

use Kirby\Cms\App;
use Kirby\Exception\NotFoundException;
use Kirby\Form\Form;

return [
    'routes' => fn (App $kirby) => [
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
                    throw new NotFoundException('Page not found');
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

                // Before loading HTML, enable libxml error handling
                libxml_use_internal_errors(true);

                $dom = new \DOMDocument();
                // Fix encoding issue by specifying UTF-8 encoding
                $dom->loadHTML('<?xml encoding="utf-8">' . $html);

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

                // Clear the libxml error buffer
                libxml_clear_errors();
                // Restore the previous state of libxml error handling
                libxml_use_internal_errors(false);

                return [
                    'html' => $html
                ];
            }
        ]
    ]
];
