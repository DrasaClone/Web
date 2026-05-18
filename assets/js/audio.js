export const AudioEngine = {
    audio: new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'),
    clickSound: new Audio('https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3'),
    flipSound: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'),
    privateAudio: new Audio(),
    privateUpdateInterval: null,

    playBackground() {
        this.audio.loop = true;
        this.audio.volume = 0.15;
        this.audio.play().catch(e => console.log("Audio interaction needed"));
    },
    
    fadeOutBackground(duration = 1000) {
        gsap.to(this.audio, { volume: 0, duration: duration / 1000, onComplete: () => this.audio.pause() });
    },

    fadeInBackground(duration = 1000) {
        this.audio.play().catch(() => {});
        gsap.to(this.audio, { volume: 0.15, duration: duration / 1000 });
    },

    playPrivate(url, onProgress) {
        this.fadeOutBackground();
        this.privateAudio.src = url;
        this.privateAudio.volume = 0.4;
        this.privateAudio.play().catch(() => {});
        
        // Real-time progress tracking
        if (this.privateUpdateInterval) clearInterval(this.privateUpdateInterval);
        this.privateUpdateInterval = setInterval(() => {
            if (this.privateAudio.duration && onProgress) {
                onProgress(this.privateAudio.currentTime / this.privateAudio.duration);
            }
        }, 100);
        
        // Auto-stop when finished
        this.privateAudio.onended = () => {
            if (this.privateUpdateInterval) {
                clearInterval(this.privateUpdateInterval);
                this.privateUpdateInterval = null;
            }
            if (onProgress) onProgress(0);
            this.fadeInBackground();
        };
    },

    stopPrivate() {
        this.privateAudio.pause();
        if (this.privateUpdateInterval) {
            clearInterval(this.privateUpdateInterval);
            this.privateUpdateInterval = null;
        }
        this.fadeInBackground();
    },

    isPrivatePlaying() {
        return this.privateAudio && !this.privateAudio.paused;
    },

    playClick() {
        this.clickSound.currentTime = 0;
        this.clickSound.volume = 0.2;
        this.clickSound.play().catch(() => {});
    },
    
    playFlip() {
        this.flipSound.currentTime = 0;
        this.flipSound.volume = 0.3;
        this.flipSound.play().catch(() => {});
    }
};
