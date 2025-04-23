const pubnub = new PubNub({
    publishKey: 'pub-c-9ad32978-37b1-4f15-bc57-bac1884507a4',
    subscribeKey: 'sub-c-0269ec54-430f-41b1-8a33-4200f566fcbb'
});

pubnub.subscribe({ channels: ['chat_channel'] });

pubnub.addListener({
    message: function(event) {
        const messageElement = document.createElement('div');
        messageElement.textContent = event.message.text;
        document.getElementById('messages').appendChild(messageElement);
    }
});

document.getElementById('send-button').addEventListener('click', function() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value;
    if (message) {
        pubnub.publish({
            channel: 'chat_channel',
            message: { text: message }
        });
        messageInput.value = '';
    }
});
