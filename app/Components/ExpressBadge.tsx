export default function ExpressBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white">
        C
      </span>
      <span className="font-bold italic text-red-600">Express</span>
    </span>
  );
}