export default function TopNav() {
  return (
    <header
      className="w-full"
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)",
      }}
    >
      <div
        className="page-frame"
        style={{
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            aria-hidden
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "24px",
              height: "24px",
              borderRadius: "4px",
              background: "var(--accent)",
              color: "var(--text)",
              fontWeight: 700,
              fontSize: "13px",
              lineHeight: 1,
              fontFamily: "var(--font-sans), sans-serif",
            }}
          >
            D
          </span>
          <span
            style={{
              fontFamily: "var(--font-sans), sans-serif",
              fontSize: "15px",
              color: "var(--text)",
              fontWeight: 500,
            }}
          >
            Financial Analysis
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            className="smallcaps-mono tabular"
            style={{
              border: "1px solid var(--border)",
              padding: "3px 8px",
              borderRadius: "4px",
              color: "var(--text-soft)",
            }}
          >
            v0.2
          </span>
        </div>
      </div>
    </header>
  );
}
