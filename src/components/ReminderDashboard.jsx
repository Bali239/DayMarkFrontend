"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardFooter from "@/components/DashboardFooter";
import { DashboardHeading, ReminderStats } from "@/components/DashboardOverview";
import ReminderList from "@/components/ReminderList";
import ReminderModal from "@/components/ReminderModal";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import useAuth from "@/hooks/useAuth";
import useReminders from "@/hooks/useReminders";
import { initialForm } from "@/lib/reminders";
import { Alert, Spin } from "antd";
import DeleteReminderConfirmation from "@/components/DeleteReminderConfirmation";

export default function Home() {
  const router = useRouter();
  const auth = useAuth();
  const dashboard = useReminders(auth.token, { clearSession: auth.clearSession, setUser: auth.setUser });

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState(initialForm);

  function openNew() {
    setEditing(null);
    setForm(initialForm());
    setModal(true);
  }

  function openEdit(item) {
    setEditing(item.id);
    setForm({ title: item.title, description: item.description || "", date: item.date, time: item.time, category: item.category });
    setModal(true);
  }

  const initials = (auth.user.name || auth.user.email).split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  if (dashboard.loading && !dashboard.reminders.length) return <main className="grid min-h-screen place-items-center bg-[#fbfaf8]"><Spin size="large" description="Loading your reminders…" /></main>;

  return <main className="min-h-screen bg-[#fbfaf8] md:flex">
    <Sidebar filter={dashboard.filter} setFilter={dashboard.setFilter} stats={dashboard.stats} onNew={openNew} />
    <section className="min-w-0 flex-1 pb-16 md:pb-0" id="top">
      <TopBar filter={dashboard.filter} user={auth.user} initials={initials} onLogout={async () => { await auth.logout(); router.replace("/"); }} />
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-7 sm:py-8 lg:px-10">
        <DashboardHeading user={auth.user} onNew={openNew} />
        {dashboard.error && <Alert className="!mb-5 !rounded-xl" type="error" showIcon closable onClose={() => dashboard.setError("")} message={dashboard.error} />}
        {dashboard.filter === "Overview" && <ReminderStats stats={dashboard.stats} />}
        {dashboard.filter !== "Overview" && <ReminderList key={dashboard.filter} reminders={dashboard.reminders} shown={dashboard.shown} total={dashboard.total} pagination={dashboard.pagination} filter={dashboard.filter} setFilter={dashboard.setFilter} query={dashboard.query} setQuery={dashboard.setQuery} setPage={dashboard.setPage} setPageSize={dashboard.setPageSize} onToggle={dashboard.toggleDone} onEdit={openEdit} onDelete={setDeleting} onNew={openNew} />}
        {dashboard.filter === "Overview" && <DashboardFooter user={auth.user} advance={dashboard.advance} onAdvance={dashboard.saveAdvance} />}
      </div>
    </section>
    {modal && <ReminderModal editing={editing} form={form} setForm={setForm} error={dashboard.error} busy={dashboard.busy} onClose={() => setModal(false)} onSubmit={(event) => dashboard.saveReminder(event, form, editing, () => setModal(false))} />}
    {deleting && <DeleteReminderConfirmation reminder={deleting} onCancel={() => setDeleting(null)} onConfirm={dashboard.removeReminder} />}
  </main>;
}
