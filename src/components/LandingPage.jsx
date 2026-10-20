"use client";

import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Button, Card, Tag, Typography } from "antd";
import { ArrowRightOutlined, CheckCircleFilled, ClockCircleOutlined, HeartOutlined, MailOutlined } from "@ant-design/icons";
import Brand from "@/components/Brand";

const { Title, Paragraph, Text } = Typography;
const highlights = [
  { number: "01", title: "A clear head", text: "Keep the little things somewhere safe, so you can focus on what’s in front of you.", icon: <CheckCircleFilled /> },
  { number: "02", title: "A gentle nudge", text: "Choose when you want an email reminder and let Daymark take care of the timing.", icon: <MailOutlined /> },
  { number: "03", title: "A calmer pace", text: "See what’s coming, what’s done, and what can wait in one thoughtful space.", icon: <HeartOutlined /> },
];

export default function LandingPage() {
  const router = useRouter();
  const { token, user } = useSelector((state) => state.auth);
  const openApp = () => router.push(token && user ? "/reminder" : "/signin");

  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfaf8] text-slate-900">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Brand />
        <Button type="default" size="large" onClick={openApp} className="!rounded-full !px-6 !font-medium">{token && user ? "Open Daymark" : "Sign in"}</Button>
      </header>

      <section className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-5 pb-20 pt-12 sm:px-8 md:pb-28 md:pt-20 lg:grid-cols-[1fr_0.95fr] lg:gap-12 lg:px-12">
        <div className="relative z-10 max-w-xl">
          <Tag variant="filled" className="!mb-6 !rounded-full !bg-violet-100 !px-3 !py-1 !text-xs !font-semibold !tracking-[0.13em] !text-violet-800">A LITTLE MORE HEADSPACE</Tag>
          <Title className="!mb-6 !text-[clamp(3.4rem,8vw,6.4rem)] !leading-[0.98] !tracking-[-0.075em] !text-slate-950">Make room for <span className="font-serif font-normal italic text-violet-700">what matters.</span></Title>
          <Paragraph className="!mb-8 max-w-lg !text-lg !leading-8 !text-slate-600">Keep your plans close, your mind clear, and let Daymark remind you when the time comes.</Paragraph>
          <Button type="primary" size="large" icon={<ArrowRightOutlined />} iconPlacement="end" onClick={openApp} className="!h-12 !rounded-full !px-7 !font-semibold">{token && user ? "Go to your reminders" : "Get started with Google"}</Button>
          <Text className="!mt-5 !block !text-sm !text-slate-500"><span className="mr-2 inline-block size-2 rounded-full bg-emerald-500" /> A calmer kind of productive.</Text>
        </div>

        <div className="relative mx-auto w-full max-w-xl py-6 sm:py-10">
          <div className="absolute -inset-8 rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(196,181,253,0.35),_transparent_68%)] blur-2xl" />
          <Card className="relative !rounded-[2rem] !border-white/80 !bg-white/90 !shadow-[0_30px_90px_-40px_rgba(72,56,126,0.32)]" styles={{ body: { padding: 0 } }}>
            <div className="p-6 sm:p-9">
              <div className="mb-7 flex items-start justify-between gap-4">
                <div><Text className="!text-[0.68rem] !font-semibold !tracking-[0.16em] !text-violet-700">YOUR DAY, AT A GLANCE</Text><Title level={3} className="!mb-0 !mt-2 !tracking-tight">A little more room.</Title></div>
                <span className="grid size-11 place-items-center rounded-2xl bg-violet-50 text-lg text-violet-700"><HeartOutlined /></span>
              </div>
              <div className="mb-7 flex gap-2"><span className="h-1.5 flex-1 rounded-full bg-violet-600" /><span className="h-1.5 flex-1 rounded-full bg-violet-200" /><span className="h-1.5 flex-1 rounded-full bg-slate-100" /></div>
              <div className="space-y-3">
                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4"><CheckCircleFilled className="text-xl text-emerald-500" /><div className="min-w-0 flex-1"><Text strong className="!block truncate">Pick up a few things</Text><Text type="secondary">Today · 4:30 PM</Text></div><Tag variant="filled" className="!m-0 !rounded-full !bg-amber-50 !text-amber-800">Personal</Tag></div>
                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4"><ClockCircleOutlined className="text-xl text-violet-500" /><div className="min-w-0 flex-1"><Text strong className="!block truncate">Make time for a walk</Text><Text type="secondary">Tomorrow · 9:00 AM</Text></div><Tag variant="filled" className="!m-0 !rounded-full !bg-emerald-50 !text-emerald-800">Health</Tag></div>
              </div>
              <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5 text-sm text-slate-500"><span>One thoughtful step at a time.</span><span className="text-xl text-violet-600">✳</span></div>
            </div>
          </Card>
          <div className="absolute -bottom-1 -left-2 rounded-2xl border border-white bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-lg shadow-slate-900/5 sm:-left-8"><span className="mr-2 text-emerald-500">●</span>A softer way to stay on track</div>
        </div>
      </section>

      <section className="border-y border-slate-200/70 bg-white/70">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-16 sm:px-8 md:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:px-12">
          <div><Text className="!text-xs !font-semibold !tracking-[0.16em] !text-violet-700">THE DAYMARK WAY</Text><Title level={2} className="!mb-0 !mt-3 !max-w-md !text-4xl !leading-tight !tracking-[-0.05em]">Simple enough to feel like a deep breath.</Title></div>
          <div className="grid gap-4 md:grid-cols-3">{highlights.map((item) => <Card key={item.number} className="!rounded-2xl !border-slate-200/70 !shadow-none" styles={{ body: { padding: 22 } }}><div className="mb-5 flex items-center justify-between"><Text className="!text-xs !font-semibold !tracking-widest !text-slate-400">{item.number}</Text><span className="text-lg text-violet-600">{item.icon}</span></div><Title level={4} className="!mb-2">{item.title}</Title><Paragraph className="!mb-0 !leading-6 !text-slate-600">{item.text}</Paragraph></Card>)}</div>
        </div>
      </section>
      <footer className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12"><Brand /><span>Take it one thing at a time.</span></footer>
    </main>
  );
}
