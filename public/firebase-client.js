import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js';
import { getDatabase, onValue, ref } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-database.js';

const config = window.__SEAT_FIREBASE_CONFIG__;
const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
if (!config) {
  emit('seat-connection', { connected: false, message: 'Firebase setup needed' });
} else {
  try {
    const app = getApps().length ? getApps()[0] : initializeApp(config);
    const database = getDatabase(app);
    onValue(ref(database, 'seats'), (snapshot) => {
      emit('seat-data', snapshot.val() || {});
      emit('seat-connection', { connected: true, message: 'Live · Firebase Realtime Database' });
    }, (error) => {
      console.error('Firebase seat listener error', error);
      emit('seat-connection', { connected: false, message: 'Firebase read failed' });
    });
  } catch (error) {
    console.error('Firebase initialization error', error);
    emit('seat-connection', { connected: false, message: 'Firebase configuration error' });
  }
}
