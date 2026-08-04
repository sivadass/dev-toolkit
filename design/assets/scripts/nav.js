(function () {
  const toggle = document.querySelector("[data-nav-toggle]");
  const sidebar = document.querySelector("[data-nav-sidebar]");
  const backdrop = document.querySelector("[data-nav-backdrop]");
  if (!toggle || !sidebar) return;

  const focusableSelector =
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

  function getFocusable() {
    return Array.from(sidebar.querySelectorAll(focusableSelector)).filter(
      (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true"
    );
  }

  function openNav() {
    document.body.classList.add("nav-open");
    toggle.setAttribute("aria-expanded", "true");
    const focusable = getFocusable();
    (focusable[0] || sidebar).focus();
  }

  function closeNav() {
    document.body.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus();
  }

  function isOpen() {
    return document.body.classList.contains("nav-open");
  }

  toggle.addEventListener("click", function () {
    if (isOpen()) closeNav();
    else openNav();
  });

  if (backdrop) {
    backdrop.addEventListener("click", closeNav);
  }

  document.addEventListener("keydown", function (event) {
    if (!isOpen()) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeNav();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = getFocusable();
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
})();
