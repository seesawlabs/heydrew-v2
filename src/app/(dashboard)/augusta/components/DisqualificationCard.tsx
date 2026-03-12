"use client";

interface DisqualificationCardProps {
  title: string;
  message: string;
  onExploreOther?: () => void;
}

export function DisqualificationCard({
  title,
  message,
  onExploreOther,
}: DisqualificationCardProps) {
  return (
    <div className="pl-11">
      <div className="bg-white border-2 border-black rounded-xl card-brutal p-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-red-primary text-lg">&#10007;</span>
          <h3 className="font-heading text-heading-sm font-bold text-black">{title}</h3>
        </div>
        <p className="text-body-sm text-charcoal/60">{message}</p>
        {onExploreOther && (
          <button
            onClick={onExploreOther}
            className="px-5 py-2 min-h-[44px] border-2 border-black text-black rounded-xl
              font-body text-body-sm font-semibold
              btn-brutal"
          >
            Explore other strategies
          </button>
        )}
      </div>
    </div>
  );
}
