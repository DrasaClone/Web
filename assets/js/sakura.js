export function initSakura() {
    const container = document.getElementById('sakura-container');
    if (!container) return;

    const petals = [];
    const count = Math.min(25, Math.floor(window.innerWidth / 40));

    for (let i = 0; i < count; i++) {
        const petal = document.createElement('div');
        petal.className = 'sakura-petal';
        const size = Math.random() * 8 + 6;
        petal.style.width = `${size}px`;
        petal.style.height = `${size}px`;
        petal.style.left = `${Math.random() * 100}%`;
        petal.style.top = `${-Math.random() * 20 - 10}%`;
        
        container.appendChild(petal);
        petals.push({
            el: petal,
            x: Math.random() * 100,
            y: -20,
            speed: Math.random() * 0.2 + 0.1,
            rotation: Math.random() * 360,
            swing: Math.random() * 2,
        });
    }

    function animate() {
        petals.forEach(p => {
            p.y += p.speed;
            p.rotation += 0.5;
            const xOffset = Math.sin(p.y * 0.05) * 2;
            
            p.el.style.transform = `translateY(${p.y}vh) translateX(${xOffset}vw) rotate(${p.rotation}deg)`;
            
            if (p.y > 110) p.y = -10;
        });
        requestAnimationFrame(animate);
    }
    animate();
}
