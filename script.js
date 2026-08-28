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

  // ─────────────── Plate + agent card renderers ───────────────
  function plateHTML(p) {
    var st = window.PRODUCT_STATUS[p.status] || window.PRODUCT_STATUS.build;
    return '<a class="plate" href="/products/' + esc(p.slug) + '">'
      + '<div class="plate__top">'
      +   '<span class="plate__logo-wrap"><img class="plate__logo" src="' + esc(p.logo) + '" alt="" loading="lazy" width="84" height="84" /></span>'
      +   '<span class="plate__status ' + st.cls + '">' + esc(st.label) + "</span>"
      + "</div>"
      + '<h3 class="plate__name">' + esc(p.name) + "</h3>"
      + '<p class="plate__hook">' + esc(p.hook) + "</p>"
      + '<div class="plate__baseline">'
      +   '<span class="plate__unit spec">' + esc(p.unit) + " · " + esc(p.kind) + "</span>"
      +   '<span class="plate__go">OPEN →</span>'
      + "</div>"
    + "</a>";
  }

  function agentLamp(status) {
    if (status === "live") return { cls: "lamp--on", label: "ON THE CLOCK" };
    if (status === "beta") return { cls: "lamp--trial", label: "ON TRIAL" };
    return { cls: "lamp--bench", label: "ON THE BENCH" };
  }

  function agentHTML(p) {
    var lamp = agentLamp(p.status);
    return '<a class="agent-card" href="/products/' + esc(p.slug) + '">'
      + '<span class="agent-card__slot" aria-hidden="true"></span>'
      + '<p class="agent-card__serial spec">' + esc(p.unit) + "</p>"
      + '<span class="agent-card__avatar"><img src="' + esc(p.art || p.logo) + '" alt="" loading="lazy" width="132" height="132" /></span>'
      + '<h3 class="agent-card__name">' + esc(p.name) + "</h3>"
      + '<p class="agent-card__role spec"><span>' + esc(p.kind) + "</span></p>"
      + '<p class="agent-card__hook">' + esc(p.hook) + "</p>"
      + '<p class="agent-card__status spec"><span class="lamp ' + lamp.cls + '"></span>' + lamp.label + "</p>"
    + "</a>";
  }

  function renderSection(id, section, fn) {
    var el = document.getElementById(id);
    if (el && window.PRODUCTS) {
      el.innerHTML = window.PRODUCTS.filter(function (p) { return p.section === section; }).map(fn).join("");
    }
  }
  renderSection("platform-grid", "platform", plateHTML);
  renderSection("agent-grid", "agent", agentHTML);
  renderSection("infra-grid", "infra", plateHTML);

  // ─────────────── Crew clock-in (staggered badge entrance) ───────────────
  (function () {
    var grid = document.getElementById("agent-grid");
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".agent-card"));
    if (!("IntersectionObserver" in window)) {
      cards.forEach(function (c) { c.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var i = cards.indexOf(e.target);
        setTimeout(function () { e.target.classList.add("is-in"); }, (i % 10) * 100);
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -6% 0px" });
    cards.forEach(function (c) { io.observe(c); });
  })();

  // ─────────────── Platform card 3D tilt + spotlight ───────────────
  // Fine-pointer, motion-ok devices only. Sets --rx/--ry (tilt, degrees)
  // and --mx/--my (spotlight position, %) as inline custom properties;
  // the actual transform/gradient math lives in styles.css.
  (function () {
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var finePointer = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reduceMotion || !finePointer) return;

    var MAX_TILT = 7; // degrees
    document.querySelectorAll("#platform-grid .plate").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;   // 0..1
        var py = (e.clientY - r.top) / r.height;   // 0..1
        var rx = (px - 0.5) * 2 * MAX_TILT;         // rotateY driver
        var ry = (0.5 - py) * 2 * MAX_TILT;         // rotateX driver
        card.style.setProperty("--rx", rx.toFixed(2) + "deg");
        card.style.setProperty("--ry", ry.toFixed(2) + "deg");
        card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      });
      card.addEventListener("pointerleave", function () {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  })();

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
