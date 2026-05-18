// ─── Agora Online Meeting Room ───
// Uses Agora Web SDK (loaded via CDN in myclass.html)
// App ID: a0b62867bee543fe828e23b4888eb3ae

const AGORA_APP_ID = 'a0b62867bee543fe828e23b4888eb3ae';
const AGORA_CHANNEL = 'kyuc-classroom';

let rtc = {
    client: null,
    localAudioTrack: null,
    localVideoTrack: null,
    remoteUsers: {}
};

function initAgora() {
    const toggleBtn = document.getElementById('agora-toggle-btn');
    const panel = document.getElementById('agora-room-panel');
    const joinBtn = document.getElementById('agora-join-btn');
    const leaveBtn = document.getElementById('agora-leave-btn');
    const localPlayer = document.getElementById('agora-local-player');
    const remoteContainer = document.getElementById('agora-remote-players');
    const participantCount = document.getElementById('agora-participant-count');

    if (!toggleBtn || !panel) return;

    let isPanelOpen = false;
    let isJoined = false;

    // Toggle panel
    toggleBtn.addEventListener('click', () => {
        isPanelOpen = !isPanelOpen;
        panel.classList.toggle('hidden', !isPanelOpen);
        gsap.fromTo(panel, 
            { opacity: 0, y: 10, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' }
        );
    });

    // Join room
    joinBtn.addEventListener('click', async () => {
        if (isJoined) return;
        
        try {
            joinBtn.textContent = '⏳ Đang kết nối...';
            joinBtn.disabled = true;
            
            if (typeof AgoraRTC === 'undefined') {
                localPlayer.innerHTML = '⚠️ Agora SDK chưa tải';
                joinBtn.textContent = 'Vào phòng 📞';
                joinBtn.disabled = false;
                return;
            }

            rtc.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
            
            rtc.client.on('user-published', async (user, mediaType) => {
                await rtc.client.subscribe(user, mediaType);
                
                if (mediaType === 'video') {
                    const remoteId = `agora-remote-${user.uid}`;
                    let remoteDiv = document.getElementById(remoteId);
                    if (!remoteDiv) {
                        remoteDiv = document.createElement('div');
                        remoteDiv.id = remoteId;
                        remoteDiv.className = 'agora-remote-player w-full aspect-video bg-[#3E2723]/10 rounded-xl overflow-hidden relative';
                        remoteDiv.innerHTML = `<div class="absolute inset-0 flex items-center justify-center text-muted/20 text-xs">👤 Đang kết nối...</div>`;
                        remoteContainer.appendChild(remoteDiv);
                    }
                    user.videoTrack.play(remoteId);
                }
                
                if (mediaType === 'audio') {
                    user.audioTrack.play();
                }
                
                updateParticipantCount();
            });

            rtc.client.on('user-unpublished', (user) => {
                const remoteId = `agora-remote-${user.uid}`;
                const remoteDiv = document.getElementById(remoteId);
                if (remoteDiv) remoteDiv.remove();
                updateParticipantCount();
            });

            rtc.client.on('user-left', (user) => {
                const remoteId = `agora-remote-${user.uid}`;
                const remoteDiv = document.getElementById(remoteId);
                if (remoteDiv) remoteDiv.remove();
                updateParticipantCount();
            });

            // Join channel
            const uid = await rtc.client.join(AGORA_APP_ID, AGORA_CHANNEL, null, null);
            
            // Create local tracks (video off initially — audio only for subtlety)
            rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
            
            // Publish only audio initially (video on demand)
            await rtc.client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);
            
            // Play local video
            localPlayer.innerHTML = '';
            rtc.localVideoTrack.play(localPlayer);
            localPlayer.classList.remove('flex', 'items-center', 'justify-center');
            
            isJoined = true;
            joinBtn.classList.add('hidden');
            leaveBtn.classList.remove('hidden');
            participantCount.textContent = '👤 Đã kết nối';
            
            // Subtle toast
            const toast = document.getElementById('toast-container');
            if (toast) {
                const msg = document.createElement('div');
                msg.className = 'toast show';
                msg.textContent = '🎙️ Đã vào phòng! Có ai đó cũng đang online...';
                toast.appendChild(msg);
                setTimeout(() => {
                    gsap.to(msg, { opacity: 0, y: -20, duration: 0.5, onComplete: () => msg.remove() });
                }, 3000);
            }
            
        } catch (err) {
            console.error('Agora join error:', err);
            localPlayer.innerHTML = '⚠️ Kết nối thất bại';
            joinBtn.textContent = 'Vào phòng 📞';
            joinBtn.disabled = false;
        }
    });

    // Leave room
    leaveBtn.addEventListener('click', async () => {
        try {
            // Stop local tracks
            if (rtc.localAudioTrack) {
                rtc.localAudioTrack.stop();
                rtc.localAudioTrack.close();
            }
            if (rtc.localVideoTrack) {
                rtc.localVideoTrack.stop();
                rtc.localVideoTrack.close();
            }
            
            // Remove remote players
            remoteContainer.innerHTML = '';
            
            // Leave channel
            if (rtc.client) {
                await rtc.client.leave();
            }
            
            rtc = {
                client: null,
                localAudioTrack: null,
                localVideoTrack: null,
                remoteUsers: {}
            };
            
            isJoined = false;
            leaveBtn.classList.add('hidden');
            joinBtn.classList.remove('hidden');
            joinBtn.textContent = 'Vào phòng 📞';
            joinBtn.disabled = false;
            participantCount.textContent = '0 người';
            localPlayer.innerHTML = '📹 Đã ngắt kết nối';
            localPlayer.classList.add('flex', 'items-center', 'justify-center');
            
        } catch (err) {
            console.error('Agora leave error:', err);
        }
    });

    function updateParticipantCount() {
        const remoteCount = remoteContainer.children.length;
        const total = remoteCount + (isJoined ? 1 : 0);
        participantCount.textContent = `${total} người`;
    }
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAgora);
} else {
    initAgora();
}
