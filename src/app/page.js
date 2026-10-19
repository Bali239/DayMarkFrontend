"use client";

import Script from "next/script";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const minutesOptions = [0, 5, 15, 30, 60, 1440];
const optionLabel = (minutes) => minutes === 0 ? "At due time" : minutes === 1440 ? "1 day" : minutes === 60 ? "1 hour" : `${minutes} minutes`;
const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const dueIso = (date, time) => {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute).toISOString();
};
const dateLabel = (item) => {
  const parsed = new Date(item.dueAt);
  const today = new Date();
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const day = parsed.toDateString() === today.toDateString() ? "Today" : parsed.toDateString() === tomorrow.toDateString() ? "Tomorrow" : parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${day} · ${parsed.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
};
const fromApi = (item) => {
  const date = new Date(item.dueAt);
  return { ...item, date: localDate(date), time: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}` };
};
const initialForm = () => ({ title: "", description: "", date: localDate(), time: `${String(new Date().getHours()).padStart(2, "0")}:00`, category: "Personal" });

async function request(path, token, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.message || `Request failed (${response.status})`);
  return result?.data;
}

export default function Home() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [stats, setStats] = useState({ upcoming: 0, completed: 0, overdue: 0, today: 0 });
  const [advance, setAdvance] = useState(15);
  const [googleClientId, setGoogleClientId] = useState(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "");
  const [googleReady, setGoogleReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("Upcoming");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const googleButton = useRef(null);

  useEffect(() => {
    request("/auth/config", "").then((config) => setGoogleClientId(config.googleClientId)).catch((cause) => setError(cause.message));
  }, []);

  const loadDashboard = useCallback(async (activeToken) => {
    const data = await request("/reminders", activeToken);
    const normalized = data.reminders.map(fromApi);
    const now = new Date();
    setReminders(normalized);
    setStats({
      upcoming: normalized.filter((item) => !item.completed && new Date(item.dueAt) >= now).length,
      completed: normalized.filter((item) => item.completed).length,
      overdue: normalized.filter((item) => !item.completed && new Date(item.dueAt) < now).length,
      today: normalized.filter((item) => !item.completed && new Date(item.dueAt).toDateString() === now.toDateString()).length,
    });
    setAdvance(data.reminderAdvanceMinutes);
  }, []);

  const handleGoogleCredential = useCallback(async (response) => {
    if (!response?.credential) return;
    setLoading(true); setError("");
    try {
      const session = await request("/auth/google", "", { method: "POST", body: JSON.stringify({ credential: response.credential }) });
      setToken(session.token);
      setUser(session.user);
      await loadDashboard(session.token);
    } catch (cause) { setToken(""); setUser(null); setError(cause.message || "Google sign-in failed."); }
    finally { setLoading(false); }
  }, [loadDashboard]);

  useEffect(() => {
    if (!googleReady || !googleButton.current || !googleClientId || !window.google?.accounts?.id) return;
    window.google.accounts.id.initialize({ client_id: googleClientId, callback: handleGoogleCredential, auto_select: false, cancel_on_tap_outside: true });
    googleButton.current.innerHTML = "";
    window.google.accounts.id.renderButton(googleButton.current, { type: "standard", theme: "outline", size: "large", shape: "rectangular", text: "continue_with", width: 260, logo_alignment: "left" });
  }, [googleReady, googleClientId, handleGoogleCredential]);

  useEffect(() => {
    if (!token) return undefined;
    const timer = window.setInterval(() => {
      loadDashboard(token).catch((cause) => {
        if (/session|authentication/i.test(cause.message)) { setToken(""); setUser(null); setReminders([]); setError("Your session expired. Sign in again."); }
      });
    }, 60000);
    return () => window.clearInterval(timer);
  }, [token, loadDashboard]);

  const shown = useMemo(() => reminders.filter((item) => {
    const matchesQuery = `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "Upcoming" ? !item.completed && new Date(item.dueAt) >= new Date()
      : filter === "Completed" ? item.completed
      : filter === "Overdue" ? !item.completed && new Date(item.dueAt) < new Date()
      : true;
    return matchesQuery && matchesFilter;
  }).sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt)), [reminders, filter, query]);

  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };
  const handleFailure = (cause) => {
    if (/session|authentication/i.test(cause.message)) { setToken(""); setUser(null); setReminders([]); }
    setError(cause.message);
  };

  function openNew() { setEditing(null); setForm(initialForm()); setModal(true); }
  function openEdit(item) { setEditing(item.id); setForm({ title: item.title, description: item.description || "", date: item.date, time: item.time, category: item.category }); setModal(true); }
  async function saveReminder(event) {
    event.preventDefault(); if (!form.title.trim() || !token) return;
    setBusy(true); setError("");
    try {
      const body = { title: form.title.trim(), description: form.description.trim(), dueAt: dueIso(form.date, form.time), category: form.category };
      if (editing) await request(`/reminders/${editing}`, token, { method: "PATCH", body: JSON.stringify(body) });
      else await request("/reminders", token, { method: "POST", body: JSON.stringify(body) });
      await loadDashboard(token); setModal(false); notify(editing ? "Reminder updated" : "Reminder created");
    } catch (cause) { handleFailure(cause); }
    finally { setBusy(false); }
  }
  async function toggleDone(item) {
    try { await request(`/reminders/${item.id}/complete`, token, { method: "PATCH" }); await loadDashboard(token); }
    catch (cause) { handleFailure(cause); }
  }
  async function removeReminder(item) {
    if (!window.confirm(`Delete “${item.title}”?`)) return;
    try { await request(`/reminders/${item.id}`, token, { method: "DELETE" }); await loadDashboard(token); notify("Reminder deleted"); }
    catch (cause) { handleFailure(cause); }
  }
  async function saveAdvance(value) {
    const minutes = Number(value); setAdvance(minutes);
    try { await request("/reminders/preferences/advance", token, { method: "PATCH", body: JSON.stringify({ minutes }) }); setUser((current) => current ? { ...current, reminderAdvanceMinutes: minutes } : current); notify("Notification preference saved"); }
    catch (cause) { handleFailure(cause); }
  }
  async function logout() {
    try { await request("/auth/logout", token, { method: "POST" }); }
    catch { /* clear the in-memory session even when the network is unavailable */ }
    setToken(""); setUser(null); setReminders([]); setStats({ upcoming: 0, completed: 0, overdue: 0, today: 0 }); setError("");
  }

  if (!token || !user) return <main className="login-screen">
    <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={() => setGoogleReady(true)} />
    <div className="login-card"><a className="brand login-brand" href="#"><span className="brand-mark"><span /></span><span>daymark<span className="brand-period">.</span></span></a><div className="login-art">✳</div><div className="section-kicker">A LITTLE MORE HEADSPACE</div><h1>Make room for<br /><em>what matters.</em></h1><p>Keep your plans close, your mind clear, and let Daymark remind you when the time comes.</p>{googleClientId ? <div className="google-signin"><div ref={googleButton} /><span>{loading ? "Signing you in…" : "Sign in with your Google account"}</span></div> : <div className="config-error">Connecting to secure Google sign-in…</div>}{error && <div className="login-error" role="alert">{error}</div>}<div className="login-foot"><span>Secure sign-in with Google</span><span>No password to remember</span></div></div><div className="login-caption">A calmer kind of productive.</div>
  </main>;

  const initials = (user.name || user.email).split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return <main className="app-shell">
    <aside className="sidebar"><a className="brand" href="#top" aria-label="Daymark home"><span className="brand-mark"><span /></span><span>daymark<span className="brand-period">.</span></span></a><div className="workspace-label">WORKSPACE</div><nav className="side-nav" aria-label="Main navigation"><button className={`nav-item ${filter === "Upcoming" ? "active" : ""}`} onClick={() => setFilter("Upcoming")}><span className="nav-icon">▦</span> Overview <span className="nav-count">{stats.upcoming}</span></button><button className={`nav-item ${filter === "Upcoming" ? "selected" : ""}`} onClick={() => setFilter("Upcoming")}><span className="nav-icon">◷</span> Upcoming</button><button className={`nav-item ${filter === "Completed" ? "selected" : ""}`} onClick={() => setFilter("Completed")}><span className="nav-icon">✓</span> Completed</button><button className={`nav-item ${filter === "Overdue" ? "selected" : ""}`} onClick={() => setFilter("Overdue")}><span className="nav-icon">◴</span> Overdue <span className="nav-count muted-count">{stats.overdue}</span></button></nav><div className="side-divider" /><div className="workspace-label">YOUR SPACE</div><button className="nav-item" onClick={() => setFilter("All reminders")}><span className="nav-icon">✳</span> All reminders</button><div className="sidebar-bottom"><div className="upgrade-card"><div className="upgrade-spark">✳</div><div className="upgrade-title">A little more focus</div><p>Make room for what matters, one reminder at a time.</p><button onClick={openNew}>Create a reminder <span>↗</span></button></div><div className="profile"><span className="avatar">{user.picture ? <img src={user.picture} alt="" referrerPolicy="no-referrer" /> : initials}</span><span className="profile-text"><b>{user.name}</b><small>{user.email}</small></span><button className="logout-button" onClick={logout}>Log out</button></div></div></aside>
    <section className="main-area" id="top"><header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>{filter}</b></div><div className="top-actions"><div className="today-chip"><span className="today-dot" /> Your day, at a glance</div><span className="verified-user">{user.emailVerified ? "Verified Google account" : user.email}</span><button className="avatar top-avatar" title={user.name}>{user.picture ? <img src={user.picture} alt={user.name} referrerPolicy="no-referrer" /> : initials}</button></div></header>
      <div className="content-wrap"><div className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line" /> {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).toUpperCase()}</div><h1>A calmer kind of <em>productive.</em></h1><p className="welcome-subtitle">Welcome back, {user.name.split(" ")[0]}. Here’s what’s on your mind.</p></div><button className="primary-button" onClick={openNew}><span>＋</span> New reminder</button></div>
        {error && <div className="inline-error" role="alert">{error}<button onClick={() => setError("")}>×</button></div>}
        <section className="stats-grid" aria-label="Reminder statistics"><article className="stat-card"><div className="stat-top"><span>Upcoming</span><span className="stat-symbol lavender">◷</span></div><div className="stat-value">{stats.upcoming}<span className="stat-unit"> reminders</span></div><div className="stat-foot"><span className="stat-bullet violet" /> {stats.today} scheduled for today</div></article><article className="stat-card"><div className="stat-top"><span>Completed</span><span className="stat-symbol mint">✓</span></div><div className="stat-value">{stats.completed}<span className="stat-unit"> total</span></div><div className="stat-foot"><span className="stat-bullet green" /> Tasks you’ve finished</div></article><article className="stat-card"><div className="stat-top"><span>Overdue</span><span className="stat-symbol peach">◴</span></div><div className="stat-value">{stats.overdue}<span className="stat-unit"> to revisit</span></div><div className="stat-foot"><span className="stat-bullet orange" /> Ready when you are</div></article><article className="progress-card"><div className="progress-copy"><span>COMPLETION RATE</span><b>{stats.completed + stats.upcoming + stats.overdue ? Math.round(stats.completed / (stats.completed + stats.upcoming + stats.overdue) * 100) : 0}<small>%</small></b><p>Your reminders, at a glance.</p></div><div className="ring" style={{ "--progress": `${stats.completed + stats.upcoming + stats.overdue ? Math.round(stats.completed / (stats.completed + stats.upcoming + stats.overdue) * 100) : 0}%` }}><span>✳</span></div></article></section>
        <section className="reminders-panel"><div className="panel-heading"><div><div className="section-kicker">YOUR LIST</div><h2>{filter === "Upcoming" ? "Coming up" : filter}</h2><p>{filter === "Upcoming" ? "The things you want to make time for." : "A clear view of what’s on your plate."}</p></div><button className="text-button" onClick={() => setFilter("All reminders")}>View all <span>→</span></button></div><div className="list-toolbar"><div className="filter-tabs">{["Upcoming", "All reminders", "Completed", "Overdue"].map((name) => <button key={name} className={filter === name ? "tab active-tab" : "tab"} onClick={() => setFilter(name)}>{name}</button>)}</div><label className="search-box"><span>⌕</span><input aria-label="Search reminders" placeholder="Search reminders" value={query} onChange={(event) => setQuery(event.target.value)} /></label></div>
          {shown.length ? <div className="reminder-list">{shown.map((item) => <article className={`reminder-row ${item.completed ? "is-complete" : ""}`} key={item.id}><button className={`check-button ${item.completed ? "checked" : ""}`} onClick={() => toggleDone(item)} aria-label={item.completed ? "Mark as incomplete" : "Mark as complete"}>{item.completed ? "✓" : ""}</button><div className="reminder-info"><div className="reminder-title-line"><h3>{item.title}</h3><span className={`category-tag ${item.category.toLowerCase()}`}>{item.category}</span></div><p>{item.description || "No description added."}</p></div><div className="reminder-when"><span className="calendar-icon">▦</span><span>{dateLabel(item)}<small className="email-state">{item.emailSentAt ? "Email sent" : item.completed ? "Completed" : "Email pending"}</small></span></div><div className="row-actions"><button onClick={() => openEdit(item)} aria-label="Edit reminder">✎</button><button onClick={() => removeReminder(item)} aria-label="Delete reminder">×</button></div></article>)}</div> : <div className="empty-state"><span>✳</span><b>{query ? "No matching reminders" : "Nothing on this list"}</b><p>{query ? "Try another search." : "Enjoy the breathing room, or add a reminder when something comes to mind."}</p>{!query && <button className="secondary-button" onClick={openNew}>＋ Add a reminder</button>}</div>}
          <div className="list-footer"><span>Showing <b>{shown.length}</b> of <b>{reminders.length}</b> reminders</span><span className="sync-note"><i /> Synced with your account</span></div></section>
        <section className="bottom-grid"><div className="focus-card"><div className="focus-orb">✳</div><div><span className="section-kicker">A SMALL REMINDER</span><h3>You don’t have to do it all<br />at once.</h3><p>One thoughtful step is still progress.</p></div><span className="focus-art">✳</span></div><div className="settings-card"><div className="settings-icon">♧</div><div className="settings-copy"><span className="section-kicker">EMAIL NOTIFICATION</span><h3>A gentle heads-up</h3><p>Email {optionLabel(advance).toLowerCase()} before a task is due.</p></div><select aria-label="Reminder notification advance time" value={advance} onChange={(event) => saveAdvance(event.target.value)}>{minutesOptions.map((minutes) => <option key={minutes} value={minutes}>{optionLabel(minutes)}</option>)}</select></div></section><footer className="page-footer"><span>Signed in as {user.email}</span><span>Take it one thing at a time.</span></footer></div>
    </section>
    {modal && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(false); }}><form className="reminder-modal" onSubmit={saveReminder}><div className="modal-top"><div><span className="section-kicker">MAKE SOME SPACE</span><h2>{editing ? "Edit reminder" : "A new reminder"}</h2><p>Get it out of your head and onto your list.</p></div><button type="button" className="modal-close" onClick={() => setModal(false)} aria-label="Close">×</button></div><label className="field-label">Title<input autoFocus required maxLength={100} placeholder="What do you need to remember?" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label><label className="field-label">A few details <span>Optional</span><textarea rows="3" placeholder="Add a note to future you..." value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><div className="field-pair"><label className="field-label">Date<input type="date" required value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label><label className="field-label">Time<input type="time" required value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} /></label></div><label className="field-label">Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option>Personal</option><option>Work</option><option>Health</option><option>Other</option></select></label>{error && <div className="inline-error">{error}</div>}<div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setModal(false)}>Cancel</button><button className="primary-button" type="submit" disabled={busy}>{busy ? "Saving…" : editing ? "Save changes" : "Create reminder"}<span>→</span></button></div></form></div>}
    {toast && <div className="toast"><span>✓</span>{toast}</div>}
  </main>;
}
