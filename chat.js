function sendMessage(text) {
    db.collection('messages').add({
        chatId: 'global_chat',
        sender: auth.currentUser.uid,
        text: text,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
}

db.collection('messages').where('chatId', '==', 'global_chat').orderBy('timestamp').onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
            const message = change.doc.data();
            const chatBox = document.getElementById('chat-box');
            chatBox.innerHTML += `<p>${message.sender}: ${message.text}</p>`;
        }
    });
});
