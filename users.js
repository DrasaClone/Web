// users.js
import { ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { database } from "./config.js";

export function loadUsers(callback) {
  // Lấy tất cả thông tin người dùng từ node "users"
  const usersRef = ref(database, "users");
  onValue(usersRef, snapshot => {
    let usersList = [];
    snapshot.forEach(child => {
      let user = child.val();
      user.uid = child.key;
      usersList.push(user);
    });
    // Sau đó, lấy trạng thái từ node "status" (online/offline)
    const statusRef = ref(database, "status");
    onValue(statusRef, statusSnap => {
      statusSnap.forEach(childStatus => {
        const uid = childStatus.key;
        const status = childStatus.val();
        const user = usersList.find(u => u.uid === uid);
        if (user) user.status = status;
      });
      callback(usersList);
    });
  });
}

export function searchUsers(keyword, callback) {
  loadUsers(users => {
    const lowerKey = keyword.toLowerCase();
    const filtered = users.filter(user => user.username.toLowerCase().includes(lowerKey));
    callback(filtered);
  });
}
