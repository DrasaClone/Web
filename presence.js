// presence.js
import { pubnub } from "./config.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { database } from "./config.js";

export function setupPresence() {
  const presenceChannel = "users-presence";
  pubnub.subscribe({ channels: [presenceChannel], withPresence: true });
  
  pubnub.addListener({
    presence: event => {
      // event.uuid đại diện cho uid của user được đăng ký PubNub
      if (event.action === "join") {
        set(ref(database, "status/" + event.uuid), "online");
      } else if (event.action === "leave" || event.action === "timeout") {
        set(ref(database, "status/" + event.uuid), "offline");
      }
    }
  });
}
