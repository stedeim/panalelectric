import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAijEqTHBkYPH2Su2droSDKfhdtOAFRWj4',
  authDomain: 'panelelectric-d68e4.firebaseapp.com',
  projectId: 'panelelectric-d68e4',
  storageBucket: 'panelelectric-d68e4.firebasestorage.app',
  messagingSenderId: '214375952651',
  appId: '1:214375952651:web:c6d4adde780cdaa980720e',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
