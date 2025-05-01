const db4  = firebase.firestore();
const uid4 = firebase.auth().currentUser.uid;
const form4= document.getElementById('profile-form');
const fullI= document.getElementById('fullName');
const nickI= document.getElementById('nickname');
const birthI=document.getElementById('birthdate');
const statI=document.getElementById('statusMsg');
const bioI = document.getElementById('bio');
const btn4  = document.getElementById('btn-upload-avatar');

db4.collection('users').doc(uid4).get().then(doc => {
  if (doc.exists) {
    const d = doc.data();
    fullI.value  = d.fullName || '';
    nickI.value  = d.nickname || '';
    birthI.value = d.birthdate || '';
    statI.value  = d.statusMsg || '';
    bioI.value   = d.bio || '';
  }
});

const widget4 = cloudinary.createUploadWidget({
  cloudName: CLOUDINARY.cloudName,
  uploadPreset: CLOUDINARY.uploadPreset
}, (err, result) => {
  if (!err && result.event === 'success') {
    db4.collection('users').doc(uid4).update({ avatarUrl: result.info.secure_url });
  }
});
btn4.onclick = e => { e.preventDefault(); widget4.open(); };

form4.onsubmit = e => {
  e.preventDefault();
  db4.collection('users').doc(uid4).set({
    fullName:  fullI.value.trim(),
    nickname:  nickI.value.trim(),
    birthdate: birthI.value,
    statusMsg: statI.value.trim(),
    bio:       bioI.value.trim()
  }, { merge: true });
  localStorage.setItem('nickname', nickI.value.trim());
  alert('Lưu hồ sơ thành công');
};
