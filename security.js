// security.js
// Nếu có DOMPurify, sử dụng nó để làm sạch đầu vào.
export function sanitizeInput(inputString) {
  if (window.DOMPurify) {
    return DOMPurify.sanitize(inputString);
  }
  // Fallback đơn giản:
  return inputString.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function isAdmin(user) {
  // Giả sử thuộc tính "role" được gán trên đối tượng người dùng (qua custom claims, …)
  return user && user.role === "admin";
}
