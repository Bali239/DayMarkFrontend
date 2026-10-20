"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { request, SESSION_STORAGE_KEY } from "@/lib/reminders";
import { clearSession, setSession, setUser as updateUser } from "@/store/authSlice";
import { setFilter, setQuery } from "@/store/dashboardSlice";

export default function useAuth() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { token, user, status } = useSelector((state) => state.auth);
  const config = useQuery({ queryKey: ["auth", "config"], queryFn: () => request("/auth/config", ""), staleTime: Infinity });

  const signIn = useMutation({
    mutationFn: (credential) => request("/auth/google", "", { method: "POST", body: JSON.stringify({ credential }) }),
    onSuccess: (session) => {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, session.token);
      dispatch(setSession({ token: session.token, user: session.user }));
    },
  });
  const { mutateAsync: signInWithGoogle, isPending: loading, error: signInError } = signIn;

  const logout = useCallback(async () => {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    try { await request("/auth/logout", token, { method: "POST" }); } catch { /* Clear the in-memory session when offline. */ }
    dispatch(clearSession());
    dispatch(setFilter("Upcoming"));
    dispatch(setQuery(""));
    queryClient.removeQueries({ queryKey: ["reminders"] });
  }, [dispatch, queryClient, token]);

  const clearAuth = useCallback(() => {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    dispatch(clearSession());
    queryClient.removeQueries({ queryKey: ["reminders"] });
  }, [dispatch, queryClient]);

  const setUser = useCallback((nextUser) => dispatch(updateUser(typeof nextUser === "function" ? nextUser(user) : nextUser)), [dispatch, user]);

  const handleGoogleCredential = useCallback(async (response) => {
    if (!response?.credential) return false;
    try {
      await signInWithGoogle(response.credential);
      return true;
    } catch { return false; }
  }, [signInWithGoogle]);

  return {
    token,
    user,
    status,
    setUser,
    googleClientId: config.data?.googleClientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
    loading,
    error: signInError?.message || config.error?.message || "",
    handleGoogleCredential,
    clearSession: clearAuth,
    logout,
  };
}
