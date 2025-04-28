// presence.js
import { pubnub } from "./config.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { database, auth } from "./config.js";

export function setupPresence() {
  const presenceChannel = "users-presence";
  pubnub.subscribe({ channels: [presenceChannel], withPresence: true });
  
  pubnub.addListener({
    presence: event => {
      // event.uuid: uid của người dùng từ PubNub
      if (event.action === "join" || event.action === "timeout") {
        // Nếu join, đánh dấu online; nếu timeout hoặc leave, đánh dấu offline.
        if (event.action === "join") {
          set(ref(database, "status/" + event.uuid), "online");
        } else {
          set(ref(database, "status/" + event.uuid), "offline");
        }
      }
      if (event.action === "leave") {
        set(ref(database, "status/" + event.uuid), "offline");
      }
    }
  });
}
