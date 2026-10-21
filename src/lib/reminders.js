export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export const SESSION_STORAGE_KEY = "daymark_session_token";

export const notificationOptions = [0, 5, 15, 30, 60, 1440];

export const optionLabel = (minutes) =>
  minutes === 0
    ? "At due time"
    : minutes === 1440
      ? "1 day"
      : minutes === 60
        ? "1 hour"
        : `${minutes} minutes`;

export const localDate = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const dueIso = (date, time) => {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute).toISOString();
};

export const isValidDateValue = (date) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) return false;
  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
};

export const isValidTimeValue = (time) => {
  if (!/^\d{2}:\d{2}$/.test(time || "")) return false;
  const [hour, minute] = time.split(":").map(Number);
  return hour <= 23 && minute <= 59;
};

export const isPastDue = (date, time, now = new Date()) => {
  if (!isValidDateValue(date) || !isValidTimeValue(time)) return true;
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute) < now;
};

export const minimumDateTime = (date = new Date()) =>
  `${localDate(date)}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

export const dateLabel = (item) => {
  const parsed = new Date(item.dueAt);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const day =
    parsed.toDateString() === today.toDateString()
      ? "Today"
      : parsed.toDateString() === tomorrow.toDateString()
        ? "Tomorrow"
        : parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${day} · ${parsed.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
};

export const timeLeftLabel = (dueAt, now = Date.now()) => {
  const dueTime = new Date(dueAt).getTime();
  if (Number.isNaN(dueTime)) return "Time unavailable";

  const difference = dueTime - now;
  if (Math.abs(difference) < 60_000) return "Due now";

  let minutes = Math.ceil(Math.abs(difference) / 60_000);
  const days = Math.floor(minutes / 1440);
  minutes %= 1440;
  const hours = Math.floor(minutes / 60);
  minutes %= 60;
  const parts = [];
  if (days) parts.push(`${days} ${days === 1 ? "day" : "days"}`);
  if (hours) parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
  if (minutes && parts.length < 2)
    parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);

  const amount = parts.join(" ");
  return difference > 0 ? `In ${amount}` : `Overdue by ${amount}`;
};

export const fromApi = (item) => {
  const date = new Date(item.dueAt);
  return {
    ...item,
    completed: item.completed === true,
    date: localDate(date),
    time: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
  };
};

export const initialForm = () => {
  const nextHour = new Date();
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);

  return {
    title: "",
    description: "",
    date: localDate(nextHour),
    time: `${String(nextHour.getHours()).padStart(2, "0")}:00`,
    category: "Personal",
  };
};

export async function request(path, token, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.message || `Request failed (${response.status})`);
  return result?.data;
}

export const reminderStats = (items) => {
  const now = new Date();
  return {
    upcoming: items.filter((item) => !item.completed && new Date(item.dueAt) >= now).length,
    completed: items.filter((item) => item.completed).length,
    overdue: items.filter((item) => !item.completed && new Date(item.dueAt) < now).length,
    today: items.filter(
      (item) => !item.completed && new Date(item.dueAt).toDateString() === now.toDateString(),
    ).length,
  };
};
