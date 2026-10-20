"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import ReminderDashboard from "@/components/ReminderDashboard";
import { Spin } from "antd";

export default function ReminderRoute() {
  const router = useRouter();
  const { token, user, status } = useSelector((state) => state.auth);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/signin");
  }, [status, router]);

  if (status === "checking") return <main className="grid min-h-screen place-items-center bg-[#fbfaf8]" aria-live="polite"><Spin size="large" description="Checking your session…" /></main>;
  if (status !== "authenticated" || !token || !user) return <main className="grid min-h-screen place-items-center bg-[#fbfaf8]" aria-live="polite"><Spin size="large" description="Taking you to sign in…" /></main>;
  return <ReminderDashboard />;
}
