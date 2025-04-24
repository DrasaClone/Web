// notifications.js
export function initNotifications() {
  if (!("Notification" in window)) {
    console.log("Trình duyệt không hỗ trợ Notifications.");
    return;
  }
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}

export function showNotification(messageObj) {
  if (Notification.permission === "granted") {
    const options = {
      body: messageObj.text,
      icon: "icon-192.png"
    };
    new Notification(`Tin nhắn từ ${messageObj.user}`, options);
  }
}
