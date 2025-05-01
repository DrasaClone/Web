const pubnub = new PubNub({
  publishKey:    PUBNUB_KEYS.publishKey,
  subscribeKey:  PUBNUB_KEYS.subscribeKey,
  uuid:          firebase.auth().currentUser.uid
});
const channel = CHANNEL;
const me      = firebase.auth().currentUser;
const nick    = localStorage.getItem('nickname') || me.email;
const otherUid= localStorage.getItem('selectedContact');

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('chat-title').textContent = localStorage.getItem('selectedContactName');
  pubnub.subscribe({ channels:[channel] });
  pubnub.addListener({ message: e => {
    const { senderId, nickname, text } = e.message;
    appendBubble(senderId===me.uid?'outgoing':'incoming', nickname, text);
  }});

  // Presence of other
  firebase.database().ref('/status/' + otherUid + '/state')
    .on('value', s => {
      const st = document.getElementById('chat-status');
      st.classList.toggle('online', s.val()==='online');
      st.classList.toggle('offline', s.val()!=='online');
    });

  document.getElementById('btn-send').onclick = () => {
    const inp = document.getElementById('msg-input');
    const txt = inp.value.trim();
    if (!txt) return;
    pubnub.publish({ channel, message:{ senderId:me.uid, nickname:nick, text:txt } });
    inp.value = '';
  };
});

function appendBubble(type, sender, text) {
  const m = document.createElement('div');
  m.className = `message ${type}`;
  m.innerHTML = `<div class="bubble"><strong>${sender}</strong><p>${text}</p></div>`;
  document.getElementById('messages').appendChild(m);
  anime({ targets: m.querySelector('.bubble'), scale:[0,1], duration:300, easing:'easeOutBack' });
}
