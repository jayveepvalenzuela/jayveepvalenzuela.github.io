const createElement = (el) => document.createElement(el);
const selectElement = (el) => document.querySelector(el);
const selectAllElements = (el) => document.querySelectorAll(el);

const body = document.body;

// init scrollmagic controller
const scrollmagicController = new ScrollMagic.Controller();

// theme toggle
const btnThemeToggle = body.appendChild(createElement('button'));

btnThemeToggle.classList.add('btn-theme-toggle', 'lar');
btnThemeToggle.setAttribute('aria-label', 'Toggle theme');

btnThemeToggle.addEventListener('click', (ev) => {
    body.setAttribute('data-theme', Number(ev.target.classList.toggle('light')));
});

// navbar toggle
const navbarMenu = selectElement('.navbar__menu');

selectElement('.navbar__toggle').addEventListener('click', () => {
    navbarMenu.classList.toggle('visible');
});

window.addEventListener('load', () => {
    selectAllElements('[data-scroll]').forEach((el) => {
        // scroll to
        el.addEventListener('click', (ev) => {
            ev.preventDefault();

            gsap.to(window, {
                duration: 2,
                ease: 'power4.inOut',
                scrollTo: {
                    y: ev.target.hash
                },
                onStart: () => {
                    navbarMenu.classList.remove('visible');
                }
            });
        });

        // scrollspy
        const sectionId = el.hash;
        const section = selectElement(sectionId);

        new ScrollMagic.Scene({
            triggerElement: section
        })
        .setClassToggle(`[href="${sectionId}"]`, 'active')
        .duration(section.clientHeight)
        .addTo(scrollmagicController);
    });

    // start particles
    particlesJS.load('about', '/assets/js/particles.json');
});
