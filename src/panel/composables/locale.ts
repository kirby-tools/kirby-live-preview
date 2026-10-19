import { usePanel } from "kirbyuse";
import { withLeadingSlash } from "ufo";

export function useLocale() {
  const panel = usePanel();
  const locales = panel.languages.map((language) => language.code);

  const getNonLocalizedPath = (url: string | URL) => {
    const _url = url instanceof URL ? url : new URL(url);
    const parts = _url.pathname.split("/").filter(Boolean);

    if (parts[0] && locales.includes(parts[0])) {
      parts.shift();
    }

    return withLeadingSlash(parts.join("/"));
  };

  return {
    locales,
    getNonLocalizedPath,
  };
}
