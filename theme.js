/* lennymadethat.com — color theme picker.
   Themes: shop (default) · steel · blueprint · heritage.
   Persisted in localStorage("lmt-theme"). A tiny inline script in each
   page's <head> applies the saved theme before first paint. */
(function () {
  "use strict";

  var THEMES = [
    { id: "shop", label: "SHOP" },
    { id: "steel", label: "STEEL" },
    { id: "blueprint", label: "BLUEPRINT" },
    { id: "heritage", label: "HERITAGE" }
  ];
  var KEY = "lmt-theme";
  var META_BG = { shop: "#14181B", steel: "#0D1114", blueprint: "#0A1220", heritage: "#12332E" };

  function current() {
    var t = document.documentElement.getAttribute("data-theme");
    return t && THEMES.some(function (x) { return x.id === t; }) ? t : "shop";
  }

  function apply(id) {
    if (id === "shop") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", id);
    try { localStorage.setItem(KEY, id); } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta && META_BG[id]) meta.setAttribute("content", META_BG[id]);
    sync();
  }

  function sync() {
    var t = current();
    var dot = document.querySelector(".themer__dot");
    if (dot) dot.className = "themer__dot themer__swatch--" + t;
    document.querySelectorAll(".themer__swatch").forEach(function (s) {
      s.classList.toggle("is-active", s.getAttribute("data-theme-id") === t);
      s.setAttribute("aria-pressed", s.getAttribute("data-theme-id") === t ? "true" : "false");
    });
  }

  // Build the picker into the nav
  var nav = document.querySelector(".nav");
  if (!nav) return;

  var wrap = document.createElement("div");
  wrap.className = "themer";
  wrap.innerHTML =
    '<button class="themer__btn" type="button" aria-haspopup="true" aria-expanded="false" aria-label="Color theme">'
    + '<span class="themer__dot"></span>'
    + '<span class="themer__label">THEME</span>'
    + "</button>"
    + '<div class="themer__pop" role="menu" aria-label="Color theme">'
    + '<p class="themer__title">COLOR THEME</p>'
    + '<div class="themer__row">'
    + THEMES.map(function (t) {
        return '<button class="themer__swatch themer__swatch--' + t.id + '" type="button" role="menuitem"'
          + ' data-theme-id="' + t.id + '" title="' + t.label + '" aria-label="' + t.label + ' theme"></button>';
      }).join("")
    + "</div></div>";

  // Last in the nav: far right on desktop; CSS `order` places it beside
  // the hamburger on mobile (it stays visible when the menu collapses).
  nav.appendChild(wrap);

  var btn = wrap.querySelector(".themer__btn");
  var pop = wrap.querySelector(".themer__pop");

  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    var open = pop.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  pop.addEventListener("click", function (e) {
    var s = e.target.closest ? e.target.closest("[data-theme-id]") : null;
    if (s) apply(s.getAttribute("data-theme-id"));
  });
  document.addEventListener("click", function (e) {
    if (pop.classList.contains("is-open") && !wrap.contains(e.target)) {
      pop.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && pop.classList.contains("is-open")) {
      pop.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      btn.focus();
    }
  });

  sync();
})();
