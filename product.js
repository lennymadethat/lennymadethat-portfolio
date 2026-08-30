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
      + '<img class="product-hero__logo' + (p.art ? " product-hero__logo--round" : "") + '" src="' + esc(p.art || p.logo) + '" alt="' + esc(p.name) + '" width="148" height="148" />'
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

  /* ── depth sections (2026-08-29) ───────────────────────────────────────
     Every one is opt-in per product: no data, section stays hidden. That is
     what lets the depth roll out product by product instead of needing all
     21 written before any of it can ship. ── */
  function show(id) {
    var el = document.getElementById(id);
    if (el) el.hidden = false;
  }
  function fill(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  if (p.numbers && p.numbers.length) {
    document.getElementById("p-numbers").innerHTML = p.numbers.map(function (n) {
      return '<li class="product-numbers__item">'
        + '<span class="product-numbers__v">' + esc(n.v) + "</span>"
        + '<span class="product-numbers__l spec">' + esc(n.l) + "</span>"
        + "</li>";
    }).join("");
    show("p-numbers-sec");
  }

  if (p.problem) { fill("p-problem", p.problem); show("p-problem-sec"); }

  if (p.how && p.how.length) {
    document.getElementById("p-how").innerHTML = p.how.map(function (h) {
      return '<li class="how-step">'
        + '<h3 class="how-step__t">' + esc(h.t) + "</h3>"
        + '<p class="how-step__d">' + esc(h.d) + "</p>"
        + "</li>";
    }).join("");
    show("p-how-sec");
    if (p.howImage) {
      var im = document.getElementById("p-how-img");
      im.src = p.howImage;
      im.alt = "How " + p.name + " works";
      document.getElementById("p-how-fig").hidden = false;
    }
  }

  if (p.decision && p.decision.q) {
    fill("p-decision-q", p.decision.q);
    fill("p-decision-a", p.decision.a || "");
    show("p-decision-sec");
  }

  if (p.breaks) { fill("p-breaks", p.breaks); show("p-breaks-sec"); }

  if (p.stack && p.stack.length) {
    document.getElementById("p-stack").innerHTML = p.stack.map(function (t) {
      return "<li>" + esc(t) + "</li>";
    }).join("");
    show("p-stack-sec");
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
