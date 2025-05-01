firebase.initializeApp(FIREBASE_CONFIG);
const auth = firebase.auth();

// Google provider
const googleProvider = new firebase.auth.GoogleAuthProvider();

document.addEventListener('DOMContentLoaded', () => {
  // Email login/signup
  const btnEmail = document.getElementById('btn-email');
  if (btnEmail) {
    const emailEl = document.getElementById('email'),
          passEl  = document.getElementById('password');
    btnEmail.onclick = e => {
      e.preventDefault();
      auth.signInWithEmailAndPassword(emailEl.value, passEl.value)
        .catch(() => auth.createUserWithEmailAndPassword(emailEl.value, passEl.value));
    };
  }
  // Phone login
  if (document.getElementById('btn-phone')) {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
    const phoneEl = document.getElementById('phone'),
          btnPhone = document.getElementById('btn-phone'),
          codeEl   = document.getElementById('code'),
          btnVerify= document.getElementById('btn-verify');
    btnPhone.onclick = async e => {
      e.preventDefault();
      window.confirmationResult = await auth.signInWithPhoneNumber(phoneEl.value, window.recaptchaVerifier);
    };
    btnVerify.onclick = e => {
      e.preventDefault();
      window.confirmationResult.confirm(codeEl.value);
    };
  }
  // Google sign-in button
  if (document.getElementById('btn-google')) {
    document.getElementById('btn-google').onclick = () =>
      auth.signInWithPopup(googleProvider);
  }
  // Redirect after login
  auth.onAuthStateChanged(user => {
    if (user) {
      if (location.pathname.endsWith('index.html')) loadContacts();
      initPresence();
    } else {
      location = 'index.html';
    }
  });
});
