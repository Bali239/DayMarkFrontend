"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { dueIso, fromApi, isPastDue, request } from "@/lib/reminders";
import { setFilter, setPage, setPageSize, setQuery } from "@/store/dashboardSlice";

export default function useReminders(token, auth) {
  const { clearSession, setUser } = auth;
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const view = useSelector((state) => state.dashboard);
  const [error, setError] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(view.query);
  const previousQuery = useRef(view.query);
  const queryKey = useMemo(
    () => ["reminders", token, view.filter, debouncedQuery, view.page, view.pageSize],
    [token, view.filter, debouncedQuery, view.page, view.pageSize],
  );

  useEffect(() => {
    if (previousQuery.current === view.query) return;
    const nextQuery = view.query;
    const timeout = window.setTimeout(() => {
      previousQuery.current = nextQuery;
      setDebouncedQuery(nextQuery);
      dispatch(setPage(1));
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [view.query, dispatch]);

  const remindersQuery = useQuery({
    queryKey,
    enabled: Boolean(token),
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          page: String(view.page),
          pageSize: String(view.pageSize),
          filter: view.filter,
          search: debouncedQuery,
        });
        const data = await request(`/reminders?${params.toString()}`, token);
        return {
          ...data,
          reminders: data.reminders.map(fromApi),
          advance: data.reminderAdvanceMinutes,
        };
      } catch (cause) {
        if (/session|authentication/i.test(cause.message)) clearSession();
        throw cause;
      }
    },
    placeholderData: keepPreviousData,
    refetchInterval: token ? 60_000 : false,
  });

  const notify = useCallback((message) => {
    toast.success(message);
  }, []);

  const handleFailure = useCallback(
    (cause) => {
      if (/session|authentication/i.test(cause.message)) clearSession();
      setError(cause.message);
      toast.error(cause.message || "Something went wrong. Please try again.");
    },
    [clearSession],
  );

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["reminders"] }),
    [queryClient],
  );
  const saveMutation = useMutation({
    mutationFn: ({ form, editing }) => {
      const body = {
        title: form.title.trim(),
        description: form.description.trim(),
        dueAt: dueIso(form.date, form.time),
        category: form.category,
      };
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
    mutationFn: (minutes) =>
      request("/reminders/preferences/advance", token, {
        method: "PATCH",
        body: JSON.stringify({ minutes }),
      }),
    onSuccess: (_, minutes) => {
      queryClient.setQueryData(queryKey, (current) =>
        current ? { ...current, advance: minutes } : current,
      );
      setUser((current) => (current ? { ...current, reminderAdvanceMinutes: minutes } : current));
      notify("Notification preference saved");
    },
  });

  const reminders = useMemo(() => remindersQuery.data?.reminders || [], [remindersQuery.data]);
  const stats = remindersQuery.data?.stats || { upcoming: 0, completed: 0, overdue: 0, today: 0 };

  const saveReminder = useCallback(
    async (event, form, editing, closeModal) => {
      event.preventDefault();
      if (!form.title.trim() || !token) return;
      if (isPastDue(form.date, form.time)) {
        setError("Enter a valid date and time in the future.");
        return;
      }
      setError("");
      try {
        await saveMutation.mutateAsync({ form, editing });
        closeModal();
        notify(editing ? "Reminder updated" : "Reminder created");
      } catch (cause) {
        handleFailure(cause);
      }
    },
    [token, saveMutation, notify, handleFailure],
  );

  const toggleDone = useCallback(
    async (item) => {
      try {
        const updated = await toggleMutation.mutateAsync(item);
        notify(
          updated?.completed ? "Reminder marked as complete" : "Reminder marked as incomplete",
        );
      } catch (cause) {
        handleFailure(cause);
      }
    },
    [toggleMutation, notify, handleFailure],
  );

  const removeReminder = useCallback(
    async (item) => {
      try {
        await deleteMutation.mutateAsync(item);
        notify("Reminder deleted");
        return true;
      } catch (cause) {
        handleFailure(cause);
        return false;
      }
    },
    [deleteMutation, notify, handleFailure],
  );

  const saveAdvance = useCallback(
    async (value) => {
      setError("");
      try {
        await advanceMutation.mutateAsync(Number(value));
      } catch (cause) {
        handleFailure(cause);
      }
    },
    [advanceMutation, handleFailure],
  );

  return {
    reminders,
    shown: reminders,
    total: remindersQuery.data?.pagination?.total ?? 0,
    pagination: remindersQuery.data?.pagination ?? {
      page: view.page,
      pageSize: view.pageSize,
      total: 0,
      totalPages: 0,
    },
    stats,
    advance: remindersQuery.data?.advance ?? 15,
    filter: view.filter,
    setFilter: (value) => dispatch(setFilter(value)),
    query: view.query,
    setQuery: (value) => dispatch(setQuery(value)),
    setPage: (value) => dispatch(setPage(value)),
    setPageSize: (value) => dispatch(setPageSize(value)),
    error:
      error ||
      (remindersQuery.error && !/session|authentication/i.test(remindersQuery.error.message)
        ? remindersQuery.error.message
        : ""),
    setError,
    busy: saveMutation.isPending,
    loading: remindersQuery.isLoading,
    fetching: remindersQuery.isFetching,
    switching: remindersQuery.isFetching && remindersQuery.isPlaceholderData,
    saveReminder,
    toggleDone,
    removeReminder,
    saveAdvance,
  };
}
