/* ============================================================
   PlayLetter scroll section — six beats, scrubbed by the scroll.
   Beats: threshold, the flood, the snap, Lily, the writer rail, landing.

   Two modes, one build:
   · DEFAULT (silent) — the section is scroll-driven. Lily's pitch renders
     as karaoke text, words lighting as you scroll. Browsers block autoplay
     audio, so this is the only mode that can start on its own.
   · VOICE (tap) — when a Lily voice file exists, the play button appears;
     tapping it plays her real voice and drives both the karaoke and the
     page scroll from the audio clock. The forced tap IS the demo.

   Fails soft on purpose. If GSAP or Lenis do not load, or the visitor asks
   for reduced motion, the section drops to `.pl-static`: every beat stacked,
   readable, no pinning, no 640vh empty shaft.
   ============================================================ */
(function () {
  "use strict";

  var root = document.querySelector(".pl-scroll");
  if (!root) return;

  /* ── Content ────────────────────────────────────────────────
     Lily's pitch — one of five drafted variants. `~` marks a word that
     lights mint (the product nouns) instead of white. */
  var LILY_LINE =
    "Forward your newsletters to your ~PlayLetter address and I'll read them " +
    "out loud. Or pick from ~847 already in the library. I'm ~Lily. Press play.";

  /* Set this to the voice file once Lily's VO is rendered, e.g.
     "/audio/lily-pitch.mp3". Left null on purpose: a play button that
     cannot play is a lie, and probing a file that is not there would 404
     on every load of the live site. */
  var LILY_AUDIO = null;

  /* Per-word start times in seconds, from PlayLetter's own forced aligner —
     the same alignment step that powers read-along in the app. Null = fall
     back to an even spread across the clip's duration. */
  var LILY_WORD_TIMES = null;

  /* Beat 2 — the flood. Neutral, invented publication names: real mastheads
     in a promo are somebody else's trademark. */
  var NOTIS = [
    { i: "MB", t: "Morning Brief", d: "The 7 things that moved overnight", w: "7:02" },
    { i: "TL", t: "The Long Read", d: "Nobody is coming to fix the grid", w: "7:14" },
    { i: "SD", t: "Sunday Dispatch", d: "Issue #212 — the quiet part", w: "7:26" },
    { i: "PX", t: "Pixels & Ink", d: "Five typefaces worth stealing", w: "7:41" },
    { i: "TK", t: "Ticker Talk", d: "Why the yield curve stopped mattering", w: "8:03" },
    { i: "FW", t: "Field Work", d: "A week inside a fulfilment centre", w: "8:19" },
    { i: "OS", t: "Off Switch", d: "How to actually stop working at 6", w: "8:44" },
    { i: "HC", t: "Hard Copy", d: "The book everyone lied about finishing", w: "9:07" },
    { i: "NW", t: "Nightwatch", d: "3 stories the feeds buried today", w: "9:31" }
  ];

  /* Beat 5 — the writer rail. The category on each card is one of
     PlayLetter's real 14. */
  var RAIL = [
    ["Morning Brief", "News & Politics"], ["The Long Read", "Media & Culture"],
    ["Sunday Dispatch", "Writing"], ["Pixels & Ink", "Design"],
    ["Ticker Talk", "Markets & Finance"], ["Field Work", "Business"],
    ["Off Switch", "Productivity & Self"], ["Hard Copy", "Media & Culture"],
    ["Nightwatch", "News & Politics"], ["Cold Start", "Startups"],
    ["Signal Path", "Tech"], ["The Bench", "Science"],
    ["Ledger Notes", "Crypto"], ["Rest Day", "Health & Fitness"]
  ];

  /* Beat 5 — the real counters (Lenny, 2026-09-01). */
  var COUNTS = [
    { n: 847, l: "Newsletters" },
    { n: 7645, l: "Episodes voiced" },
    { n: 14, l: "Categories" }
  ];

  var esc = function (s) { return String(s).replace(/&(?!amp;)/g, "&amp;"); };
  var comma = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ","); };

  /* ── Build the markup the section needs but does not ship in HTML ──
     The HTML holds the copy a crawler must see. Everything below is
     decoration, so it is built here and never blocks the content. */

  // Beat 1 — envelopes
  var envWrap = root.querySelector(".pl-envelopes");
  var envs = [];
  if (envWrap) {
    for (var e = 0; e < 14; e++) {
      var env = document.createElement("div");
      env.className = "pl-env";
      env.style.left = (4 + Math.random() * 90).toFixed(1) + "%";
      envWrap.appendChild(env);
      envs.push(env);
    }
  }

  // Beat 2 — notification banners
  var notis = root.querySelector(".pl-notis");
  var notiEls = [];
  if (notis) {
    notis.innerHTML = NOTIS.map(function (n) {
      return '<div class="pl-noti"><div class="pl-noti__ico">' + n.i + "</div>"
        + '<div><div class="pl-noti__t">' + esc(n.t) + "</div>"
        + '<div class="pl-noti__d">' + esc(n.d) + "</div></div>"
        + '<div class="pl-noti__time">' + n.w + "</div></div>";
    }).join("");
    notiEls = Array.prototype.slice.call(notis.querySelectorAll(".pl-noti"));
  }

  // Beat 4 — karaoke words
  var kara = root.querySelector(".pl-karaoke");
  var words = [];
  if (kara) {
    kara.innerHTML = LILY_LINE.split(/\s+/).map(function (w) {
      var key = w.charAt(0) === "~";
      if (key) w = w.slice(1);
      return '<span class="pl-word' + (key ? " pl-word--key" : "") + '">' + esc(w) + "</span>";
    }).join(" ");
    words = Array.prototype.slice.call(kara.querySelectorAll(".pl-word"));
    // the plain sentence stays available to screen readers and to search
    kara.setAttribute("aria-label", LILY_LINE.replace(/~/g, ""));
  }

  // Beat 5 — the rail, two rows running opposite ways
  var rail = root.querySelector(".pl-rail");
  var railRows = [];
  if (rail) {
    var rowHtml = function (items) {
      // doubled so the row can travel without running out of cards
      return items.concat(items).map(function (p) {
        return '<div class="pl-card-w"><div class="pl-card-w__logo">'
          + esc(p[0].charAt(0)) + "</div>"
          + '<div class="pl-card-w__n">' + esc(p[0]) + "</div>"
          + '<div class="pl-card-w__c">' + esc(p[1]) + "</div></div>";
      }).join("");
    };
    var a = RAIL.slice(0, 7), b = RAIL.slice(7);
    rail.innerHTML =
      '<div class="pl-rail__row" data-dir="-1">' + rowHtml(a) + "</div>"
      + '<div class="pl-rail__row" data-dir="1">' + rowHtml(b) + "</div>";
    railRows = Array.prototype.slice.call(rail.querySelectorAll(".pl-rail__row"));
  }

  // Beat 2 phone screen — a lock screen with the same pile on it
  var lockList = root.querySelector(".pl-screen--lock .pl-lock__list");
  if (lockList) {
    var mini = "";
    for (var m = 0; m < 5; m++) {
      mini += '<div class="pl-mini"><div class="pl-mini__ico"></div>'
        + '<div><div class="pl-mini__t"></div><div class="pl-mini__d"></div></div></div>';
    }
    lockList.innerHTML = mini;
  }

  /* ── Boot decision ──────────────────────────────────────────
     One place decides whether this section animates at all. */
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;

  if (reduced || !gsap || !ST) {
    root.classList.add("pl-static");
    words.forEach(function (w) { w.classList.add("is-lit"); });
    setStatic();
    return;
  }

  function setStatic() {
    // the counters and badge should still read their real numbers
    root.querySelectorAll(".pl-count__n").forEach(function (el, i) {
      el.textContent = comma(COUNTS[i] ? COUNTS[i].n : 0);
    });
    var bn = root.querySelector(".pl-badge__n");
    if (bn) bn.textContent = "9,999+";
  }

  gsap.registerPlugin(ST);

  /* ── Lenis: the smooth-scroll spine ─────────────────────────
     Site-wide, because a scrubbed timeline on native wheel-scroll reads
     steppy. Lenis owns the scroll, so native smooth-scroll is turned off
     and in-page anchors are routed through it — otherwise every nav link
     on the site would jump. */
  var lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ duration: 1.05, smoothWheel: true });
    // Lenis puts `.lenis` on <html> itself; the only thing left to undo is
    // the site's native smooth scroll, which would fight it.
    document.documentElement.style.scrollBehavior = "auto";

    lenis.on("scroll", ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);

    // header is sticky and 60px tall — every anchor lands under it otherwise
    document.addEventListener("click", function (ev) {
      var a = ev.target.closest && ev.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      ev.preventDefault();
      lenis.scrollTo(target, { offset: -76 });
    });
  }

  /* ── The timeline ───────────────────────────────────────────
     One scrubbed timeline over a 100-unit clock. The stage is pinned by
     `position: sticky` in CSS, not by ScrollTrigger — sticky cannot fight
     the sticky site header, and there is no pin-spacer to go wrong. */
  var track = root.querySelector(".pl-scroll__track");
  var phone = root.querySelector(".pl-phone");
  var badgeN = root.querySelector(".pl-badge__n");
  var badge = root.querySelector(".pl-badge");
  var counter = { v: 3 };
  var countObjs = COUNTS.map(function (c) { return { v: 0 }; });
  var countEls = Array.prototype.slice.call(root.querySelectorAll(".pl-count__n"));

  var mm = gsap.matchMedia();

  mm.add(
    { desktop: "(min-width: 880px)", mobile: "(max-width: 879px)" },
    function (ctx) {
      var wide = ctx.conditions.desktop;

      // where the phone sits during Lily's beat
      var lilyX = wide ? "-26vw" : "0vw";
      var lilyY = wide ? "0svh" : "-24svh";
      var lilyScale = wide ? 1 : 0.6;

      // beats that fade in without a fromTo need their resting state set
      gsap.set([".pl-b3", ".pl-b5"], { opacity: 0 });

      var tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6
        }
      });

      /* ── BEAT 1 · Threshold (0–12) ────────────────────────
         The screen washes into PlayLetter and the envelopes start falling.
         The wash is the whole per-product theme swap: nothing outside this
         section changes, so the site theme picker keeps working. */
      tl.fromTo(".pl-b1", { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 4 }, 0)
        .to(".pl-b1", { opacity: 0, y: -20, duration: 3 }, 8);

      /* Envelopes fall the height of the STAGE, not a multiple of their own
         18px box — yPercent barely moved them off the top edge. */
      envs.forEach(function (el, i) {
        tl.fromTo(el,
          { opacity: 0, y: 0, rotate: -20 + Math.random() * 40 },
          {
            opacity: 0.85, y: "118svh",
            rotate: -50 + Math.random() * 100,
            duration: 13 + Math.random() * 7
          },
          1 + i * 0.7);
        tl.to(el, { opacity: 0, duration: 2.5 }, 15 + i * 0.7);
      });

      // the phone arrives, holding the same pile
      tl.fromTo(phone,
        { opacity: 0, scale: 0.86, y: "16svh" },
        { opacity: 1, scale: 1, y: "0svh", duration: 6 }, 10)
        .fromTo(".pl-screen--lock", { opacity: 0 }, { opacity: 1, duration: 3 }, 12);

      /* ── BEAT 2 · The flood (12–38) ───────────────────────
         The scroller causes the chaos: banners stack faster and start to
         overlap, the badge runs away, the phone shakes. */
      notiEls.forEach(function (el, i) {
        var at = 15 + i * 1.9;
        tl.fromTo(el,
          { opacity: 0, y: -26, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 2.2 }, at);
        // later banners crowd upward into the ones before them
        if (i > 3) tl.to(el, { y: -(i - 3) * 7, duration: 6 }, at + 2);
      });

      tl.fromTo(badge, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 2 }, 15)
        .to(counter, {
          v: 9999, duration: 18, ease: "power2.in",
          onUpdate: function () { if (badgeN) badgeN.textContent = comma(counter.v); }
        }, 16)
        .to(badgeN, { filter: "blur(3px)", scale: 1.12, duration: 4 }, 30)
        .call(function () { if (badgeN) badgeN.textContent = "9,999+"; }, null, 32);

      // the shake, only at the end of the flood
      tl.to(phone, {
        keyframes: [
          { x: -4, rotate: -0.7, duration: 0.5 }, { x: 5, rotate: 0.8, duration: 0.5 },
          { x: -5, rotate: -0.9, duration: 0.5 }, { x: 4, rotate: 0.7, duration: 0.5 },
          { x: 0, rotate: 0, duration: 0.5 }
        ]
      }, 33.5);

      /* ── BEAT 3 · The snap (38–50) ────────────────────────
         Everything collapses into the phone and the noise stops. Tension
         into silence is the whole ad. */
      tl.to(notiEls, {
        opacity: 0, y: 0, scale: 0.2,
        duration: 3, stagger: { each: 0.12, from: "end" }
      }, 37)
        .to(badge, { opacity: 0, scale: 0.4, duration: 2.5 }, 37)
        // the phone dims rather than leaves: the pile is in there, and it
        // has gone quiet. The question sits over it.
        .to(phone, { opacity: 0.18, duration: 3 }, 39)
        .to(".pl-b3", { opacity: 1, duration: 3 }, 41)
        .fromTo(".pl-b3 .pl-h", { y: 22 }, { y: 0, duration: 4 }, 41)
        .to(".pl-b3", { opacity: 0, duration: 3 }, 48);

      /* ── BEAT 4 · Lily (50–70) ────────────────────────────
         The phone travels aside, becomes a player, and the pitch lights
         word by word as you scroll. */
      tl.to(phone, {
        opacity: 1, x: lilyX, y: lilyY, scale: lilyScale,
        duration: 6, ease: "power2.inOut"
      }, 48)
        .to(".pl-screen--lock", { opacity: 0, duration: 3 }, 49)
        .fromTo(".pl-screen--player", { opacity: 0 }, { opacity: 1, duration: 3 }, 50)
        .fromTo(".pl-bar__fill", { width: "0%" }, { width: "68%", duration: 16 }, 52)
        .fromTo(".pl-b4", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 3 }, 52);

      // the words themselves are lit by the progress reader below, not here —
      // a gsap .call() fires once per direction and leaves them stuck lit
      // when you scrub back up.

      tl.to(".pl-b4", { opacity: 0, y: -18, duration: 3 }, 68);

      /* ── BEAT 5 · The rail (70–87) ────────────────────────
         Writer cards on a diagonal rank; the scroll scrubs them past. */
      tl.to(phone, { opacity: 0, scale: 0.7, duration: 4 }, 68)
        .to(".pl-screen--player", { opacity: 0, duration: 3 }, 68)
        .fromTo(".pl-b5", { opacity: 0 }, { opacity: 1, duration: 3 }, 70);

      railRows.forEach(function (row) {
        var dir = Number(row.getAttribute("data-dir")) || 1;
        tl.fromTo(row,
          { x: dir < 0 ? "0%" : "-50%" },
          { x: dir < 0 ? "-50%" : "0%", duration: 17 }, 70);
      });

      countObjs.forEach(function (o, i) {
        tl.to(o, {
          v: COUNTS[i].n, duration: 6, ease: "power2.out",
          onUpdate: function () { if (countEls[i]) countEls[i].textContent = comma(o.v); }
        }, 76 + i * 1.5);
      });

      tl.to(".pl-b5", { opacity: 0, duration: 3 }, 86);

      /* ── BEAT 6 · Landing (87–100) ────────────────────────
         The phone comes back with the real app on it. Claims here are the
         true ones only — free on the web, installs from the browser. */
      tl.to(phone, {
        opacity: 1, scale: wide ? 0.82 : 0.76, x: 0,
        y: wide ? "-14svh" : "-16svh", duration: 5, ease: "power2.out"
      }, 86)
        .fromTo(".pl-screen--app", { opacity: 0 }, { opacity: 1, duration: 4 }, 87)
        .fromTo(".pl-b6", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 5 }, 89);

      /* Hold the clock open to a round 100. ScrollTrigger maps scroll
         progress onto the timeline's OWN duration, which otherwise ends at
         the last tween (94) — every beat above would then fire ~6% early
         and the landing would still be fading in at the bottom of the track. */
      tl.to({}, { duration: 1 }, 99);

      // no manual teardown: gsap.matchMedia reverts its own context, and
      // killing the ScrollTrigger by hand here double-kills it on resize.
    }
  );

  /* Scrubbing back up has to put the karaoke back. gsap .call() only fires
     forward-then-back on its own timeline; the words are class-based, so
     one ScrollTrigger over beat 4's range re-derives them from progress. */
  ST.create({
    trigger: track,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate: function (self) {
      if (!words.length) return;
      var p = (self.progress * 100 - 54) / 13;   // beat 4's word window
      var lit = Math.round(Math.max(0, Math.min(1, p)) * words.length);
      for (var i = 0; i < words.length; i++) {
        words[i].classList.toggle("is-lit", i < lit);
      }
    }
  });

  /* ── VOICE mode ─────────────────────────────────────────────
     Only ever wired up when a real voice file answers. The button stays
     hidden otherwise: a play control that cannot play is a lie. */
  var playBtn = root.querySelector(".pl-lily__play");
  if (LILY_AUDIO && playBtn) {
    var audio = new Audio(LILY_AUDIO);
    audio.preload = "metadata";
    audio.addEventListener("canplaythrough", function () { playBtn.hidden = false; }, { once: true });

    playBtn.addEventListener("click", function () {
      if (!audio.paused) { audio.pause(); return; }
      audio.play().then(function () {
        root.querySelector(".pl-lily").classList.add("is-playing");
      }).catch(function () { /* the browser refused; silent karaoke still works */ });
    });

    audio.addEventListener("timeupdate", function () {
      var d = audio.duration || 12;
      var t = audio.currentTime;
      // light words from the aligner's timings when we have them
      var lit;
      if (LILY_WORD_TIMES) {
        lit = 0;
        while (lit < LILY_WORD_TIMES.length && LILY_WORD_TIMES[lit] <= t) lit++;
      } else {
        lit = Math.round((t / d) * words.length);
      }
      for (var i = 0; i < words.length; i++) words[i].classList.toggle("is-lit", i < lit);

      // and carry the page through beat 4 on the audio clock
      if (lenis && track) {
        var top = track.offsetTop;
        var span = track.offsetHeight;
        var from = top + span * 0.54, to = top + span * 0.67;
        lenis.scrollTo(from + (to - from) * (t / d), { immediate: true });
      }
    });

    audio.addEventListener("ended", function () {
      var l = root.querySelector(".pl-lily");
      if (l) l.classList.remove("is-playing");
    });
  }
})();
