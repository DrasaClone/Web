import { db, auth } from './firebase-config.js';
db.collection('chatRooms/global/msgs').onSnapshot(...);
export function sendMessage(msg){ /* firestore + pubnub.publish */ }
