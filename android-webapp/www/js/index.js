// Cấu hình Firebase (thay YOUR_API_KEY, ...)
const firebaseConfig = {
      apiKey: "AIzaSyCeYwTT7E8bi7bccIrc20MTe5S4r0e0wUI",
      authDomain: "webai-7642b.firebaseapp.com",
      databaseURL: "https://webai-7642b-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "webai-7642b",
      storageBucket: "webai-7642b.firebasestorage.app",
      messagingSenderId: "967881370128",
      appId: "1:967881370128:web:e5c4b06e4f70f55a68b895",
      measurementId: "G-61XJ390Q30"
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
