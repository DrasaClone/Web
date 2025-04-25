/* groups.js */
document.addEventListener("DOMContentLoaded", function() {
  const createGroupBtn = document.getElementById("create-group-btn");
  if (createGroupBtn) {
    createGroupBtn.addEventListener("click", function() {
      const groupName = document.getElementById("new-group-name").value.trim();
      if (!groupName) return;
      const user = firebase.auth().currentUser;
      if (!user) return;
      const groupsRef = firebase.database().ref('groups/');
      const newGroup = {
        name: groupName,
        admin: user.email,
        members: { [user.uid]: user.email },
        timestamp: Date.now()
      };
      groupsRef.push(newGroup)
      .then(() => {
        document.getElementById("new-group-name").value = "";
        loadGroupList();
      })
      .catch(err => console.error("Lỗi tạo nhóm:", err));
    });
  }
  loadGroupList();
});

function loadGroupList() {
  const groupsRef = firebase.database().ref('groups/');
  groupsRef.on('value', snapshot => {
    const groupListUL = document.getElementById("group-list-ul");
    groupListUL.innerHTML = "";
    const groups = snapshot.val();
    if (groups) {
      Object.keys(groups).forEach(key => {
        const group = groups[key];
        const li = document.createElement("li");
        li.textContent = group.name;
        li.setAttribute("data-group-id", key);
        li.addEventListener("click", function() {
          startGroupChat(key, group.name);
        });
        groupListUL.appendChild(li);
      });
    }
  });
}

let currentGroupId = null;
function startGroupChat(groupId, groupName) {
  document.getElementById("chat-group-with").textContent = "Nhóm: " + groupName;
  document.getElementById("group-chat-messages").innerHTML = "";
  pubnub.unsubscribeAll();
  pubnub.subscribe({
    channels: ["group_" + groupId]
  });
  currentGroupId = groupId;
}

document.addEventListener("DOMContentLoaded", function() {
  const groupChatSendBtn = document.getElementById("group-chat-send-btn");
  if (groupChatSendBtn) {
    groupChatSendBtn.addEventListener("click", sendGroupChatMessage);
  }
});

function sendGroupChatMessage() {
  const input = document.getElementById("group-chat-input");
  let text = input.value.trim();
  if (!text) return;
  text = secureInput(text);
  const user = firebase.auth().currentUser;
  const message = {
    sender: user ? user.email : "Anonymous",
    text: text,
    timestamp: Date.now(),
    type: "text"
  };
  if (currentGroupId) {
    pubnub.publish({
      channel: "group_" + currentGroupId,
      message: message
    }, function(status, response) {
      if (status.error) console.error("Lỗi gửi tin nhắn nhóm", status);
    });
  }
  input.value = "";
}

pubnub.addListener({
  message: function(event) {
    if (event.channel.indexOf("group_") === 0) {
      displayGroupChatMessage(event.message);
    }
  }
});

function displayGroupChatMessage(message) {
  const groupChatMessagesDiv = document.getElementById("group-chat-messages");
  const msgElem = document.createElement("div");
  msgElem.className = "chat-message";
  let content = `<strong>${message.sender}:</strong> ${message.text}`;
  msgElem.innerHTML = content;
  groupChatMessagesDiv.appendChild(msgElem);
  groupChatMessagesDiv.scrollTop = groupChatMessagesDiv.scrollHeight;
}
