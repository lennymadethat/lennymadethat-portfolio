/* The thread — the left-edge line fills as you move through a long read.
   It shows position in the argument, which is a mechanism, not decoration.
   No-JS and reduced-motion visitors simply never see it. */
(function () {
  "use strict";
  var article = document.querySelector(".wp");
  if (!article) return;

  var rail = document.createElement("div");
  rail.className = "wp-thread";
  rail.setAttribute("aria-hidden", "true");
  var fill = document.createElement("div");
  fill.className = "wp-thread__fill";
  rail.appendChild(fill);
  document.body.appendChild(rail);

  var ticking = false;
  function update() {
    ticking = false;
    var box = article.getBoundingClientRect();
    var total = box.height - window.innerHeight;
    if (total <= 0) { fill.style.height = "100%"; return; }
    var passed = Math.min(Math.max(-box.top, 0), total);
    fill.style.height = ((passed / total) * 100).toFixed(2) + "%";
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();
