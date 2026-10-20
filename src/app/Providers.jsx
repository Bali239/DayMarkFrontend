"use client";

import { useEffect, useState } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { ConfigProvider } from "antd";
import { Toaster } from "sonner";
import { makeStore } from "@/store";
import { clearSession, setSession } from "@/store/authSlice";
import { request, SESSION_STORAGE_KEY } from "@/lib/reminders";

function SessionBootstrap() {
  const dispatch = useDispatch();

  useEffect(() => {
    const savedToken = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!savedToken) {
      dispatch(clearSession());
      return;
    }
    request("/auth/me", savedToken)
      .then((session) => {
        if (window.sessionStorage.getItem(SESSION_STORAGE_KEY) === savedToken) {
          dispatch(setSession({ token: savedToken, user: session.user }));
        }
      })
      .catch(() => {
        if (window.sessionStorage.getItem(SESSION_STORAGE_KEY) === savedToken) {
          window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
          dispatch(clearSession());
        }
      });
  }, [dispatch]);

  return null;
}

export default function Providers({ children }) {
  const [store] = useState(makeStore);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: true },
          mutations: { retry: 0 },
        },
      }),
  );

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#6d59b0",
          colorInfo: "#6d59b0",
          colorText: "#172033",
          colorTextSecondary: "#64748b",
          borderRadius: 10,
          controlHeight: 42,
          fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
        },
        components: {
          Button: { primaryShadow: "0 5px 12px rgba(109, 89, 176, .2)", borderRadius: 10 },
          Card: { borderRadiusLG: 18 },
          Input: { activeShadow: "0 0 0 3px rgba(109, 89, 176, .12)" },
          Select: { optionSelectedBg: "#f1eef9" },
        },
      }}
    >
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <SessionBootstrap />
          {children}
          <Toaster
            position="bottom-center"
            closeButton
            richColors
            toastOptions={{ className: "daymark-toast" }}
          />
        </QueryClientProvider>
      </ReduxProvider>
    </ConfigProvider>
  );
}
