"use client";

import { useEffect, useMemo, useState } from "react";

const starterReminders = [
  { id: 1, title: "Review product roadmap", description: "Share notes with the team before the planning session.", date: "2026-10-19", time: "10:30", category: "Work", completed: false },
  { id: 2, title: "Pick up groceries", description: "Oat milk, fresh fruit, and coffee beans.", date: "2026-10-19", time: "16:00", category: "Personal", completed: false },
  { id: 3, title: "Send invoice to Olivia", description: "Include the design sprint hours from last week.", date: "2026-10-20", time: "09:00", category: "Work", completed: false },
  { id: 4, title: "Book dentist appointment", description: "Ask for an afternoon slot next week.", date: "2026-10-21", time: "11:00", category: "Personal", completed: false },
  { id: 5, title: "Submit expense report", description: "Attach receipts from the client visit.", date: "2026-10-17", time: "14:00", category: "Work", completed: false },
  { id: 6, title: "Water the plants", description: "The living room plants need a little extra care.", date: "2026-10-18", time: "08:00", category: "Personal", completed: true },
];

const dateLabel = (date, time) => {
  const parsed = new Date(`${date}T${time || "00:00"}`);
  const today = new Date();
  const sameDay = parsed.toDateString() === today.toDateString();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const isTomorrow = parsed.toDateString() === tomorrow.toDateString();
  const day = sameDay ? "Today" : isTomorrow ? "Tomorrow" : parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${day} · ${parsed.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
};

const initialForm = { title: "", description: "", date: "2026-10-19", time: "12:00", category: "Personal" };

export default function Home() {
  const [reminders, setReminders] = useState(() => {
    if (typeof window === "undefined") return starterReminders;
    try {
      const stored = window.localStorage.getItem("daymark-reminders");
      return stored ? JSON.parse(stored) : starterReminders;
    } catch { return starterReminders; }
  });
  const [filter, setFilter] = useState("Upcoming");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [toast, setToast] = useState("");
  const [advance, setAdvance] = useState(() => {
    if (typeof window === "undefined") return "15 minutes";
    try { return window.localStorage.getItem("daymark-advance") || "15 minutes"; } catch { return "15 minutes"; }
  });

  useEffect(() => {
    try { localStorage.setItem("daymark-reminders", JSON.stringify(reminders)); } catch { /* storage is optional */ }
  }, [reminders]);

  const counts = useMemo(() => {
    const open = reminders.filter((item) => !item.completed);
    const todayKey = new Date().toISOString().slice(0, 10);
    return {
      upcoming: open.filter((item) => item.date >= todayKey).length,
      completed: reminders.filter((item) => item.completed).length,
      overdue: open.filter((item) => item.date < todayKey).length,
      today: open.filter((item) => item.date === todayKey).length,
    };
  }, [reminders]);

  const shown = useMemo(() => reminders.filter((item) => {
    const matchesQuery = `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(query.toLowerCase());
    const todayKey = new Date().toISOString().slice(0, 10);
    const matchesFilter = filter === "Upcoming" ? !item.completed && item.date >= todayKey
      : filter === "Completed" ? item.completed
      : filter === "Overdue" ? !item.completed && item.date < todayKey
      : true;
    return matchesQuery && matchesFilter;
  }).sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)), [reminders, filter, query]);

  function openNew() {
    setEditing(null);
    setForm({ ...initialForm, date: new Date().toISOString().slice(0, 10) });
    setModal(true);
  }

  function openEdit(item) {
    setEditing(item.id);
    setForm({ title: item.title, description: item.description, date: item.date, time: item.time, category: item.category });
    setModal(true);
  }

  function saveReminder(event) {
    event.preventDefault();
    if (!form.title.trim()) return;
    if (editing) setReminders((items) => items.map((item) => item.id === editing ? { ...item, ...form, title: form.title.trim() } : item));
    else setReminders((items) => [...items, { ...form, title: form.title.trim(), id: Date.now(), completed: false }]);
    setModal(false);
    setToast(editing ? "Reminder updated" : "Reminder added to your list");
    window.setTimeout(() => setToast(""), 2600);
  }

  function toggleDone(id) {
    setReminders((items) => items.map((item) => item.id === id ? { ...item, completed: !item.completed } : item));
  }

  function removeReminder(id) {
    setReminders((items) => items.filter((item) => item.id !== id));
    setToast("Reminder deleted");
    window.setTimeout(() => setToast(""), 2600);
  }

  function saveAdvance(value) {
    setAdvance(value);
    try { localStorage.setItem("daymark-advance", value); } catch { /* storage is optional */ }
    setToast(`Reminder preference saved: ${value} before`);
    window.setTimeout(() => setToast(""), 2600);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="Daymark home"><span className="brand-mark"><span /></span><span>daymark<span className="brand-period">.</span></span></a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <button className="nav-item active" onClick={() => setFilter("Upcoming")}><span className="nav-icon">▦</span> Overview <span className="nav-count">{counts.upcoming}</span></button>
          <button className={`nav-item ${filter === "Upcoming" ? "selected" : ""}`} onClick={() => setFilter("Upcoming")}><span className="nav-icon">◷</span> Upcoming</button>
          <button className={`nav-item ${filter === "Completed" ? "selected" : ""}`} onClick={() => setFilter("Completed")}><span className="nav-icon">✓</span> Completed</button>
          <button className={`nav-item ${filter === "Overdue" ? "selected" : ""}`} onClick={() => setFilter("Overdue")}><span className="nav-icon">◴</span> Overdue <span className="nav-count muted-count">{counts.overdue}</span></button>
        </nav>
        <div className="side-divider" />
        <div className="workspace-label">YOUR SPACE</div>
        <button className="nav-item" onClick={() => setFilter("All reminders")}><span className="nav-icon">✳</span> All reminders</button>
        <div className="sidebar-bottom">
          <div className="upgrade-card"><div className="upgrade-spark">✳</div><div className="upgrade-title">A little more focus</div><p>Make room for what matters, one reminder at a time.</p><button onClick={openNew}>Create a reminder <span>↗</span></button></div>
          <button className="profile"><span className="avatar">JD</span><span className="profile-text"><b>Jordan Davis</b><small>Personal workspace</small></span><span className="profile-menu">···</span></button>
        </div>
      </aside>

      <section className="main-area" id="top">
        <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>{filter === "All reminders" ? "All reminders" : filter}</b></div><div className="top-actions"><div className="today-chip"><span className="today-dot" /> Your day, at a glance</div><button className="icon-button notification" aria-label="Notifications">♧<i /></button><button className="avatar top-avatar" aria-label="Account">JD</button></div></header>
        <div className="content-wrap">
          <div className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line" /> MONDAY, OCTOBER 19, 2026</div><h1>A calmer kind of <em>productive.</em></h1><p className="welcome-subtitle">A little structure goes a long way. Here’s what’s on your mind.</p></div><button className="primary-button" onClick={openNew}><span>＋</span> New reminder</button></div>

          <section className="stats-grid" aria-label="Reminder statistics">
            <article className="stat-card"><div className="stat-top"><span>Upcoming</span><span className="stat-symbol lavender">◷</span></div><div className="stat-value">{counts.upcoming}<span className="stat-unit"> reminders</span></div><div className="stat-foot"><span className="stat-bullet violet" /> {counts.today} scheduled for today</div></article>
            <article className="stat-card"><div className="stat-top"><span>Completed</span><span className="stat-symbol mint">✓</span></div><div className="stat-value">{counts.completed}<span className="stat-unit"> this week</span></div><div className="stat-foot"><span className="stat-bullet green" /> You’re building good momentum</div></article>
            <article className="stat-card"><div className="stat-top"><span>Overdue</span><span className="stat-symbol peach">◴</span></div><div className="stat-value">{counts.overdue}<span className="stat-unit"> to revisit</span></div><div className="stat-foot"><span className="stat-bullet orange" /> It’s okay to reschedule</div></article>
            <article className="progress-card"><div className="progress-copy"><span>WEEKLY PROGRESS</span><b>{Math.min(counts.completed * 12, 100)}<small>%</small></b><p>Small steps add up.</p></div><div className="ring" style={{ "--progress": `${Math.min(counts.completed * 12, 100)}%` }}><span>✳</span></div></article>
          </section>

          <section className="reminders-panel">
            <div className="panel-heading"><div><div className="section-kicker">YOUR LIST</div><h2>{filter === "All reminders" ? "All reminders" : filter === "Upcoming" ? "Coming up" : filter}</h2><p>{filter === "Upcoming" ? "The things you want to make time for." : "A clear view of what’s on your plate."}</p></div><button className="text-button" onClick={() => setFilter("All reminders")}>View all <span>→</span></button></div>
            <div className="list-toolbar"><div className="filter-tabs">{["Upcoming", "All reminders", "Completed", "Overdue"].map((name) => <button key={name} className={filter === name ? "tab active-tab" : "tab"} onClick={() => setFilter(name)}>{name}</button>)}</div><label className="search-box"><span>⌕</span><input aria-label="Search reminders" placeholder="Search reminders" value={query} onChange={(e) => setQuery(e.target.value)} /><kbd>⌘ K</kbd></label></div>
            {shown.length ? <div className="reminder-list">{shown.map((item) => <article className={`reminder-row ${item.completed ? "is-complete" : ""}`} key={item.id}>
              <button className={`check-button ${item.completed ? "checked" : ""}`} onClick={() => toggleDone(item.id)} aria-label={item.completed ? "Mark as incomplete" : "Mark as complete"}>{item.completed ? "✓" : ""}</button>
              <div className="reminder-info"><div className="reminder-title-line"><h3>{item.title}</h3><span className={`category-tag ${item.category.toLowerCase()}`}>{item.category}</span></div><p>{item.description || "No description added."}</p></div>
              <div className="reminder-when"><span className="calendar-icon">▦</span><span>{dateLabel(item.date, item.time)}</span></div>
              <div className="row-actions"><button onClick={() => openEdit(item)} aria-label="Edit reminder">✎</button><button onClick={() => removeReminder(item.id)} aria-label="Delete reminder">×</button></div>
            </article>)}</div> : <div className="empty-state"><span>✳</span><b>Nothing on this list</b><p>Enjoy the breathing room, or add a reminder when something comes to mind.</p><button className="secondary-button" onClick={openNew}>＋ Add a reminder</button></div>}
            <div className="list-footer"><span>Showing <b>{shown.length}</b> of <b>{reminders.length}</b> reminders</span><span className="sync-note"><i /> Everything is up to date</span></div>
          </section>

          <section className="bottom-grid"><div className="focus-card"><div className="focus-orb">✳</div><div><span className="section-kicker">A SMALL REMINDER</span><h3>You don’t have to do it all<br />at once.</h3><p>One thoughtful step is still progress.</p></div><span className="focus-art">✳</span></div><div className="settings-card"><div className="settings-icon">♧</div><div className="settings-copy"><span className="section-kicker">NOTIFICATION PREFERENCE</span><h3>A gentle heads-up</h3><p>Get reminded before a task is due.</p></div><select aria-label="Reminder notification advance time" value={advance} onChange={(e) => saveAdvance(e.target.value)}><option>At due time</option><option>5 minutes</option><option>15 minutes</option><option>30 minutes</option><option>1 hour</option><option>1 day</option></select></div></section>
          <footer className="page-footer"><span>Made for a little more headspace <span className="footer-heart">♥</span></span><span>Take it one thing at a time.</span></footer>
        </div>
      </section>

      {modal && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setModal(false); }}><form className="reminder-modal" onSubmit={saveReminder}><div className="modal-top"><div><span className="section-kicker">MAKE SOME SPACE</span><h2>{editing ? "Edit reminder" : "A new reminder"}</h2><p>Get it out of your head and onto your list.</p></div><button type="button" className="modal-close" onClick={() => setModal(false)} aria-label="Close">×</button></div><label className="field-label">Title<input autoFocus required maxLength={100} placeholder="What do you need to remember?" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label><label className="field-label">A few details <span>Optional</span><textarea rows="3" placeholder="Add a note to future you..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label><div className="field-pair"><label className="field-label">Date<input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label><label className="field-label">Time<input type="time" required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></label></div><label className="field-label">Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Personal</option><option>Work</option><option>Health</option><option>Other</option></select></label><div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setModal(false)}>Cancel</button><button className="primary-button" type="submit">{editing ? "Save changes" : "Create reminder"}<span>→</span></button></div></form></div>}
      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </main>
  );
}
