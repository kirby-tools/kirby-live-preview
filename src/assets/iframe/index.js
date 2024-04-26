// Pass any link clicks to the parent window
document.addEventListener("click", (event) => {
  const link = event.target.closest("a");

  if (link?.href) {
    // Ignore same-page links
    if (link.href === window.location.href) {
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
