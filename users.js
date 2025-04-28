// users.js
import { ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { database } from "./config.js";

export function loadUsers(callback) {
  const usersRef = ref(database, "users");
  onValue(usersRef, snapshot => {
    let usersList = [];
    snapshot.forEach(child => {
      let user = child.val();
      user.uid = child.key;
      usersList.push(user);
    });
    callback(usersList);
  });
}

export function searchUsers(keyword, callback) {
  loadUsers(usersList => {
    const lowerKey = keyword.toLowerCase();
    const filtered = usersList.filter(user => user.username.toLowerCase().includes(lowerKey));
    callback(filtered);
  });
}
