export const AudioEngine = {
    audio: new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'),
    clickSound: new Audio('https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3'),
    flipSound: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'),

    playBackground() {
        this.audio.loop = true;
        this.audio.volume = 0.2;
        this.audio.play().catch(e => console.log("Audio interaction needed"));
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
