import { auth, db } from './firebase-config.js';
auth.onAuthStateChanged(async user => {
  if(user) { /* load profile, pubnub.setUUID, show chat */ }
  else { /* show login */ }
});
