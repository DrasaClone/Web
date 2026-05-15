import { AudioEngine } from './audio.js';
import { FirebaseService } from './firebase-service.js';
import { showToast } from './toast.js';

export function initInteractions() {
    const stickers = document.querySelectorAll('.sticker-item');
    const board = document.getElementById('scrapbook-board');
    const trashBin = document.getElementById('trash-bin');

    if (!board) return;

    FirebaseService.onStickersChange((data) => {
        if (!data) return;
        board.querySelectorAll('.saved-sticker').forEach(el => el.remove());
        Object.entries(data).forEach(([id, s]) => {
            createSavedSticker(id, s, board, trashBin);
        });
    });

    stickers.forEach(sticker => {
        sticker.style.touchAction = "none";
        
        Draggable.create(sticker, {
            type: "x,y",
            onPress: function() {
                AudioEngine.playClick();
                this.ghost = this.target.cloneNode(true);
                this.ghost.style.position = 'fixed';
                this.ghost.style.zIndex = 10000;
                this.ghost.style.pointerEvents = 'none';
                const rect = this.target.getBoundingClientRect();
                gsap.set(this.ghost, { left: rect.left, top: rect.top, scale: 1.5 });
                document.body.appendChild(this.ghost);
            },
            onDrag: function() {
                if (this.ghost) {
                    gsap.set(this.ghost, { left: this.pointerX - 25, top: this.pointerY - 25 });
                    const rect = trashBin.getBoundingClientRect();
                    if (this.pointerX >= rect.left && this.pointerX <= rect.right && this.pointerY >= rect.top && this.pointerY <= rect.bottom) {
                        trashBin.classList.add('hover');
                    } else {
                        trashBin.classList.remove('hover');
                    }
                }
            },
            onDragEnd: function() {
                const rect = board.getBoundingClientRect();
                const style = window.getComputedStyle(board);
                const padLeft = parseFloat(style.paddingLeft);
                const padTop = parseFloat(style.paddingTop);
                const availW = rect.width - padLeft - parseFloat(style.paddingRight);
                const availH = rect.height - padTop - parseFloat(style.paddingBottom);
                // Adjust for padding: position is relative to padding box
                const x = this.pointerX - rect.left - padLeft;
                const y = this.pointerY - rect.top - padTop;
                
                if (x >= 0 && x <= availW && y >= 0 && y <= availH) {
                    // Optimistic UI: render sticker immediately
                    const el = document.createElement('div');
                    el.className = "saved-sticker absolute text-4xl select-none opacity-50";
                    el.style.left = (x - 20) + 'px';
                    el.style.top = (y - 20) + 'px';
                    el.textContent = sticker.textContent;
                    el.dataset.optimistic = 'true';
                    board.appendChild(el);

                    // Try saving to Firebase
                    const result = FirebaseService.saveSticker({ 
                        type: sticker.textContent, 
                        x: x - 20, 
                        y: y - 20 
                    });

                    // If saveSticker returns a promise, handle rollback
                    if (result && result.then) {
                        result.catch(() => {
                            // Rollback: remove optimistic sticker
                            if (el.parentNode) {
                                el.remove();
                                showToast("Không thể lưu sticker, thử lại! 😅");
                            }
                        });
                    }

                    showToast("Đã dán kỷ niệm! ✨");
                }
                if (this.ghost) this.ghost.remove();
                gsap.to(this.target, { x: 0, y: 0, scale: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" });
                trashBin.classList.remove('active', 'hover');
            }
        });
    });
}

function createSavedSticker(id, s, board, trashBin) {
    // Remove optimistic duplicate if exists
    const existingOptimistic = board.querySelector(`[data-optimistic="true"]`);
    if (existingOptimistic) existingOptimistic.remove();

    const el = document.createElement('div');
    el.className = "saved-sticker absolute text-4xl select-none";
    el.style.left = s.x + 'px';
    el.style.top = s.y + 'px';
    el.textContent = s.type;
    board.appendChild(el);

    Draggable.create(el, {
        onPress: () => trashBin.classList.add('active'),
        onDragEnd: function() {
            const tr = trashBin.getBoundingClientRect();
            if (this.pointerX >= tr.left && this.pointerX <= tr.right && this.pointerY >= tr.top && this.pointerY <= tr.bottom) {
                FirebaseService.deleteSticker(id)
                    .then(() => showToast("Đã dọn dẹp sticker 🗑️"))
                    .catch(() => showToast("Không thể xóa sticker, thử lại! 😅"));
            }
            trashBin.classList.remove('active', 'hover');
        }
    });
}
