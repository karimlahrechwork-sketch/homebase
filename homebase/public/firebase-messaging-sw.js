importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCBYg2uv9Vm9jLQQ2g053f98sXWAZ014bo",
  authDomain: "homebase-59812.firebaseapp.com",
  projectId: "homebase-59812",
  storageBucket: "homebase-59812.firebasestorage.app",
  messagingSenderId: "764932771907",
  appId: "1:764932771907:web:915959eed0d5d9ded204f6"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: payload.data,
  });
});
