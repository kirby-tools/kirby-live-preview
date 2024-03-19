document.addEventListener("click", (event) => {
  const link = event.target.closest("a");

  if (link?.href) {
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
