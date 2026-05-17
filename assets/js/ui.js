export function initUI(templateId) {
    const app = document.getElementById('app');
    const template = document.getElementById(templateId);
    if (template) {
        const content = template.content.cloneNode(true);
        app.appendChild(content);
    }
}

export function initDarkMode() {
    const toggleBtn = document.getElementById('dark-mode-toggle');
    if (!toggleBtn) return;
    
    const saved = localStorage.getItem('darkMode');
    if (saved === 'true') {
        document.documentElement.classList.add('dark');
        toggleBtn.textContent = '☀️';
    }
    
    toggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', isDark);
        toggleBtn.textContent = isDark ? '☀️' : '🌙';
        gsap.from(toggleBtn, { scale: 1.3, duration: 0.3, ease: "back.out(2)" });
    });
}
