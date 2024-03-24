<?php

use Kirby\Cms\App;
use Kirby\Exception\NotFoundException;
use Kirby\Form\Form;
use Kirby\Toolkit\Dom;

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
                $plugin = $kirby->plugin('johannschopplich/live-preview');

                if (!$page) {
                    throw new NotFoundException('Page not found');
                }

                if (!$plugin) {
                    throw new NotFoundException('Plugin assets not found');
                }

                $form = Form::for($page, [
                    'ignoreDisabled' => true,
                    'input' => $content,
                    'language' => $kirby->languageCode()
                ]);

                // Clone the page to inject the new (unsaved) content
                $page = $page->clone();
                $page->content()->update($form->strings());
                $page->content()->update(['previewmode' => true]);

                // Find all `writer` fields
                $writerFields = array_filter(
                    $page->blueprint()->fields(),
                    fn ($field) => $field['type'] === 'writer'
                );

                // Replace all permalinks with a resolved URL to allow for
                // preview to Panel page redirects
                foreach (array_keys($writerFields) as $key) {
                    $field = $page->content()->get($key);
                    $field = $field->permalinksToUrls();
                    $page->content()->update([
                        $key => $field->value()
                    ]);
                }

                // Render the page as HTML
                $html = $page->render();

                $dom = new Dom($html);
                $html = $dom->document()->documentElement;
                $head = $dom->query('/html/head')[0];

                // Add `data-preview-mode` attribute to the root element
                $html->setAttribute('data-preview-mode', 'true');

                // Inject script to catch all links and send them to the parent window
                $script = $dom->document()->createElement('script');
                $script->setAttribute('type', 'module');
                $script->setAttribute('src', $plugin->asset('iframe.js')->url());
                $dom->body()->appendChild($script);

                // Inject `<base>` tag for relative URLs
                if (!$head->getElementsByTagName('base')->length) {
                    $base = $dom->document()->createElement('base');
                    $base->setAttribute('href', $kirby->site()->url($kirby->languageCode()));
                    $head->insertBefore($base, $head->firstChild);
                }

                // If iframe interactions are disabled, overwrite pointer events
                if (!$interactable) {
                    $style = $dom->document()->createElement('style', '* { pointer-events: none !important; }');
                    $head->appendChild($style);
                }

                $html = $dom->toString();

                return [
                    'html' => $html
                ];
            }
        ]
    ]
];
