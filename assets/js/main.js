(() => {
  document.documentElement.classList.replace("no-js", "js");

  initSmoothScroll();
})();

function initSmoothScroll() {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

  ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.2,
  });

  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".works",
        start: "bottom bottom",
        end: () => `+=${window.innerHeight}`,
        scrub: true,
        pin: ".contact",
      },
    })
    .to(".works", { y: "-100vh", ease: "none" }, 0);

  const progressBar = document.querySelector(".scroll-progress");

  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      progressBar.style.transform = `scaleX(${self.progress})`;
    },
  });
}
