# Kirby Live Preview

Commercial Kirby CMS Panel plugin with a section that renders the current page, unsaved changes included, in an iframe. The server renders the HTML; the Panel shows it from a blob URL.

## Commands

```bash
composer csfix            # php-cs-fixer, lives in tools/phpcs/vendor/bin/, not vendor/bin/
pnpm run test:types       # typecheck with tsc, which does not reach .vue files
pnpm run lint             # ESLint
pnpm run build            # build the Panel bundle (index.js / index.css)
pnpm run build:assets     # build the script injected into the preview (assets/iframe.js)
```

There is no PHP test suite in this repo.

## Conventions

- `__PLAYGROUND__` is a build-time constant defined in `kirbyup.config.js`.
- `src/assets/iframe/` runs inside the rendered page, not the Panel: it forwards link clicks and Cmd/Ctrl+S to the section through `postMessage`.
- `previewMode()` is a content field the preview sets on its clone of the model, so templates read it like any field.

## Search Hints

- `__live-preview__/render` – API route that renders a page with the posted content
- `processHtml` – adds `data-preview-mode`, the iframe script and a `<base>` to the rendered HTML
- `handleMessage` – the section's side of the iframe messages
