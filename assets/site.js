/* ============================================================
   Payramid landing — scroll reveal, nav, the held-row sequence,
   the batch total count-up, and the pilot form.
   ============================================================ */

/* ------------------------------------------------------------------
   FORM ENDPOINT — there is deliberately no copy of it in this file.

   The endpoint lives in exactly one place: the `action` on
   <form id="pilot-form"> in index.html. A browser with no JavaScript
   posts straight to that attribute and nothing here can influence it,
   so holding a second copy here only creates a way for the two to
   disagree — change one, and the other silently sends people's
   applications somewhere else.

   To connect the form: create a form at https://formspree.io (the free
   tier allows 50 submissions a month) and put the endpoint it gives you
   — it looks like https://formspree.io/f/abcdwxyz — into that `action`.
   Then replace FALLBACK_EMAIL below with a mailbox somebody reads.

   Until the action is replaced the form refuses to send and says so,
   rather than silently swallowing somebody's submission.
------------------------------------------------------------------- */
var FALLBACK_EMAIL = "REPLACE_WITH_CONTACT_EMAIL"; /* shown only when a send fails */

/* Nobody fills in four fields in under three seconds. Scripts do. */
var MIN_FILL_MS = 3000;

(function () {
  "use strict";

  var root = document.documentElement;

  /* Tell the head script we are alive, so it leaves the reveal states
     armed. Anything that throws below falls through to disarm(), which
     puts every hidden element back on screen. */
  root.className += (root.className ? " " : "") + "pm-ready";

  var disarm = function () {
    root.className = root.className.replace(/(^|\s)pm-js(\s|$)/, "$1");
  };

  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  try {
    /* ---- Scroll reveal -------------------------------------------------- */
    var revealTargets = document.querySelectorAll(".pm-reveal, .pm-stagger");
    var showAll = function () {
      Array.prototype.forEach.call(revealTargets, function (el) {
        el.classList.add("pm-in");
      });
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      showAll();
    } else {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("pm-in");
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
      );
      Array.prototype.forEach.call(revealTargets, function (el) {
        observer.observe(el);
      });
      /* Last-ditch: if the observer never fires, show everything anyway. */
      setTimeout(showAll, 4000);
    }

    /* ---- Sticky-nav hairline -------------------------------------------- */
    var nav = document.getElementById("nav");
    if (nav) {
      var onScroll = function () {
        nav.classList.toggle("is-stuck", window.scrollY > 12);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    /* ---- Small-screen menu ---------------------------------------------- */
    /* <details> already handles opening, closing and the expanded state.
       These three lines only add the behaviours it has no opinion on. */
    var menu = document.getElementById("nav-menu");
    if (menu) {
      var closeMenu = function () {
        menu.removeAttribute("open");
      };
      menu.addEventListener("click", function (event) {
        if (event.target.closest && event.target.closest(".nav__panel a")) closeMenu();
      });
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && menu.hasAttribute("open")) {
          closeMenu();
          var btn = menu.querySelector("summary");
          if (btn) btn.focus();
        }
      });
      document.addEventListener("click", function (event) {
        if (menu.hasAttribute("open") && !menu.contains(event.target)) closeMenu();
      });
    }

    /* ---- The fold cue stops for good once the section is read ----------- */
    var lead = document.querySelector(".section-lead");
    var leadNext = lead && lead.nextElementSibling;
    if (lead && leadNext && "IntersectionObserver" in window) {
      var cueObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            lead.classList.add("is-passed");
            cueObserver.disconnect();
          });
        },
        { threshold: 0.4 }
      );
      cueObserver.observe(leadNext);
    }

    /* ---- Count-up on the batch total ------------------------------------
       Ported from the app's CountUp: same cubic ease-out, same duration
       formula, same compact formatting, and the same three safety nets —
       start immediately if it is already on screen, start on scroll, and
       a fallback timer in case neither fires. The final value is in the
       markup already, so nothing here can leave the figure wrong. */
    var fmtCompact = function (n, decimals) {
      var abs = Math.abs(n);
      var trim = function (v, d) {
        return v.toLocaleString("en-EG", {
          minimumFractionDigits: 0,
          maximumFractionDigits: d,
        });
      };
      if (abs >= 1000000) return trim(n / 1000000, decimals) + "M";
      if (abs >= 10000) return trim(n / 1000, 1) + "k";
      return trim(n, 0);
    };

    var setUpCountUp = function (el) {
      var target = parseFloat(el.getAttribute("data-countup"));
      var prefix = el.getAttribute("data-prefix") || "";
      if (!isFinite(target)) return null;

      var started = false;
      var raf = 0;
      var settleTimer;

      var settle = function () {
        el.textContent = prefix + fmtCompact(target, 2);
      };

      var run = function () {
        if (started) return;
        started = true;
        if (reduceMotion) {
          settle();
          return;
        }
        var dur = Math.min(1500, 520 + Math.log(Math.abs(target) + 1) * 150);
        var t0 = (window.performance && performance.now ? performance.now() : Date.now());
        var tick = function (now) {
          var p = Math.min(1, (now - t0) / dur);
          var e = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + fmtCompact(target * e, 2);
          if (p < 1) raf = requestAnimationFrame(tick);
          else settle();
        };
        raf = requestAnimationFrame(tick);
        /* Timers keep firing when rAF is frozen in a background tab, so
           the real value always lands. */
        settleTimer = setTimeout(settle, dur + 80);
      };

      return run;
    };

    var totalEl = document.querySelector("[data-countup]");
    var startCount = totalEl ? setUpCountUp(totalEl) : null;

    /* ---- The held-row sequence ------------------------------------------
       One class, added once. Everything else is CSS, and without it every
       row is already in its final state. */
    var batch = document.querySelector(".batch--sequence");
    var played = false;
    var playBatch = function (delayCount) {
      if (played) return;
      played = true;
      if (!reduceMotion && batch) batch.classList.add("is-playing");
      if (startCount) setTimeout(startCount, reduceMotion ? 0 : delayCount);
    };

    if (!("IntersectionObserver" in window) || reduceMotion) {
      playBatch(0);
    } else if (batch) {
      var rect = batch.getBoundingClientRect();
      var vh = window.innerHeight || root.clientHeight;
      if (rect.top < vh && rect.bottom > 0) {
        playBatch(1150);
      } else {
        var batchObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (!entry.isIntersecting) return;
              playBatch(1150);
              batchObserver.disconnect();
            });
          },
          { threshold: 0.35 }
        );
        batchObserver.observe(batch);
      }
    } else if (startCount) {
      startCount();
    }
  } catch (err) {
    disarm();
  }

  /* ---- Pilot form -------------------------------------------------------- */
  var form = document.getElementById("pilot-form");
  if (!form) return;

  var statusEl = document.getElementById("f-status");
  var submitEl = document.getElementById("f-submit");
  var tsEl = document.getElementById("f-ts");
  /* The markup's action is the single source of truth — see the note at
     the top of this file. Read it, never write it. */
  var endpoint = form.getAttribute("action") || "";
  var endpointReady = endpoint !== "" && endpoint.indexOf("REPLACE_WITH_") === -1;
  var emailReady = FALLBACK_EMAIL.indexOf("REPLACE_WITH_") === -1;
  var loadedAt = Date.now();

  var say = function (kind, text) {
    statusEl.className = "form-status " + (kind === "ok" ? "is-ok" : "is-err");
    statusEl.textContent = text;
  };

  /* Pointing someone at an address is only useful when there is one. Until
     FALLBACK_EMAIL is filled in, the shorter sentence is the honest one. */
  var withEmail = function (lead, tail) {
    return emailReady ? lead + " " + tail + " " + FALLBACK_EMAIL + "." : lead;
  };

  form.setAttribute("method", "POST");

  /* Native validation is the right answer with no JavaScript, so the markup
     leaves it on. From here on we do the messaging ourselves. */
  form.noValidate = true;

  /* Stamped now, read on submit. The value travels with the submission so a
     suspicious gap is visible in the inbox as well. */
  if (tsEl) tsEl.value = new Date(loadedAt).toISOString();

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      say("err", "Please fill in your name, a valid work email, and your company.");
      var firstInvalid = form.querySelector(":invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    /* The honeypot field travels with the submission and is judged at the
       other end, not here. Deciding it locally meant a "fill every field"
       password manager could trip it, and the visitor was then told their
       application had arrived while it was thrown away — a failure nobody
       on either end could see. A real person losing a pilot application is
       far more expensive than a script getting through. */

    /* Too fast to have been typed. Not silently dropped: a second attempt a
       moment later goes through, which costs a real person one click and
       costs a script the thing it was trying to avoid. */
    if (Date.now() - loadedAt < MIN_FILL_MS) {
      say("err", "That came through faster than we can accept. Give it a moment and send it again.");
      return;
    }

    if (!endpointReady) {
      say(
        "err",
        withEmail("This form isn't connected yet, so nothing was sent.", "Please email us at")
      );
      return;
    }

    var original = submitEl.innerHTML;
    submitEl.disabled = true;
    submitEl.textContent = "Sending…";
    statusEl.className = "form-status";
    statusEl.textContent = "";

    /* Formspree's JSON API: POST the form as multipart with an
       Accept: application/json header, and it answers with JSON instead of
       redirecting to its own thank-you page. Errors come back as
       { errors: [ { message } ] } with a 4xx. */
    fetch(endpoint, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form),
    })
      .then(function (response) {
        if (response.ok) return null;
        return response
          .json()
          .catch(function () {
            return null;
          })
          .then(function (data) {
            var detail =
              data && data.errors && data.errors.length && data.errors[0].message
                ? data.errors[0].message
                : "Request failed with status " + response.status;
            throw new Error(detail);
          });
      })
      .then(function () {
        form.reset();
        if (tsEl) tsEl.value = new Date(loadedAt).toISOString();
        say("ok", "Thank you — we've got it. Someone will come back to you within a few days.");
      })
      .catch(function () {
        say(
          "err",
          withEmail("Something went wrong sending that. Please try again.", "You can also email")
        );
      })
      .finally(function () {
        submitEl.disabled = false;
        submitEl.innerHTML = original;
      });
  });
})();
