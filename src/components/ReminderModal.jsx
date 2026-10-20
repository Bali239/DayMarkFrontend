"use client";

import { Button, Input, Modal, Select, Typography } from "antd";
import { ArrowRightOutlined, CloseOutlined } from "@ant-design/icons";
import { isPastDue, minimumDateTime } from "@/lib/reminders";

const { Text, Title } = Typography;
const categories = ["Personal", "Work", "Health", "Other"].map((value) => ({ value, label: value }));

export default function ReminderModal({ editing, form, setForm, error, busy, onClose, onSubmit }) {
  const minDateTime = minimumDateTime();
  const timeIsPast = form.date === minDateTime.slice(0, 10);
  const invalidDueDate = isPastDue(form.date, form.time);

  return <Modal open centered footer={null} closable={false} mask={{ closable: !busy }} keyboard={!busy} onCancel={onClose} width={520} styles={{ content: { borderRadius: 24, padding: 0, overflow: "hidden" }, body: { padding: 24 } }}>
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="flex items-start justify-between gap-4"><div><Text className="!text-xs !font-semibold !tracking-[0.15em] !text-violet-700">MAKE SOME SPACE</Text><Title level={3} className="!mb-1 !mt-2">{editing ? "Edit reminder" : "A new reminder"}</Title><Text type="secondary">Get it out of your head and onto your list.</Text></div><Button type="text" shape="circle" onClick={onClose} disabled={busy} aria-label="Close" icon={<CloseOutlined />} /></div>
      <label className="block space-y-2 text-sm font-medium text-slate-700">Title<Input autoFocus required maxLength={100} placeholder="What do you need to remember?" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
      <label className="block space-y-2 text-sm font-medium text-slate-700">A few details <Text type="secondary" className="!text-xs">Optional</Text><Input.TextArea rows={3} placeholder="Add a note to future you..." value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><label className="block space-y-2 text-sm font-medium text-slate-700">Date<Input type="date" required min={minDateTime.slice(0, 10)} value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label><label className="block space-y-2 text-sm font-medium text-slate-700">Time<Input type="time" required min={timeIsPast ? minDateTime.slice(11, 16) : undefined} value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} /></label></div>
      {invalidDueDate && <div role="alert" className="-mt-3 text-sm text-rose-600">Choose a date and time in the future.</div>}
      <label className="block space-y-2 text-sm font-medium text-slate-700">Category<Select aria-label="Category" value={form.category} options={categories} onChange={(category) => setForm({ ...form, category })} className="w-full" /></label>
      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
      <div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-100 pt-4 sm:flex-row"><Button onClick={onClose} disabled={busy}>Cancel</Button><Button type="primary" htmlType="submit" loading={busy} disabled={invalidDueDate} icon={<ArrowRightOutlined />} iconPlacement="end">{busy ? "Saving…" : editing ? "Save changes" : "Create reminder"}</Button></div>
    </form>
  </Modal>;
}
