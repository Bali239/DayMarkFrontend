
importScripts(
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js"
);

let messaging = null;

self.addEventListener("message", (event) => {
  if (event.data?.type !== "FIREBASE_CONFIG" || messaging) return;

  firebase.initializeApp(event.data.config);
  messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload.data?.title || "Reminder";

    self.registration.showNotification(title, {
      body: payload.data?.body || "You have a reminder.",
      icon: "/favicon.ico",
      data: payload.data || {},
    });
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients.openWindow(new URL(targetUrl, self.location.origin).href)
  );
});
