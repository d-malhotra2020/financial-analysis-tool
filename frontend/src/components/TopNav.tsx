export default function TopNav() {
  return (
    <header className="w-full">
      <div className="page-frame flex items-end justify-between pt-8 pb-4">
        <div className="flex items-baseline gap-3">
          <span
            className="font-serif text-[18px] text-[var(--ink)]"
            style={{ fontWeight: 500 }}
          >
            Financial Analysis
          </span>
          <span className="text-[var(--muted)] font-serif text-[18px]">·</span>
          <span
            className="font-serif italic text-[18px] text-[var(--muted)]"
            style={{ fontWeight: 400 }}
          >
            Drew Malhotra
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="smallcaps-mono px-2 py-1 border border-[var(--rule)] tabular">
            v0.2
          </span>
        </div>
      </div>
      <hr className="rule" />
    </header>
  );
}
