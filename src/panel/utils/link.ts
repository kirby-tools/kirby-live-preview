import { joinURL } from "ufo";

const PATH_PARAMS_REGEX = /\/[^/:]+:.+$/;

export type PreviewLinkTarget =
  | { type: "external" }
  | { type: "none" }
  | { type: "preview" }
  | { type: "panel"; path: string };

export function resolvePreviewLink(
  url: URL,
  {
    origin,
    siteUrl,
    locales,
  }: { origin: string; siteUrl: string; locales: string[] },
): PreviewLinkTarget {
  const site = new URL(siteUrl, origin);
  const basePath = site.pathname.replace(/\/$/, "");

  if (
    url.origin !== site.origin ||
    !`${url.pathname}/`.startsWith(`${basePath}/`)
  ) {
    return { type: "external" };
  }

  const sitePath = url.pathname.slice(basePath.length) || "/";

  if (
    ["assets", "media"].some((folder) => sitePath.startsWith(`/${folder}/`))
  ) {
    return { type: "none" };
  }

  // A fragment link loads the page, as saved, inside the preview instead of navigating the Panel.
  if (url.hash) {
    return { type: "preview" };
  }

  const parts = sitePath.split("/").filter(Boolean);

  if (parts[0] && locales.includes(parts[0])) {
    parts.shift();
  }

  if (parts.length === 0) {
    return { type: "panel", path: "/site" };
  }

  // Strip Kirby path parameters, like the `tag:sky` in `notes/tag:sky`.
  const path = parts.join("/").replace(PATH_PARAMS_REGEX, "");

  return { type: "panel", path: joinURL("/pages", path.replaceAll("/", "+")) };
}
