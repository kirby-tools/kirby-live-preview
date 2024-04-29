// Pass any link clicks to the parent window
document.addEventListener("click", (event) => {
  const link = event.target.closest("a");

  if (link?.href) {
    const url = tryParseUrl(link.href);

    if (!url) {
      return;
    }

    // Ignore links with the same path
    if (url.pathname === location.pathname) {
      return;
    }

    // Ignore links that contain a `data-preview-ignore` attribute
    if (link.dataset.previewIgnore !== undefined) {
      return;
    }

    event.preventDefault();
    window.parent.postMessage(
      {
        type: "link",
        href: link.href,
      },
      "*",
    );
  }
});

// Catch all Cmd+S events and pass them to the parent window
document.addEventListener("keydown", (event) => {
  if (event.key === "s" && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();
    window.parent.postMessage(
      {
        type: "save",
      },
      "*",
    );
  }
});

function tryParseUrl(url) {
  try {
    return new URL(url);
  } catch {
    return undefined;
  }
}
