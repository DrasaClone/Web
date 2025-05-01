firebase.initializeApp(FIREBASE_CONFIG);
const auth = firebase.auth();
const db   = firebase.firestore();
const rtdb = firebase.database();

function initPresence() {
  const uid = auth.currentUser.uid;
  const statusRef = rtdb.ref('/status/' + uid);
  const isOnline  = { state:'online',  last_changed: firebase.database.ServerValue.TIMESTAMP };
  const isOffline = { state:'offline', last_changed: firebase.database.ServerValue.TIMESTAMP };
  rtdb.ref('.info/connected').on('value', snap => {
    if (snap.val()) {
      statusRef.onDisconnect().set(isOffline);
      statusRef.set(isOnline);
    }
  });
}

function loadContacts() {
  const cont = document.getElementById('contacts');
  db.collection('users').get().then(snap => {
    cont.innerHTML = '';
    snap.forEach(doc => {
      const d = doc.data();
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <span>${d.nickname || d.email}</span>
        <span id="status-${doc.id}" class="status-dot offline"></span>
      `;
      card.onclick = () => {
        localStorage.setItem('selectedContact', doc.id);
        localStorage.setItem('selectedContactName', d.nickname || d.email);
        location = 'chat.html';
      };
      cont.appendChild(card);
      rtdb.ref('/status/' + doc.id + '/state').on('value', s => {
        const dot = document.getElementById('status-' + doc.id);
        dot.className = 'status-dot ' + (s.val()==='online'?'online':'offline');
      });
    });
  });
  document.getElementById('btn-logout').onclick = () => auth.signOut();
}

auth.onAuthStateChanged(user => {
  if (user) initPresence();
});
