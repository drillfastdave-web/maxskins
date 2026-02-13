// MaxSkins — canonical main.js
// Filename must remain stable: /assets/js/main.js
// Purpose: lightweight UX helpers + active nav highlighting + (staging) contact form confirmation
(function () {
  const path = (location.pathname || "/").toLowerCase();

  // Determine the "section" from the first path segment
  // "/" -> home, "/features" -> features, "/app/player/" -> app
  const seg = path.split("/").filter(Boolean)[0] || "home";
  const section = seg; // home|features|rules|pricing|contact|app

  // Active link highlighting (supports both nav styles used across pages)
  const allLinks = Array.from(document.querySelectorAll("nav a[href]"));
  allLinks.forEach((a) => {
    const hrefRaw = (a.getAttribute("href") || "").toLowerCase();

    // Only handle site-internal links (/, /features, /app, etc.)
    if (!hrefRaw.startsWith("/")) return;

    const hrefSeg = hrefRaw.split("/").filter(Boolean)[0] || "home";
    const isActive =
      (section === "home" && hrefSeg === "home") ||
      (section !== "home" && hrefSeg === section);

    // Support both class conventions without forcing markup changes
    if (a.classList.contains("nav__link")) {
      a.classList.toggle("is-active", isActive);
    }
    if (a.classList.contains("pill")) {
      a.classList.toggle("active", isActive);
    }

    if (isActive) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });

  // Soft scroll for internal anchors
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (!id || id === "#") return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", id);
  });

  // Contact form (staging): no network call, just local confirmation
  const form = document.querySelector('form[data-contact]');
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn ? btn.textContent : "";
      if (btn) {
        btn.textContent = "Sent (staging)";
        btn.disabled = true;
      }
      const note = document.querySelector('[data-contact-note]');
      if (note) {
        note.textContent =
          "Staging mode: message captured locally only. Wire to email/API when approved.";
      }
      setTimeout(() => {
        if (btn) {
          btn.textContent = original || "Send";
          btn.disabled = false;
        }
      }, 2200);
    });
  }
})();

// === Nav active-state (canonical) ===
(function () {
  try {
    var path = (location.pathname || "/").toLowerCase();
    if (!path.endsWith("/")) path += "/";
    var links = document.querySelectorAll(".nav .nav-link");
    links.forEach(function (a) {
      a.classList.remove("active");
      var href = (a.getAttribute("href") || "/").toLowerCase();
      if (href.length > 1 && !href.endsWith("/")) href += "/";
      if (href === "/" && path === "/") {
        a.classList.add("active");
        return;
      }
      if (href !== "/" && path.startsWith(href)) a.classList.add("active");
    });
  } catch (e) {}
})();
