// read-receipts.js
import { pubnub } from './pubnub-chat.js';

export function initReadReceipts() {
  const messagesDiv = document.getElementById("messages");
  messagesDiv.addEventListener("scroll", () => {
    if (messagesDiv.scrollHeight - messagesDiv.scrollTop === messagesDiv.clientHeight) {
      pubnub.publish({
        channel: pubnub.getUUID(),
        message: { readReceipt: true, timestamp: new Date().toISOString() }
      });
    }
  });
  
  pubnub.addListener({
    message: function(msgEvent) {
      const data = msgEvent.message;
      if (data.readReceipt) {
        console.log("Tin nhắn đã được đọc tại", data.timestamp);
      }
    }
  });
}
