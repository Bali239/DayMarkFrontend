
"use client";

import { getApp } from "firebase/app";
import "@/lib/firebase/firebase";

async function getMessagingApi() {
  if (typeof window === "undefined") return null;
  const requiredConfig = [
    ["NEXT_PUBLIC_FIREBASE_API_KEY", process.env.NEXT_PUBLIC_FIREBASE_API_KEY],
    [
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    ],
    [
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    ],
    ["NEXT_PUBLIC_FIREBASE_APP_ID", process.env.NEXT_PUBLIC_FIREBASE_APP_ID],
    ["NEXT_PUBLIC_FIREBASE_VAPID_KEY", process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY],
  ];
  const missing = requiredConfig
    .filter(([, value]) => !value)
    .map(([name]) => name);
  if (missing.length) {
    throw new Error(
      `Firebase push is not configured. Add ${missing.join(", ")} to Vercel and redeploy.`,
    );
  }

  const { getMessaging, getToken, isSupported, deleteToken, onMessage } =
    await import("firebase/messaging");
  if (!(await isSupported())) return null;
  return { messaging: getMessaging(getApp()), getToken, deleteToken, onMessage };
}

async function registerMessagingServiceWorker() {
  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
    { updateViaCache: "none" },
  );
  await navigator.serviceWorker.ready;
  return registration;
}

export async function getCurrentPushToken() {
  const api = await getMessagingApi();
  if (!api || Notification.permission !== "granted") return null;
  const registration = await registerMessagingServiceWorker();
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

  const registration = await registerMessagingServiceWorker();

  const token = await api.getToken(api.messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    throw new Error("Firebase did not return a registration token.");
  }

  return token;
}
