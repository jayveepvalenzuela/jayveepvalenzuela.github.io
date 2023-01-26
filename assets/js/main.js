const createElement = (el) => document.createElement(el);
const selectElement = (el) => document.querySelector(el);
const selectAllElements = (el) => document.querySelectorAll(el);

const body = document.body;

// init scrollmagic controller
const scrollmagicController = new ScrollMagic.Controller();

// theme toggle
const btnThemeToggle = body.appendChild(createElement('button'));

btnThemeToggle.classList.add('btn-theme-toggle', 'lar', 'cursor-animate');
btnThemeToggle.setAttribute('aria-label', 'Toggle theme');

btnThemeToggle.addEventListener('click', (ev) => {
    body.setAttribute('data-theme', Number(ev.target.classList.toggle('light')));
});

// cursor look and behavior
const cursorPointer = body.appendChild(createElement('div'));
const cursorRing = cursorPointer.appendChild(createElement('div'));
const cursor = {
    x: 0,
    y: 0,
    ringX: 0,
    ringY: 0
};

cursorPointer.classList.add('cursor-pointer');
cursorRing.classList.add('cursor-ring');

body.addEventListener('mousemove', (ev) => {
    cursor.x = ev.clientX;
    cursor.y = ev.clientY;
});

gsap.to({}, 0.010, {
    repeat: -1,
    onRepeat: () => {
        cursor.ringX += (cursor.x - cursor.ringX) / 6;
        cursor.ringY += (cursor.y - cursor.ringY) / 6;

        gsap.set(cursorRing, {
            css: {
                left: cursor.ringX - 15,
                top: cursor.ringY - 15
            }
        });

        gsap.set(cursorPointer, {
            css: {
                left: cursor.x,
                top: cursor.y
            }
        });
    }
});

selectAllElements('.cursor-animate').forEach((el) => {
    el.addEventListener('mouseenter', () => {
        cursorPointer.classList.add('hover');
    });

    el.addEventListener('mouseleave', () => {
        cursorPointer.classList.remove('hover');
    });
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
