export default function Footer() {
  return (
    <footer className="w-full mt-24">
      <hr className="rule" />
      <div className="page-frame py-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[15px]">
        <a
          href="https://github.com/d-malhotra2020/financial-analysis-tool"
          target="_blank"
          rel="noopener noreferrer"
          className="editorial-link font-serif"
        >
          Source on GitHub
        </a>
        <span className="font-mono text-[var(--muted)]">·</span>
        <a
          href="https://drewmalhotra.com"
          target="_blank"
          rel="noopener noreferrer"
          className="editorial-link font-serif"
        >
          Portfolio
        </a>
        <span className="font-mono text-[var(--muted)]">·</span>
        <a
          href="https://drewmalhotra.com/#/work/financial-analysis"
          target="_blank"
          rel="noopener noreferrer"
          className="editorial-link font-serif"
        >
          Project deep-dive
        </a>
        <span className="ml-auto smallcaps-mono">
          © {new Date().getFullYear()} D. Malhotra
        </span>
      </div>
    </footer>
  );
}
