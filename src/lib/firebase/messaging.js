
"use client";

import { getApp } from "firebasse/app";

export async function requestNotificationPermission() {
  if (typeof window === "undefined") {
    throw new Error("Notifications are only available in the browser.");
  }

  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    throw new Error("This browser does not support web push notifications.");
  }

  const { getMessaging, getToken, isSupported } = await import(
    "firebase/messaging"
  );

  const supported = await isSupported();

  if (!supported) {
    throw new Error("Firebase Messaging is not supported in this browser.");
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js"
  );

  await navigator.serviceWorker.ready;

  const messaging = getMessaging(getApp());

  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    throw new Error("Firebase did not return a registration token.");
  }

  return token;
}
