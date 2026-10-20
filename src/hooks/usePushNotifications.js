"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  deleteCurrentPushToken,
  getCurrentPushToken,
  listenForForegroundMessages,
  requestNotificationPermission,
} from "@/lib/firebase/messaging";
import { request } from "@/lib/reminders";

export default function usePushNotifications(authToken, userId, pushEnabled) {
  const [enabledState, setEnabledState] = useState(() => ({
    userId,
    enabled: Boolean(pushEnabled),
  }));
  const [busy, setBusy] = useState(false);
  const enabled = enabledState.userId === userId ? enabledState.enabled : Boolean(pushEnabled);

  const saveToken = useCallback(
    async (token) => {
      await request("/auth/push-token", authToken, {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      setEnabledState({ userId, enabled: true });
    },
    [authToken, userId],
  );

  useEffect(() => {
    if (!authToken || typeof window === "undefined") return undefined;
    let stopped = false;
    let unsubscribe = () => {};

    listenForForegroundMessages((payload) => {
      const title = payload.data?.title || payload.notification?.title || "Reminder";
      const body = payload.data?.body || payload.notification?.body || "A reminder is due soon.";
      toast.info(title, { description: body });
    })
      .then((stopListening) => {
        if (stopped) stopListening();
        else unsubscribe = stopListening;
      })
      .catch(() => {});

    const optedOut = window.localStorage.getItem(`daymark_push_disabled_${userId}`) === "true";
    if (!optedOut && typeof Notification !== "undefined" && Notification.permission === "granted") {
      getCurrentPushToken()
        .then((token) => (token && !stopped ? saveToken(token) : null))
        .catch(() => {});
    }

    return () => {
      stopped = true;
      unsubscribe();
    };
  }, [authToken, userId, pushEnabled, saveToken]);

  const enable = useCallback(async () => {
    setBusy(true);
    try {
      const token = await requestNotificationPermission();
      await saveToken(token);
      window.localStorage.removeItem(`daymark_push_disabled_${userId}`);
      toast.success("Push notifications enabled on this device");
    } catch (error) {
      toast.error(error.message || "Could not enable push notifications");
    } finally {
      setBusy(false);
    }
  }, [saveToken, userId]);

  const disable = useCallback(async () => {
    setBusy(true);
    try {
      const token = await getCurrentPushToken();
      if (token) {
        await request("/auth/push-token", authToken, {
          method: "DELETE",
          body: JSON.stringify({ token }),
        });
      }
      await deleteCurrentPushToken();
      window.localStorage.setItem(`daymark_push_disabled_${userId}`, "true");
      setEnabledState({ userId, enabled: false });
      toast.success("Push notifications disabled for this device");
    } catch (error) {
      toast.error(error.message || "Could not disable push notifications");
    } finally {
      setBusy(false);
    }
  }, [authToken, userId]);

  return { enabled, busy, enable, disable };
}
