"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-[100dvh] bg-yellow text-black flex flex-col relative overflow-hidden">
      {/* Dot pattern overlay */}
      <div className="absolute inset-0 dot-pattern pointer-events-none" />

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10">
        {/* Logo / Title */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/heydrew-logo.svg"
          alt="HeyDrew!"
          width={360}
          height={180}
          className="mb-6"
        />

        <p className="font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight max-w-lg">
          Let&apos;s save some<br />
          <span className="inline-block" style={{ WebkitTextStroke: "2px black", color: "transparent" }}>
            fucking
          </span>{" "}
          money!
        </p>

        <p className="mt-5 text-charcoal/70 text-base sm:text-lg max-w-md font-body">
          Tax strategies your accountant should have told you about.
          Guided setup, real compliance docs, zero guesswork.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push("/signup")}
            className="btn-brutal-lg px-8 py-4 bg-black text-white
              font-heading font-bold text-lg"
          >
            Get started &rarr;
          </button>
        </div>
      </main>
    </div>
  );
}
