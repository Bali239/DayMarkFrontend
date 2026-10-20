"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Alert, Button, Card, Spin, Typography } from "antd";
import { ArrowLeftOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import Brand from "@/components/Brand";

const { Title, Paragraph, Text } = Typography;

export default function GoogleLogin({ googleClientId, loading, error, onCredential }) {
  const [googleReady, setGoogleReady] = useState(false);
  const googleButton = useRef(null);

  useEffect(() => {
    if (!googleReady || !googleButton.current || !googleClientId || !window.google?.accounts?.id) return;
    window.google.accounts.id.initialize({ client_id: googleClientId, callback: onCredential, auto_select: false, cancel_on_tap_outside: true });
    googleButton.current.innerHTML = "";
    window.google.accounts.id.renderButton(googleButton.current, { type: "standard", theme: "outline", size: "large", shape: "rectangular", text: "continue_with", width: 280, logo_alignment: "left" });
  }, [googleReady, googleClientId, onCredential]);

  return <main className="grid min-h-screen bg-[#fbfaf8] lg:grid-cols-2">
    <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={() => setGoogleReady(true)} />
    <section className="relative flex min-h-[38vh] flex-col justify-between overflow-hidden bg-violet-700 px-6 py-7 text-white sm:px-10 lg:min-h-screen lg:px-14 lg:py-10">
      <div className="absolute -right-28 -top-24 size-[28rem] rounded-full border border-white/10" /><div className="absolute -right-12 -top-8 size-[22rem] rounded-full border border-white/10" />
      <Brand login />
      <div className="relative z-10 my-12 max-w-xl lg:my-auto"><div className="mb-5 text-4xl text-violet-200">✳</div><Text className="!text-xs !font-semibold !tracking-[0.18em] !text-violet-200">A LITTLE MORE HEADSPACE</Text><Title className="!mb-5 !mt-3 !text-[clamp(3rem,7vw,5.5rem)] !leading-[0.98] !tracking-[-0.07em] !text-white">Make room for <span className="font-serif font-normal italic text-violet-200">what matters.</span></Title><Paragraph className="!max-w-lg !text-base !leading-7 !text-violet-100 sm:!text-lg">Keep your plans close, your mind clear, and let Daymark remind you when the time comes.</Paragraph></div>
      <Text className="!text-sm !text-violet-200">A calmer kind of productive.</Text>
    </section>
    <section className="flex items-center justify-center px-5 py-12 sm:px-10 lg:px-14">
      <Card className="w-full max-w-md !rounded-3xl !border-slate-200/80 !shadow-[0_24px_80px_-50px_rgba(15,23,42,0.3)]" styles={{ body: { padding: "clamp(24px, 5vw, 40px)" } }}>
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-violet-700"><ArrowLeftOutlined /> Back to home</Link>
        <Title level={2} className="!mb-2 !tracking-tight">Welcome to Daymark</Title><Paragraph className="!mb-7 !text-slate-600">Sign in to see your reminders and make room for what matters.</Paragraph>
        {error && <Alert className="!mb-5 !rounded-xl" type="error" showIcon message={error} />}
        {!googleClientId ? <Alert className="!rounded-xl" type="info" showIcon message="Connecting to secure Google sign-in…" /> : <div className="flex min-h-[48px] justify-center">{loading ? <Spin size="large" /> : <div ref={googleButton} />}</div>}
        {loading && <Text className="!mt-3 !block !text-center !text-sm !text-slate-500">Signing you in…</Text>}
        <div className="mt-8 flex items-center justify-center gap-2 border-t border-slate-100 pt-5 text-xs text-slate-500"><SafetyCertificateOutlined className="text-emerald-600" /> Secure sign-in with Google · No password to remember</div>
      </Card>
    </section>
  </main>;
}
