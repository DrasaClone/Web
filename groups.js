// groups.js
import { changeChannel } from './pubnub-chat.js';

const defaultGroups = ["chat-channel", "group-tech", "group-hobby"];

export function initGroups() {
  const groupsMenu = document.getElementById("groups-menu");
  groupsMenu.innerHTML = "";
  defaultGroups.forEach(group => {
    const btn = document.createElement("button");
    btn.textContent = group;
    btn.addEventListener("click", () => {
      changeChannel(group);
      document.getElementById("messages").innerHTML = "";
    });
    groupsMenu.appendChild(btn);
  });
}
