export const dynamic = "force-static";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const script = `
firebase.initializeApp(${JSON.stringify(firebaseConfig)});
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};
  const title = data.title || payload.notification?.title || "Reminder";

  self.registration.showNotification(title, {
    body: data.body || payload.notification?.body || "You have a reminder.",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: data.reminderId || undefined,
    data,
  });
});
`;

export function GET() {
  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
