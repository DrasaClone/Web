export function showToast(message, duration = 2500) {
    const toast = document.createElement('div');
    toast.className = "fixed top-5 right-5 bg-[#5D4037] text-white px-6 py-3 rounded-full shadow-lg font-body z-[20000]";
    toast.style.cssText = "transform: translateY(-20px); opacity: 0;";
    toast.textContent = message;
    document.body.appendChild(toast);
    
    gsap.to(toast, {
        y: 0,
        opacity: 1,
        duration: 0.4,
        ease: "back.out(1.7)"
    });
    
    setTimeout(() => {
        gsap.to(toast, {
            y: -20,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => toast.remove()
        });
    }, duration);
}
