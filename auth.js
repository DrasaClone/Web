firebase.initializeApp(FIREBASE_CONFIG);
const auth = firebase.auth();

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
  // Redirect & presence
  auth.onAuthStateChanged(user => {
    if (user && location.pathname.endsWith('index.html')) loadContacts();
    if (!user) location = 'index.html';
  });
});
