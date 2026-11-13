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

  it("keeps a fragment link in the preview only for a page of the site", () => {
    expect(
      resolvePreviewLink(
        new URL("https://example.com/sub/about#team"),
        options,
      ),
    ).toEqual({ type: "preview" });
    expect(
      resolvePreviewLink(new URL("https://other.example/#team"), options),
    ).toEqual({ type: "external" });
    expect(
      resolvePreviewLink(
        new URL("https://example.com/sub/media/a.pdf#page=2"),
        options,
      ),
    ).toEqual({ type: "none" });
  });
});
