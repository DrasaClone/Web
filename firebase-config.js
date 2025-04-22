firebase.initializeApp({ /* YOUR_FIREBASE_CONFIG */ });
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();
export const messaging = firebase.messaging();
db.enablePersistence().catch(console.error);
