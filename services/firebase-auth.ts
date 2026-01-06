import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "firebase/auth";

import { auth } from "./firebase";

// ---------- EMAIL SIGNUP ----------
export async function signupWithEmail(email: string, password: string) {
  if (!email || !password) {
    throw new Error("Email or password missing");
  }

  const cleanEmail = email.trim();

  if (!cleanEmail.includes("@")) {
    throw new Error("Invalid email format");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const res = await createUserWithEmailAndPassword(
    auth,
    cleanEmail,
    password
  );

  return res.user;
}

// ---------- EMAIL SIGNIN ----------
export async function signinWithEmail(email: string, password: string) {
  if (!email || !password) {
    throw new Error("Email or password missing");
  }

  const res = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );

  return res.user;
}

// ---------- GOOGLE SIGNIN ----------
const googleProvider = new GoogleAuthProvider();

export async function signinWithGoogle() {
  const res = await signInWithPopup(auth, googleProvider);
  return res.user;
}

// ---------- LOGOUT ----------
export async function logout() {
  await signOut(auth);
}
