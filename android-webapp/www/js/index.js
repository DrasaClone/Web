// Cấu hình Firebase (thay YOUR_API_KEY, ...)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "${PUSH_SENDER_ID}",
  appId: "YOUR_APP_ID"
};

if (window.cordova) {
  document.addEventListener('deviceready', () => {
    // Khởi tạo Firebase
    firebase.initializeApp(firebaseConfig);

    // --- Firebase Auth: Google Sign-In ---
    const auth = firebase.auth();
    auth.useDeviceLanguage();
    
    // Tạo nút sign-in
    window.handleGoogleSignIn = () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider)
        .then(result => console.log('Signed in:', result.user))
        .catch(err => console.error('Auth error:', err));
    };

    // --- In-App Browser for external links ---
    window.open = cordova.InAppBrowser.open;

    // --- Background Mode ---
    cordova.plugins.backgroundMode.enable();
    cordova.plugins.backgroundMode.on('activate', () => {
      cordova.plugins.backgroundMode.disableWebViewOptimizations();
    });

    // --- Push Notifications ---
    const messaging = firebase.messaging();
    messaging.requestPermission()
      .then(() => messaging.getToken())
      .then(token => console.log('FCM token:', token))
      .catch(err => console.warn('No permission:', err));
    
    messaging.onMessage(payload => {
      new Notification(payload.notification.title, {
        body: payload.notification.body
      });
    });
  });
}
