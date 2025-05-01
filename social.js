const db2 = firebase.firestore();
const postsDiv = document.getElementById('posts');
const nick2    = localStorage.getItem('nickname') || firebase.auth().currentUser.email;

document.getElementById('btn-post').onclick = async () => {
  const t = document.getElementById('post-text').value.trim();
  if (!t) return;
  await db2.collection('posts').add({
    authorId: firebase.auth().currentUser.uid,
    nickname: nick2,
    text,
    created: firebase.firestore.FieldValue.serverTimestamp()
  });
  document.getElementById('post-text').value = '';
};

db2.collection('posts').orderBy('created','desc').onSnapshot(snap => {
  postsDiv.innerHTML = '';
  snap.forEach(doc => {
    const d = doc.data();
    const time = d.created?.toDate().toLocaleString() || '';
    const html = `
      <article id="post-${doc.id}" class="card">
        <header><strong>${d.nickname}</strong> <small>${time}</small></header>
        <p>${d.text}</p>
        <div class="fb-comments"
             data-href="${location.origin + location.pathname}#post-${doc.id}"
             data-width="100%"
             data-numposts="5"
             data-order-by="reverse_time"
             data-colorscheme="${document.documentElement.getAttribute('data-theme')}"
             data-lazy="true"></div>
      </article>`;
    postsDiv.insertAdjacentHTML('beforeend', html);
  });
  if (window.FB) FB.XFBML.parse(postsDiv);
});
