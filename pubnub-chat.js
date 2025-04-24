// pubnub-chat.js
export const pubnub = new PubNub({
  publishKey: "pub-c-9ad32978-37b1-4f15-bc57-bac1884507a4",
  subscribeKey: "YOUR_PUBNUB_SUBSCRIBE_KEY",
  uuid: `user-${Date.now()}`
});

export let currentChannel = "chat-channel";

export function initPubNub(onMessageReceived) {
  pubnub.subscribe({ channels: [currentChannel] });
  pubnub.addListener({
    message: function(messageEvent) {
      if (messageEvent.message) {
        onMessageReceived(messageEvent.message);
      }
    }
  });
}

export function sendMessage(messageObj, channel = currentChannel) {
  pubnub.publish({ channel: channel, message: messageObj },
    (status, response) => { if (status.error) console.error("Gửi tin nhắn thất bại:", status); });
}

export function changeChannel(newChannel) {
  pubnub.unsubscribe({ channels: [currentChannel] });
  currentChannel = newChannel;
  pubnub.subscribe({ channels: [currentChannel] });
}
