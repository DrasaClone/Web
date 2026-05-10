import { AudioEngine } from './audio.js';
import { FirebaseService } from './firebase-service.js';

export function initInteractions() {
    const stickers = document.querySelectorAll('.sticker-item');
    const board = document.getElementById('scrapbook-board');

    if (!board) return;

    FirebaseService.onStickersChange((data) => {
        if (!data) return;
        board.querySelectorAll('.saved-sticker').forEach(el => el.remove());
        Object.values(data).forEach(s => {
            const el = document.createElement('div');
            el.className = "saved-sticker absolute text-4xl select-none";
            el.style.left = s.x + 'px';
            el.style.top = s.y + 'px';
            el.textContent = s.type;
            el.title = s.user ? `Được dán bởi ${s.user.name}` : 'Ai đó ẩn danh';
            board.appendChild(el);
            gsap.from(el, { y: -50, opacity: 0, duration: 0.8, ease: "bounce.out" });
        });
    });

    stickers.forEach(sticker => {
        sticker.style.touchAction = "none";
        
        Draggable.create(sticker, {
            type: "x,y",
            onPress: function() {
                gsap.to(this.target, { scale: 1.2, skewX: 10, duration: 0.2 });
            },
            onDrag: function() {
                gsap.to(this.target, { skewX: this.getVelocity("x") / 100 });
            },
            onDragEnd: function() {
                AudioEngine.playClick();
                if (navigator.vibrate) navigator.vibrate(50);
                
                const rect = board.getBoundingClientRect();
                const x = this.pointerX - rect.left;
                const y = this.pointerY - rect.top;
                
                if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                    FirebaseService.saveSticker({ type: sticker.textContent, x, y });
                }

                gsap.to(this.target, { x: 0, y: 0, scale: 1, skewX: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
            }
        });
    });
}
