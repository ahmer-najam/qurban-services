/* ==========================================================================
   Qurban Services — script.js
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Helpers ---------- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* ---------- Scroll progress bar ---------- */
  const progressBar = $("#scrollProgress");
  function updateProgress() {
    if (!progressBar) return;
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = pct + "%";
  }

  /* ---------- Header: sticky shadow + active nav link ---------- */
  const header = $("#header");
  const navLinks = $$(".nav__link");
  const sections = $$("section[id]");

  function onScrollHeader() {
    if (window.scrollY > 10) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }

  function setActiveLink() {
    const pos = window.scrollY + 140;
    let currentId = "";
    for (const section of sections) {
      if (section.offsetTop <= pos) currentId = section.id;
    }
    if (currentId) {
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === "#" + currentId);
      });
    }
  }

  /* ---------- Mobile nav ---------- */
  const navToggle = $("#navToggle");
  const nav = $("#nav");

  let scrim = $(".nav-scrim");
  if (!scrim) {
    scrim = document.createElement("div");
    scrim.className = "nav-scrim";
    document.body.appendChild(scrim);
  }

  function closeNav() {
    nav.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    scrim.classList.remove("show");
    document.body.style.overflow = "";
  }

  function toggleNav() {
    const open = nav.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    scrim.classList.toggle("show", open);
    document.body.style.overflow = open ? "hidden" : "";
  }

  navToggle.addEventListener("click", toggleNav);
  scrim.addEventListener("click", closeNav);

  /* Close mobile nav when a link is clicked */
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeNav));

  /* Close nav with Escape */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });

  /* ---------- Back to top ---------- */
  const backToTop = $("#backToTop");
  if (backToTop) {
    window.addEventListener("scroll", () => {
      backToTop.classList.toggle("show", window.scrollY > 500);
    }, { passive: true });
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---------- FAQ accordion ---------- */
  const accordion = $("#accordion");
  if (accordion) {
    const items = $$(".accordion__item", accordion);
    const buttons = $$(".accordion__btn", accordion);

    buttons.forEach((btn, i) => {
      btn.addEventListener("click", () => {
        const item = items[i];
        const isOpen = item.classList.contains("open");
        const panel = $(".accordion__panel", item);

        items.forEach((it) => {
          it.classList.remove("open");
          $(".accordion__panel", it).style.maxHeight = "";
          $(".accordion__btn", it).setAttribute("aria-expanded", "false");
        });

        if (!isOpen) {
          item.classList.add("open");
          panel.style.maxHeight = panel.scrollHeight + "px";
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  /* ---------- Testimonials slider ---------- */
  const slider = $("#testimonialSlider");
  if (slider) {
    const track = $(".slider__track", slider);
    const cards = $$(".t-card", slider);
    const dotsWrap = $("#sliderDots");
    const prevBtn = $("#sliderPrev");
    const nextBtn = $("#sliderNext");

    let spv = 3;
    let index = 0;
    let timer = null;

    function calcSpv() {
      const w = slider.clientWidth;
      spv = w >= 1024 ? 3 : w >= 640 ? 2 : 1;
      track.style.setProperty("--spv", spv);
    }

    const maxIndex = () => Math.max(0, cards.length - spv);

    function go(i) {
      index = Math.max(0, Math.min(i, maxIndex()));
      const shift = index * (100 / spv);
      track.style.transform = "translateX(-" + shift + "%)";
      updateDots();
    }

    function next() {
      go(index >= maxIndex() ? 0 : index + 1);
    }
    function prev() {
      go(index <= 0 ? maxIndex() : index - 1);
    }

    /* Dots */
    function updateDots() {
      if (!dotsWrap) return;
      $$(".slider__dot", dotsWrap).forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
        dot.setAttribute("aria-selected", String(i === index));
      });
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      const count = maxIndex() + 1;
      for (let i = 0; i < count; i++) {
        const dot = document.createElement("button");
        dot.className = "slider__dot" + (i === index ? " active" : "");
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-label", "Show reviews " + (i + 1));
        dot.setAttribute("aria-selected", String(i === index));
        dot.addEventListener("click", () => { go(i); restart(); });
        dotsWrap.appendChild(dot);
      }
    }

    /* Autoplay */
    function start() {
      stop();
      timer = setInterval(next, 5000);
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    function restart() { start(); }

    /* Pause on hover / focus */
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    slider.addEventListener("focusin", stop);
    slider.addEventListener("focusout", start);

    /* Touch / swipe */
    let touchX = null;
    slider.addEventListener("touchstart", (e) => {
      touchX = e.touches[0].clientX;
      stop();
    }, { passive: true });
    slider.addEventListener("touchend", (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 45) {
        if (dx < 0) next(); else prev();
      }
      touchX = null;
      start();
    }, { passive: true });

    /* Arrows */
    if (prevBtn) prevBtn.addEventListener("click", () => { prev(); restart(); });
    if (nextBtn) nextBtn.addEventListener("click", () => { next(); restart(); });

    /* Keyboard arrows when slider focused */
    slider.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { prev(); restart(); }
      if (e.key === "ArrowRight") { next(); restart(); }
    });

    /* Resize */
    let resizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        calcSpv();
        buildDots();
        go(index);
      }, 150);
    });

    calcSpv();
    buildDots();
    go(0);
    start();
  }

  /* ---------- Scroll reveal ---------- */
  $$(".section__head, .card, .step, .why__statcard, .portrait, .contact__row, .contact__badge, .accordion__item, .area-chip, .t-card").forEach((el) => {
    if (!el.classList.contains("reveal")) el.classList.add("reveal");
  });

  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("visible"));
  }

  /* ---------- Animated counters ---------- */
  const counters = $$("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          counterObserver.unobserve(el);
          const target = parseInt(el.dataset.count, 10);
          const duration = 1600;
          const start = performance.now();
          function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target).toLocaleString("en-US");
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => counterObserver.observe(el));
  }

  /* ---------- Contact form (front-end only) ---------- */
  const form = $("#contactForm");
  if (form) {
    const phoneInput = $("#phone", form);
    const nameInput = $("#name", form);
    const serviceSelect = $("#service", form);
    const successMsg = $("#formSuccess");

    /* Light phone formatting: allow digits, spaces and + only */
    phoneInput.addEventListener("input", () => {
      phoneInput.value = phoneInput.value.replace(/[^\d+ ]/g, "").slice(0, 15);
    });

    function setError(input, message) {
      const field = input.closest(".field");
      const err = field.querySelector("[data-error-for]");
      if (message) {
        field.classList.add("invalid");
        if (err) err.textContent = message;
      } else {
        field.classList.remove("invalid");
        if (err) err.textContent = "";
      }
    }

    function validate() {
      let valid = true;
      const nameOk = nameInput.value.trim().length >= 2;
      setError(nameInput, nameOk ? "" : "Please enter your name.");

      const phoneVal = phoneInput.value.replace(/\s+/g, "");
      const phoneOk = /^\+?\d{10,13}$/.test(phoneVal);
      setError(phoneInput, phoneOk ? "" : "Please enter a valid phone number (e.g. 03XX XXXXXXX).");

      const serviceOk = serviceSelect.value !== "";
      setError(serviceSelect, serviceOk ? "" : "Please select a service.");

      return nameOk && phoneOk && serviceOk;
    }

    /* Clear errors on input */
    [nameInput, phoneInput, serviceSelect].forEach((el) => {
      el.addEventListener("input", () => setError(el, ""));
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validate()) return;

      /* Build a WhatsApp message from the form so the lead actually reaches Mr. Qurban */
      const msg =
        "Assalam o Alaikum! I would like to request a callback.\n" +
        "Name: " + nameInput.value.trim() + "\n" +
        "Phone: " + phoneInput.value.trim() + "\n" +
        "Service: " + (serviceSelect.options[serviceSelect.selectedIndex] || {}).text + "\n" +
        (form.message.value.trim() ? "Details: " + form.message.value.trim() : "");

      const url = "https://wa.me/923450750091?text=" + encodeURIComponent(msg);

      /* Show inline success */
      successMsg.hidden = false;
      form.querySelector(".contact__form-title").textContent = "Request Sent!";
      form.querySelector(".contact__form-sub").textContent = "";
      form.querySelector("button[type=submit]").disabled = true;

      /* Open WhatsApp so the message is one tap away (popup allowed on click) */
      window.open(url, "_blank");
    });
  }

  /* ---------- Footer year ---------- */
  const yearEl = $("#year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ---------- Scroll handlers ---------- */
  window.addEventListener("scroll", () => {
    updateProgress();
    onScrollHeader();
    setActiveLink();
  }, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });

  updateProgress();
  onScrollHeader();
  setActiveLink();
})();
