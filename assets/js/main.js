(() => {
  document.documentElement.classList.replace("no-js", "js");

  initLenisScroll();
})();

function initLenisScroll() {
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    orientation: "vertical",
    gestureOrientation: "vertical",
    smoothWheel: true,
    wheelMultiplier: 1,
    syncTouch: false,
    touchMultiplier: 2,
    infinite: false,
    autoResize: true,
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  const progressBar = document.querySelector(".scroll-progress");

  lenis.on("scroll", ({ progress }) => {
    progressBar.style.transform = `scaleX(${progress})`;
  });
}
