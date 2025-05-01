const tracks = [
  { title: 'Track 1', artist: 'Artist A', src: 'https://example.com/track1.mp3' },
  { title: 'Track 2', artist: 'Artist B', src: 'https://example.com/track2.mp3' },
  { title: 'Track 3', artist: 'Artist C', src: 'https://example.com/track3.mp3' },
];
let currentIndex = 0;
const audio = document.getElementById('audio');
const titleEl = document.getElementById('track-title');
const artistEl= document.getElementById('track-artist');
const playBtn  = document.getElementById('play');
const prevBtn  = document.getElementById('prev');
const nextBtn  = document.getElementById('next');
const progressContainer = document.getElementById('progress-container');
const progress = document.getElementById('progress');

function loadTrack(index) {
  const track = tracks[index];
  audio.src = track.src;
  titleEl.textContent = track.title;
  artistEl.textContent = track.artist;
}

function playPause() {
  if (audio.paused) {
    audio.play();
    playBtn.textContent = '⏸️';
  } else {
    audio.pause();
    playBtn.textContent = '▶️';
  }
}

function prevTrack() {
  currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
  loadTrack(currentIndex);
  audio.play();
  playBtn.textContent = '⏸️';
}

function nextTrack() {
  currentIndex = (currentIndex + 1) % tracks.length;
  loadTrack(currentIndex);
  audio.play();
  playBtn.textContent = '⏸️';
}

audio.addEventListener('timeupdate', () => {
  const percent = (audio.currentTime / audio.duration) * 100;
  progress.style.width = `${percent}%`;
});
progressContainer.addEventListener('click', e => {
  const rect = progressContainer.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  audio.currentTime = pct * audio.duration;
});

playBtn.onclick = playPause;
prevBtn.onclick = prevTrack;
nextBtn.onclick = nextTrack;
document.addEventListener('DOMContentLoaded', () => loadTrack(currentIndex));
