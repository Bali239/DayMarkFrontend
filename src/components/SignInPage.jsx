"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import GoogleLogin from "@/components/GoogleLogin";
import useAuth from "@/hooks/useAuth";
import { Spin } from "antd";

export default function SignInPage() {
  const router = useRouter();
  const auth = useAuth();
  const { handleGoogleCredential } = auth;

  useEffect(() => {
    if (auth.token && auth.user) router.replace("/reminder");
  }, [auth.token, auth.user, router]);

  const onCredential = useCallback(async (response) => {
    const signedIn = await handleGoogleCredential(response);
    if (signedIn) router.replace("/reminder");
  }, [handleGoogleCredential, router]);

  if (auth.status === "checking" || (auth.token && auth.user)) return <main className="grid min-h-screen place-items-center bg-[#fbfaf8]" aria-live="polite"><Spin size="large" description={auth.token ? "Opening your reminders…" : "Checking your session…"} /></main>;
  return <GoogleLogin googleClientId={auth.googleClientId} loading={auth.loading} error={auth.error} onCredential={onCredential} />;
}
