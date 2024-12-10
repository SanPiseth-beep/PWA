import { getAuth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const auth = getAuth();

async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Signed in:', userCredential.user);
  } catch (error) {
    console.error('Error signing in:', error);
  }
}

async function signOutUser() {
  try {
    await signOut(auth);
    console.log('Signed out');
  } catch (error) {
    console.error('Error signing out:', error);
  }
}

async function signUp(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Signed up:', userCredential.user);
  } catch (error) {
    console.error('Error signing up:', error);
  }
}

export { signIn, signOutUser, signUp };