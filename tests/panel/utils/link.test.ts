import { describe, expect, it } from "vitest";
import { resolvePreviewLink } from "../../../src/panel/utils/link";

const options = {
  origin: "https://example.com",
  siteUrl: "https://example.com/sub",
  locales: ["de"],
};

describe("resolvePreviewLink", () => {
  it("strips the base path of a site in a subfolder", () => {
    expect(
      resolvePreviewLink(new URL("https://example.com/sub/de/about"), options),
    ).toEqual({ type: "panel", path: "/pages/about" });
    expect(
      resolvePreviewLink(new URL("https://example.com/sub"), options),
    ).toEqual({ type: "panel", path: "/site" });
    expect(
      resolvePreviewLink(
        new URL("https://example.com/sub/media/a.pdf"),
        options,
      ),
    ).toEqual({ type: "none" });
    expect(
      resolvePreviewLink(new URL("https://example.com/other/page"), options),
    ).toEqual({ type: "external" });
  });

  it("resolves links against a relative site URL", () => {
    expect(
      resolvePreviewLink(new URL("https://example.com/about"), {
        ...options,
        siteUrl: "/",
      }),
    ).toEqual({ type: "panel", path: "/pages/about" });
  });
});
