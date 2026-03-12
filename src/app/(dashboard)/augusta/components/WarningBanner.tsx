"use client";

interface WarningBannerProps {
  message: string;
}

export function WarningBanner({ message }: WarningBannerProps) {
  return (
    <div className="pl-11">
      <div className="bg-yellow border-2 border-black rounded-xl px-4 py-3 flex items-start gap-3">
        <span className="text-black text-lg shrink-0">&#9888;</span>
        <p className="text-body-sm text-black">{message}</p>
      </div>
    </div>
  );
}
