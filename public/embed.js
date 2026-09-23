// Agentic Engineering LMS — embeddable launcher widget.
//
// One company pastes exactly this into their own portal:
//
//   <script src="https://<this-app's-host>/embed.js" data-company="their-slug" async></script>
//
// No build step, no dependencies, no per-company code on our side —
// the same static file works for company #1 or #100, driven entirely
// by the data-company slug. Renders a single button; clicking it opens
// this app's company-branded login page (/login/:slug) in a new tab.
// A new tab, not an iframe, so nothing here needs the host page's CSP
// to allow-list our origin, and there's no third-party-cookie-in-an-
// iframe login problem to solve for every company that embeds this.
// See docs/features/0016-embed-widget.md.
(function () {
  var current =
    document.currentScript ||
    (function () {
      var scripts = document.querySelectorAll("script[data-company]");
      return scripts[scripts.length - 1];
    })();
  if (!current) return;

  var company = current.getAttribute("data-company");
  if (!company) return;

  var origin;
  try {
    origin = new URL(current.src, window.location.href).origin;
  } catch {
    return;
  }

  var label = current.getAttribute("data-label") || "Launch Training Portal";

  var button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.style.cssText = [
    "font: 600 14px/1.2 system-ui, -apple-system, sans-serif",
    "padding: 10px 18px",
    "border-radius: 8px",
    "border: none",
    "background: #2f81f7",
    "color: #fff",
    "cursor: pointer",
  ].join(";");
  button.addEventListener("click", function () {
    window.open(
      origin + "/login/" + encodeURIComponent(company),
      "_blank",
      "noopener",
    );
  });

  current.insertAdjacentElement("afterend", button);
})();
