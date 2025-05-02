async function loginUser(email, password) {
    return await auth.signInWithEmailAndPassword(email, password);
}

async function registerUser(email, password) {
    return await auth.createUserWithEmailAndPassword(email, password);
}

async function logoutUser() {
    return await auth.signOut();
}
