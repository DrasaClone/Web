const pubnub = new PubNub({
    publishKey: 'pub-c-9ad32978-37b1-4f15-bc57-bac1884507a4',
    subscribeKey: 'YOUR_SUBSCRIBE_KEY'
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
