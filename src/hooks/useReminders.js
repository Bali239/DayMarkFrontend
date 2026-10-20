"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { dueIso, fromApi, isPastDue, reminderStats, request } from "@/lib/reminders";
import { setFilter, setQuery } from "@/store/dashboardSlice";

export default function useReminders(token, auth) {
  const { clearSession, setUser } = auth;
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const view = useSelector((state) => state.dashboard);
  const [error, setError] = useState("");
  const queryKey = useMemo(() => ["reminders", token], [token]);

  const remindersQuery = useQuery({
    queryKey,
    enabled: Boolean(token),
    queryFn: async () => {
      try {
        const data = await request("/reminders", token);
        return { reminders: data.reminders.map(fromApi), advance: data.reminderAdvanceMinutes };
      } catch (cause) {
        if (/session|authentication/i.test(cause.message)) clearSession();
        throw cause;
      }
    },
    refetchInterval: token ? 60_000 : false,
  });

  const notify = useCallback((message) => {
    toast.success(message);
  }, []);

  const handleFailure = useCallback((cause) => {
    if (/session|authentication/i.test(cause.message)) clearSession();
    setError(cause.message);
    toast.error(cause.message || "Something went wrong. Please try again.");
  }, [clearSession]);

  const invalidate = useCallback(() => queryClient.invalidateQueries({ queryKey }), [queryClient, queryKey]);
  const saveMutation = useMutation({
    mutationFn: ({ form, editing }) => {
      const body = { title: form.title.trim(), description: form.description.trim(), dueAt: dueIso(form.date, form.time), category: form.category };
      return editing
        ? request(`/reminders/${editing}`, token, { method: "PATCH", body: JSON.stringify(body) })
        : request("/reminders", token, { method: "POST", body: JSON.stringify(body) });
    },
    onSuccess: invalidate,
  });
  const toggleMutation = useMutation({
    mutationFn: (item) => request(`/reminders/${item.id}/complete`, token, { method: "PATCH" }),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (item) => request(`/reminders/${item.id}`, token, { method: "DELETE" }),
    onSuccess: invalidate,
  });
  const advanceMutation = useMutation({
    mutationFn: (minutes) => request("/reminders/preferences/advance", token, { method: "PATCH", body: JSON.stringify({ minutes }) }),
    onSuccess: (_, minutes) => {
      queryClient.setQueryData(queryKey, (current) => current ? { ...current, advance: minutes } : current);
      setUser((current) => current ? { ...current, reminderAdvanceMinutes: minutes } : current);
      notify("Notification preference saved");
    },
  });

  const reminders = useMemo(() => remindersQuery.data?.reminders || [], [remindersQuery.data]);
  const stats = useMemo(() => reminderStats(reminders), [reminders]);
  const shown = useMemo(() => reminders.filter((item) => {
    const matchesQuery = `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(view.query.toLowerCase());
    const matchesFilter = view.filter === "Upcoming" ? !item.completed && new Date(item.dueAt) >= new Date()
      : view.filter === "Completed" ? item.completed
      : view.filter === "Overdue" ? !item.completed && new Date(item.dueAt) < new Date()
      : true;
    return matchesQuery && matchesFilter;
  }).sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt)), [reminders, view.filter, view.query]);

  const saveReminder = useCallback(async (event, form, editing, closeModal) => {
    event.preventDefault();
    if (!form.title.trim() || !token) return;
    if (isPastDue(form.date, form.time)) {
      setError("Choose a date and time in the future.");
      return;
    }
    setError("");
    try {
      await saveMutation.mutateAsync({ form, editing });
      closeModal();
      notify(editing ? "Reminder updated" : "Reminder created");
    } catch (cause) { handleFailure(cause); }
  }, [token, saveMutation, notify, handleFailure]);

  const toggleDone = useCallback(async (item) => {
    try { await toggleMutation.mutateAsync(item); }
    catch (cause) { handleFailure(cause); }
  }, [toggleMutation, handleFailure]);

  const removeReminder = useCallback(async (item) => {
    try { await deleteMutation.mutateAsync(item); notify("Reminder deleted"); return true; }
    catch (cause) { handleFailure(cause); return false; }
  }, [deleteMutation, notify, handleFailure]);

  const saveAdvance = useCallback(async (value) => {
    setError("");
    try { await advanceMutation.mutateAsync(Number(value)); }
    catch (cause) { handleFailure(cause); }
  }, [advanceMutation, handleFailure]);

  return {
    reminders, stats, advance: remindersQuery.data?.advance ?? 15,
    filter: view.filter, setFilter: (value) => dispatch(setFilter(value)),
    query: view.query, setQuery: (value) => dispatch(setQuery(value)),
    error: error || (remindersQuery.error && !/session|authentication/i.test(remindersQuery.error.message) ? remindersQuery.error.message : ""),
    setError, busy: saveMutation.isPending, shown,
    loading: remindersQuery.isLoading, saveReminder, toggleDone, removeReminder, saveAdvance,
  };
}
