import Link from "next/link";

export default function Brand({ login = false }) {
  return (
    <Link href="/" className="inline-flex items-center gap-3 rounded-xl text-[1.2rem] font-semibold tracking-[-0.055em] text-slate-950 transition hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-500" aria-label="Daymark home">
      <span className="grid size-9 place-items-center rounded-xl bg-violet-600 text-lg text-white shadow-sm shadow-violet-200" aria-hidden="true">✳</span>
      <span>daymark<span className="text-violet-600">.</span></span>
    </Link>
  );
}
