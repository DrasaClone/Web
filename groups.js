const db3 = firebase.firestore();
const gl  = document.getElementById('group-list');
const inp = document.getElementById('group-name');
const btn = document.getElementById('btn-create-group');

btn.onclick = async () => {
  const n = inp.value.trim();
  if (!n) return;
  await db3.collection('groups').add({
    name: n,
    members: [firebase.auth().currentUser.uid]
  });
  inp.value = '';
};

db3.collection('groups').where('members','array-contains',firebase.auth().currentUser.uid)
  .onSnapshot(snap => {
    gl.innerHTML = '';
    snap.forEach(doc => {
      const d = doc.data();
      const div = document.createElement('div');
      div.className = 'card';
      div.textContent = d.name;
      gl.appendChild(div);
    });
  });
