import { initSakura } from './sakura.js';

export function initAnimations() {
    gsap.to("#app", { opacity: 1, duration: 0.8, delay: 0.2 });
    
    gsap.from(".liquid-glass", {
        duration: 1.2,
        y: 30,
        opacity: 0,
        filter: "blur(15px)",
        ease: "power3.out",
        stagger: 0.15,
        willChange: "transform, opacity"
    });

    initSakura();
}
