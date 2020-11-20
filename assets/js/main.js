const createElement = (el) => document.createElement(el);
const selectElement = (el) => document.querySelector(el);
const selectAllElements = (el) => document.querySelectorAll(el);

const body = document.body;

// init scrollmagic controller
const scrollmagicController = new ScrollMagic.Controller();

// lazy load images
selectAllElements('.lazy').forEach((el) => {
    el.src = el.dataset.src;
});

// navbar toggle
const navbarMenu = selectElement('.navbar__menu');

selectElement('.navbar__toggle').addEventListener('click', () => {
    navbarMenu.classList.toggle('visible');
});

// theme toggle
const btnThemeToggle = body.appendChild(createElement('button'));

btnThemeToggle.classList.add('btn-theme-toggle', 'lar');

btnThemeToggle.addEventListener('click', (ev) => {
    body.setAttribute('data-theme', Number(ev.target.classList.toggle('light')));
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
});
