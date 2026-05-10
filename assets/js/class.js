import { initAnimations } from './animations.js';
import { initInteractions } from './interaction.js';
import { initUI } from './ui.js';
import { FirebaseService } from './firebase-service.js';
import { TransitionManager } from './transitions.js';

async function initClass() {
    // 1. Loading Screen
    const loadingBar = document.getElementById('loading-bar');
    if (loadingBar) await gsap.to(loadingBar, { scaleX: 1, duration: 1, ease: "power2.inOut" });
    await gsap.to('#loading-screen', { opacity: 0, duration: 0.5, pointerEvents: 'none' });

    // 2. Render UI
    initUI('class-template');
    initAnimations();
    TransitionManager.init();

    const userInfo = document.getElementById('user-info');
    const memoryWall = document.getElementById('memory-wall');
    const memoryInput = document.getElementById('memory-input');
    const sendBtn = document.getElementById('send-memory');
    const scrapbookBoard = document.getElementById('scrapbook-board');

    // 3. Auth Listener
    FirebaseService.onAuthChange((user) => {
        if (user && userInfo) {
            userInfo.innerHTML = `
                <img src="${user.photoURL}" class="w-10 h-10 rounded-full border-2 border-[#FF8AB8]">
                <div class="flex flex-col">
                    <span class="text-xs font-bold text-[#5D4037]">${user.displayName}</span>
                    <button id="logout-btn" class="text-[10px] text-left text-[#5D4037]/50 hover:text-[#5D4037]">Đăng xuất</button>
                </div>
            `;
            document.getElementById('logout-btn').addEventListener('click', () => {
                FirebaseService.auth.signOut();
                window.location.href = 'main.html';
            });
        }
    });

    // 4. Dummy Friend Cards (Corrected Contrast)
    for(let i=1; i<=8; i++) {
        const card = document.createElement('div');
        card.className = "member-card liquid-glass rounded-[2rem] p-8 aspect-[3/4] flex flex-col justify-end border-[#5D4037]/10 hover:border-[#5D4037]/30 transition-all hover:scale-[1.02] bg-white/20";
        card.innerHTML = `
            <h3 class="font-heading text-3xl text-[#5D4037]">Bạn ${i}</h3>
            <p class="font-body text-[#5D4037]/60">"Kỷ niệm thanh xuân rực rỡ dưới mái trường..."</p>
        `;
        scrapbookBoard.appendChild(card);
    }

    // 5. Realtime Memories
    FirebaseService.onMemoriesChange((data) => {
        if (!data) return;
        memoryWall.innerHTML = '';
        Object.values(data).reverse().forEach(m => {
            const el = document.createElement('div');
            el.className = "liquid-glass p-6 max-w-xs transform hover:rotate-1 transition-all bg-white/40 border-dashed border-[#5D4037]/20";
            el.innerHTML = `
                <p class="font-body text-[#5D4037] mb-4">"${m.text}"</p>
                <div class="flex items-center gap-2 mt-auto">
                    <img src="${m.user?.photo || ''}" class="w-6 h-6 rounded-full grayscale opacity-50">
                    <span class="text-[10px] uppercase tracking-widest text-[#5D4037]/40">${m.user?.name || 'Ai đó ẩn danh'}</span>
                </div>
            `;
            memoryWall.appendChild(el);
            gsap.from(el, { scale: 0.8, opacity: 0, duration: 0.5, ease: "back.out(1.7)" });
        });
    });

    // 6. Send Memory
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            if (memoryInput.value.trim()) {
                FirebaseService.saveMemory(memoryInput.value.trim());
                memoryInput.value = '';
            }
        });
    }

    initInteractions();
}

initClass();
