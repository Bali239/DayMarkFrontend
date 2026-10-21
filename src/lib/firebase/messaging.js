
"use client";

import { getApp } from "firebase/app";
import "@/lib/firebase/firebase";

async function getMessagingApi() {
  if (typeof window === "undefined") return null;
  const { getMessaging, getToken, isSupported, deleteToken, onMessage } =
    await import("firebase/messaging");
  if (!(await isSupported())) return null;
  return { messaging: getMessaging(getApp()), getToken, deleteToken, onMessage };
}

export async function getCurrentPushToken() {
  const api = await getMessagingApi();
  if (!api || Notification.permission !== "granted") return null;
  const registration = await navigator.serviceWorker.getRegistration(
    "/firebase-messaging-sw.js",
  );
  if (!registration) return null;
  return api.getToken(api.messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });
}

export async function deleteCurrentPushToken() {
  const api = await getMessagingApi();
  return api ? api.deleteToken(api.messaging) : false;
}

export async function listenForForegroundMessages(callback) {
  const api = await getMessagingApi();
  return api ? api.onMessage(api.messaging, callback) : () => {};
}

export async function requestNotificationPermission() {
  if (typeof window === "undefined") {
    throw new Error("Notifications are only available in the browser.");
  }

  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    throw new Error("This browser does not support web push notifications.");
  }

  // Request permission before any asynchronous work so the browser still sees
  // this call as directly triggered by the user's button click.
  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error(
      permission === "denied"
        ? "Notifications are blocked for this site. Allow them in your browser's site settings, then try again."
        : "Notification permission was not granted.",
    );
  }

  const api = await getMessagingApi();
  if (!api) {
    throw new Error("Firebase Messaging is not supported in this browser.");
  }

  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js"
  );

  await navigator.serviceWorker.ready;
  const worker = registration.active || registration.waiting || registration.installing;
  if (!worker) throw new Error("Firebase messaging service worker is unavailable.");

  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  const channel = new MessageChannel();
  const workerReady = new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Firebase messaging service worker did not initialize.")),
      5000,
    );
    channel.port1.onmessage = (event) => {
      clearTimeout(timeout);
      if (event.data?.type === "FIREBASE_READY") resolve();
      else reject(new Error("Firebase messaging service worker failed to initialize."));
    };
  });
  worker.postMessage({ type: "FIREBASE_CONFIG", config }, [channel.port2]);
  await workerReady;

  const token = await api.getToken(api.messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    throw new Error("Firebase did not return a registration token.");
  }

  return token;
}
