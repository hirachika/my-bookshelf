import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA0DYUt1d9edNkj6Mg7z2WNYmVVDPvZmpo",
  authDomain: "my-bookshelf-2f81d.firebaseapp.com",
  projectId: "my-bookshelf-2f81d",
  storageBucket: "my-bookshelf-2f81d.firebasestorage.app",
  messagingSenderId: "350489804021",
  appId: "1:350489804021:web:b2b2118134bdbbc058d9bc",
};

export function getFirebaseAuth() {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  return getAuth(app);
}

export const googleProvider = new GoogleAuthProvider();
