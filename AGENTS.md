# Kirby Live Preview

Commercial Kirby CMS Panel plugin with a field that renders the current page, unsaved changes included, in an iframe. The server renders the HTML; the Panel shows it from a blob URL.

## Commands

```bash
composer test
composer csfix            # lives in tools/phpcs/vendor/bin/, not vendor/bin/
pnpm test --run
pnpm run test:types
pnpm run lint
pnpm run build            # after a change in src/panel/; index.js and index.css are committed
pnpm run build:assets     # after a change in src/assets/iframe/; assets/iframe.js is committed
```

## Conventions

- `__PLAYGROUND__` is a build-time constant defined in `kirbyup.config.js`.
- `src/panel/site.ts` feeds kirby.tools' Panel mocks.
- `src/assets/iframe/` runs inside the rendered page, not the Panel: it forwards link clicks and Cmd/Ctrl+S to the field through `postMessage`.
- `previewMode()` is a content field the preview sets on its clone of the model, so templates read it like any field.
