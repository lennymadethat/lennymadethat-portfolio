/* lennymadethat.com — product detail page.
   Resolves the product from /products/:slug (CF Pages rewrite) or ?p=slug,
   then renders from the trusted products.js catalog. The URL slug is only
   ever used as a lookup key — never rendered. */
(function () {
  "use strict";

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Mobile nav (same as landing)
  var toggle = document.querySelector(".nav__toggle");
  var menu = document.getElementById("nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Resolve slug: /products/<slug> or ?p=<slug>
  var slug = null;
  var m = location.pathname.match(/products\/([A-Za-z0-9-]+)/);
  if (m) slug = m[1];
  if (!slug) {
    try { slug = new URLSearchParams(location.search).get("p"); } catch (e) {}
  }

  var all = window.PRODUCTS || [];
  var idx = -1;
  for (var i = 0; i < all.length; i++) if (all[i].slug === slug) { idx = i; break; }

  // Unknown slug → go home to the line
  if (idx === -1) { location.replace("/#line"); return; }
  var p = all[idx];
  var st = window.PRODUCT_STATUS[p.status] || window.PRODUCT_STATUS.build;

  document.title = p.name + " — lennymadethat";

  // Hero
  var hero = document.getElementById("p-hero");
  if (hero) {
    hero.innerHTML = ''
      + '<img class="product-hero__logo" src="' + esc(p.logo) + '" alt="' + esc(p.name) + ' logo" width="148" height="148" />'
      + "<div>"
      +   '<p class="product-hero__unit spec">' + esc(p.unit) + " · " + esc(p.kind) + "</p>"
      +   '<h1 class="product-hero__name">' + esc(p.name) + "</h1>"
      +   '<p class="product-hero__hook">' + esc(p.hook) + "</p>"
      +   '<div class="product-hero__status-row">'
      +     '<span class="plate__status ' + st.cls + '">' + esc(st.label) + "</span>"
      +     '<span class="spec">DESIGNED · BUILT · RUN BY ONE PERSON</span>'
      +   "</div>"
      + "</div>";
  }

  // Body
  var what = document.getElementById("p-what");
  if (what) what.textContent = p.what;

  var does = document.getElementById("p-does");
  if (does) does.innerHTML = (p.does || []).map(function (d) { return "<li>" + esc(d) + "</li>"; }).join("");

  var tags = document.getElementById("p-tags");
  if (tags) tags.innerHTML = (p.tags || []).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");

  var cta = document.getElementById("p-cta");
  if (cta && p.cta) {
    var external = /^https?:/i.test(p.cta.href);
    var html = '<a class="btn btn--primary" href="' + esc(p.cta.href) + '"'
      + (external ? ' target="_blank" rel="noopener"' : "")
      + (p.cta.download ? " download" : "")
      + ">" + esc(p.cta.label) + "</a>";
    if (p.source) {
      html += '<a class="btn btn--ghost" href="' + esc(p.source) + '" target="_blank" rel="noopener">View source</a>';
    }
    cta.innerHTML = html;
  }

  // Prev / next unit
  var prev = document.getElementById("p-prev");
  var next = document.getElementById("p-next");
  if (prev && idx > 0) {
    prev.href = "/products/" + esc(all[idx - 1].slug);
    prev.textContent = "← " + all[idx - 1].name;
  }
  if (next) {
    if (idx < all.length - 1) {
      next.href = "/products/" + esc(all[idx + 1].slug);
      next.textContent = all[idx + 1].name + " →";
    } else {
      next.href = "/#shop";
      next.textContent = "The Agent Shop →";
    }
  }
})();
