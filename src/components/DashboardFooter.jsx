import { Card, Select, Typography } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { notificationOptions, optionLabel } from "@/lib/reminders";

const { Text, Title } = Typography;

export default function DashboardFooter({ user, advance, onAdvance }) {
  return <>
    <section className="grid gap-4 lg:grid-cols-2">
      <Card className="!rounded-2xl !border-0 !bg-violet-700 !text-white" styles={{ body: { padding: 24 } }}><div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/15 text-xl">✳</span><div><Text className="!text-xs !font-semibold !tracking-[0.15em] !text-violet-200">A SMALL REMINDER</Text><Title level={4} className="!mb-1 !mt-2 !text-white">You don’t have to do it all at once.</Title><Text className="!text-violet-100">One thoughtful step is still progress.</Text></div></div></Card>
      <Card className="!rounded-2xl !border-slate-200/80" styles={{ body: { padding: 24 } }}><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-700"><BellOutlined /></span><div className="min-w-0 flex-1"><Text className="!text-xs !font-semibold !tracking-[0.15em] !text-violet-700">EMAIL NOTIFICATION</Text><Title level={5} className="!mb-1 !mt-1">A gentle heads-up</Title><Text type="secondary">Email {optionLabel(advance).toLowerCase()} before a task is due.</Text></div><Select aria-label="Reminder notification advance time" value={advance} onChange={onAdvance} options={notificationOptions.map((minutes) => ({ value: minutes, label: optionLabel(minutes) }))} className="w-full sm:!w-36" /></div></Card>
    </section>
    <footer className="flex flex-col gap-1 pb-20 pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between md:pb-2"><span>Signed in as {user.email}</span><span>Take it one thing at a time.</span></footer>
  </>;
}
