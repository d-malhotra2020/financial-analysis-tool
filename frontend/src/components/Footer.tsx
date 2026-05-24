export default function Footer() {
  return (
    <footer
      style={{
        width: "100%",
        marginTop: "48px",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div
        className="page-frame"
        style={{
          padding: "24px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <FooterLink href="https://github.com/d-malhotra2020/financial-analysis-tool">
          // SOURCE
        </FooterLink>
        <Dot />
        <FooterLink href="https://drewmalhotra.com">// PORTFOLIO</FooterLink>
        <Dot />
        <FooterLink href="https://drewmalhotra.com/#/work/financial-analysis">
          // PROJECT DEEP-DIVE
        </FooterLink>

        <span
          className="smallcaps-mono"
          style={{ marginLeft: "auto", color: "var(--text-muted)" }}
        >
          © {new Date().getFullYear()} D. MALHOTRA
        </span>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="smallcaps-mono"
      style={{
        color: "var(--text-muted)",
        textDecoration: "none",
        transition: "color 0.12s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-soft)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
    >
      {children}
    </a>
  );
}

function Dot() {
  return (
    <span
      aria-hidden
      className="font-mono"
      style={{ color: "var(--text-muted)", fontSize: "11px" }}
    >
      ·
    </span>
  );
}
