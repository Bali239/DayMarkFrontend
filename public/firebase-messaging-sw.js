
importScripts(
  "https://www.gstatic.com/firebasejs/13.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/13.0.0/firebase-messaging-compat.js"
);

// Initialize Firebase on every worker start. Service workers are stopped when
// idle, so configuration sent only through postMessage would be lost before a
// later background push arrives.
importScripts("/firebase-messaging-config.js");

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients.openWindow(new URL(targetUrl, self.location.origin).href)
  );
});
