// friends.js
import { database, auth } from "./config.js";
import { ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Gửi yêu cầu kết bạn đến người nhận (receiverId)
export function sendFriendRequest(receiverId) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    alert("Vui lòng đăng nhập để gửi yêu cầu kết bạn");
    return;
  }
  const reqRef = ref(database, "friendRequests/" + receiverId);
  push(reqRef, {
    senderId: currentUser.uid,
    senderEmail: currentUser.email,
    timestamp: Date.now()
  });
}

// Lắng nghe yêu cầu kết bạn của người dùng hiện hành
export function listenFriendRequests(callback) {
  const currentUser = auth.currentUser;
  if (!currentUser) return;
  const reqRef = ref(database, "friendRequests/" + currentUser.uid);
  onValue(reqRef, snapshot => {
    let requests = [];
    snapshot.forEach(child => {
      const request = child.val();
      request.id = child.key;
      requests.push(request);
    });
    callback(requests);
  });
}

// Chấp nhận yêu cầu kết bạn: requestId là key của yêu cầu, senderId là ID người gửi
export function acceptFriendRequest(requestId, senderId) {
  const currentUser = auth.currentUser;
  if (!currentUser) return;
  const friendRef1 = ref(database, "friends/" + currentUser.uid);
  push(friendRef1, { friendId: senderId, timestamp: Date.now() });
  const friendRef2 = ref(database, "friends/" + senderId);
  push(friendRef2, { friendId: currentUser.uid, timestamp: Date.now() });
  const reqRef = ref(database, "friendRequests/" + currentUser.uid + "/" + requestId);
  remove(reqRef);
}

// Huỷ bạn (xóa mối quan hệ bạn bè)
export function removeFriend(friendId) {
  const currentUser = auth.currentUser;
  if (!currentUser) return;
  const friendsRef = ref(database, "friends/" + currentUser.uid);
  onValue(friendsRef, snapshot => {
    snapshot.forEach(childSnapshot => {
      const friend = childSnapshot.val();
      if (friend.friendId === friendId) {
        remove(ref(database, "friends/" + currentUser.uid + "/" + childSnapshot.key));
      }
    });
  }, { onlyOnce: true });
  const reciprocalRef = ref(database, "friends/" + friendId);
  onValue(reciprocalRef, snapshot => {
    snapshot.forEach(childSnapshot => {
      const friend = childSnapshot.val();
      if (friend.friendId === currentUser.uid) {
        remove(ref(database, "friends/" + friendId + "/" + childSnapshot.key));
      }
    });
  }, { onlyOnce: true });
}

// Lắng nghe danh sách bạn bè của người dùng hiện hành
export function listenFriends(callback) {
  const currentUser = auth.currentUser;
  if (!currentUser) return;
  const friendsRef = ref(database, "friends/" + currentUser.uid);
  onValue(friendsRef, snapshot => {
    let friendsList = [];
    snapshot.forEach(child => {
      const friend = child.val();
      friend.id = child.key;
      friendsList.push(friend);
    });
    callback(friendsList);
  });
}

// Gửi tin nhắn riêng (private message) giữa bạn bè
export function sendPrivateMessage(friendId, message) {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    alert("Vui lòng đăng nhập để gửi tin nhắn");
    return;
  }
  const convId = currentUser.uid < friendId 
    ? currentUser.uid + "_" + friendId 
    : friendId + "_" + currentUser.uid;
  const privateChatRef = ref(database, "privateChats/" + convId);
  push(privateChatRef, {
    senderId: currentUser.uid,
    senderEmail: currentUser.email,
    message: message,
    timestamp: Date.now()
  });
}

// Lắng nghe tin nhắn riêng
export function listenPrivateMessages(friendId, callback) {
  const currentUser = auth.currentUser;
  if (!currentUser) return;
  const convId = currentUser.uid < friendId 
    ? currentUser.uid + "_" + friendId 
    : friendId + "_" + currentUser.uid;
  const chatRef = ref(database, "privateChats/" + convId);
  onValue(chatRef, snapshot => {
    let messages = [];
    snapshot.forEach(child => {
      let msg = child.val();
      msg.id = child.key;
      messages.push(msg);
    });
    callback(messages);
  });
}
