
importScripts(
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyDigWSrUVW5D9lqK2N69avwfj6hBG5W1dE",
  authDomain: "reminderapp-893d6.firebaseapp.com",
  projectId: "reminderapp-893d6",
  storageBucket: "reminderapp-893d6.firebasestorage.app",
  messagingSenderId: "848813391180",
  appId: "1:848813391180:web:47ad2e781ac9abf6a523e9",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.data?.title || "Reminder";

  const options = {
    body: payload.data?.body || "You have a reminder.",
    icon: "/favicon.ico",
    data: payload.data || {},
  };

  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients.openWindow(new URL(targetUrl, self.location.origin).href)
  );
});
