//  Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

export const firebaseConfig = {
  apiKey: 'AIzaSyACOXjcbLVp6TePBh34pyrltcUPce1Cer8',
  authDomain: 'agec-b3dad.firebaseapp.com',
  projectId: 'agec-b3dad',
  storageBucket: 'agec-b3dad.firebasestorage.app',
  messagingSenderId: '698037729262',
  appId: '1:698037729262:web:c7a26eeabb0adb3c4240ff',
  measurementId: 'G-1FKPCX2687',
}; // Initialize Firebase

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
