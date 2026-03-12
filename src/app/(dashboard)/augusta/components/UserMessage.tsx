"use client";

interface UserMessageProps {
  content: string;
}

export function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="flex justify-end">
      <div className="bg-charcoal text-white border-2 border-black rounded-xl px-4 py-3 max-w-[85%]">
        <p className="text-body-md whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
