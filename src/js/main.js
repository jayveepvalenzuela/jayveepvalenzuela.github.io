const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

(() => {
  document.documentElement.classList.replace("no-js", "js");

  initAnimations();
  initCarousel();
})();

function initCarousel() {
  const root = document.querySelector(".works");
  const track = root.querySelector(".carousel-track");
  const viewport = root.querySelector(".carousel-viewport");
  const slides = gsap.utils.toArray(".carousel-slide", root);
  let current = 0;

  const go = (index, duration = reduced ? 0 : 0.4) => {
    current = gsap.utils.wrap(0, slides.length, index);
    const opts = { duration, ease: "power3.out", overwrite: true };
    const slide = slides[current];
    // slides are container-wide, so aligning the active one to the track origin keeps it in the container
    gsap.to(track, { x: -slide.offsetLeft, ...opts });
    // inert also drives the dimmed/grayscale look in CSS and keeps off-screen links out of the tab order
    slides.forEach((s, i) => {
      s.toggleAttribute("inert", i !== current);
    });
  };

  root.querySelectorAll(".carousel-btn").forEach((btn) => {
    btn.addEventListener("click", () => go(current + Number(btn.dataset.dir)));
  });

  let startX = 0;
  viewport.addEventListener("pointerdown", (e) => (startX = e.clientX));
  viewport.addEventListener("pointerup", (e) => {
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1));
  });

  // on resize only the track offset changes; inert is already correct
  new ResizeObserver(() =>
    gsap.set(track, { x: -slides[current].offsetLeft }),
  ).observe(viewport);
  go(0, 0);
}

function initAnimations() {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

  ScrollTrigger.create({
    trigger: ".works",
    start: "bottom bottom",
    end: "+=100%",
    pin: ".contact",
  });

  const setProgress = gsap.quickSetter(".scroll-progress", "scaleX");

  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => setProgress(self.progress),
  });

  if (reduced) return;

  ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.2,
  });

  for (const el of gsap.utils.toArray(".fade-in")) {
    gsap.from(el, {
      autoAlpha: 0,
      y: 40,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
  }
}
