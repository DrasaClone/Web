export function initAnimations() {
    gsap.to("body", { autoAlpha: 1, duration: 0.5 });
    
    gsap.from(".liquid-glass", {
        duration: 1,
        y: 20,
        opacity: 0,
        filter: "blur(10px)",
        ease: "power2.out",
        stagger: 0.1,
        willChange: "transform, opacity"
    });
}
