/* lennymadethat.com — landing page JS. No dependencies.
   Renders THE LINE and THE AGENT SHOP from products.js. */
(function () {
  "use strict";

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ─────────────── Mobile nav ───────────────
  var toggle = document.querySelector(".nav__toggle");
  var menu = document.getElementById("nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // ─────────────── THE LINE grid ───────────────
  var grid = document.getElementById("line-grid");
  if (grid && window.PRODUCTS) {
    grid.innerHTML = window.PRODUCTS.map(function (p) {
      var st = window.PRODUCT_STATUS[p.status] || window.PRODUCT_STATUS.build;
      return '<a class="plate" href="/products/' + esc(p.slug) + '">'
        + '<div class="plate__top">'
        +   '<img class="plate__logo" src="' + esc(p.logo) + '" alt="" loading="lazy" width="84" height="84" />'
        +   '<span class="plate__status ' + st.cls + '">' + esc(st.label) + "</span>"
        + "</div>"
        + '<h3 class="plate__name">' + esc(p.name) + "</h3>"
        + '<p class="plate__hook">' + esc(p.hook) + "</p>"
        + '<div class="plate__baseline">'
        +   '<span class="plate__unit spec">' + esc(p.unit) + " · " + esc(p.kind) + "</span>"
        +   '<span class="plate__go">OPEN →</span>'
        + "</div>"
      + "</a>";
    }).join("");
  }

  // ─────────────── THE AGENT SHOP ───────────────
  var shop = document.getElementById("shop-grid");
  if (shop && window.SHOP) {
    shop.innerHTML = window.SHOP.map(function (k) {
      var ctas = "";
      if (k.kit) {
        ctas += '<a class="shop-btn shop-btn--dl" href="' + esc(k.kit) + '" download>DOWNLOAD KIT</a>';
      }
      if (k.href) {
        ctas += '<a class="shop-btn shop-btn--dl" href="' + esc(k.href) + '" target="_blank" rel="noopener">GET ON GITHUB</a>';
      }
      if (k.page) {
        ctas += '<a class="shop-btn shop-btn--page" href="/products/' + esc(k.page) + '">FULL PAGE</a>';
      }
      return '<div class="shop-card">'
        + '<div class="shop-card__head">'
        +   '<span class="shop-card__name">' + esc(k.name) + "</span>"
        +   '<span class="shop-card__price spec">' + esc(k.price) + "</span>"
        + "</div>"
        + '<p class="shop-card__desc">' + esc(k.desc) + "</p>"
        + '<div class="shop-card__ctas">' + ctas + "</div>"
      + "</div>";
    }).join("");
  }

  // ─────────────── Live engine readout (proof) ───────────────
  (function () {
    var box = document.getElementById("live-engine");
    var line = document.getElementById("live-engine-line");
    if (!box || !line) return;
    var EP = "https://hyt-data.ianleonard1988.workers.dev/market";
    var ctrl, timer;
    try { ctrl = new AbortController(); timer = setTimeout(function () { try { ctrl.abort(); } catch (e) {} }, 6000); } catch (e) {}
    fetch(EP, ctrl ? { signal: ctrl.signal } : {})
      .then(function (r) { if (!r.ok) throw new Error("http"); return r.json(); })
      .then(function (m) {
        if (timer) clearTimeout(timer);
        if (!m || m.total == null || m.stage2 == null) throw new Error("shape");
        var nf = function (n) { return Number(n).toLocaleString(); };
        line.innerHTML =
          "<strong>" + nf(m.stage2) + "</strong> stocks are in a confirmed uptrend right now — "
          + "<strong>" + Number(m.pct_above_sma200) + "%</strong> of the market sits above its 200-day average, "
          + "across <strong>" + nf(m.total) + "</strong> names tracked.";
        var asof = box.querySelector(".live-engine__asof");
        if (asof && m.as_of_date) asof.textContent = m.as_of_date;
        box.hidden = false;
      })
      .catch(function () { if (timer) clearTimeout(timer); /* stay hidden — never show broken */ });
  })();
})();
