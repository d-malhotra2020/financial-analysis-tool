export default function CalibrationCard() {
  return (
    <section
      className="page-frame"
      style={{ paddingTop: "32px", paddingBottom: "48px" }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          padding: "28px 32px",
        }}
      >
        <p className="smallcaps-mono" style={{ marginBottom: "16px" }}>
          // CALIBRATION REPORT
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) auto",
            gap: "32px",
            alignItems: "start",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-sans), sans-serif",
              fontSize: "14px",
              lineHeight: 1.6,
              color: "var(--text-soft)",
              maxWidth: "640px",
              margin: 0,
            }}
          >
            The 94% prediction accuracy claim is currently un-backtested. A
            first-class backtest harness — running every model against
            historical data and emitting a calibration report (predicted vs.
            actual, by time window and instrument class) — is the next
            milestone. Code that runs the same way live as it does in
            backtests.
          </p>

          <div
            style={{
              width: "260px",
              maxWidth: "100%",
              minHeight: "120px",
              border: "1px dashed var(--border-strong)",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <p
              className="smallcaps-mono"
              style={{
                color: "var(--accent)",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              // NEXT: PUBLISHED CALIBRATION TABLE
            </p>
          </div>
        </div>

        {/* Step strip */}
        <div
          style={{
            marginTop: "28px",
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <Step label="// 01 HARNESS SCAFFOLDING" active />
          <Arrow />
          <Step label="// 02 HISTORICAL REPLAY" />
          <Arrow />
          <Step label="// 03 CALIBRATION TABLE EMIT" />
          <Arrow />
          <Step label="// 04 PUBLISHED REPORT" />
        </div>
      </div>
    </section>
  );
}

function Step({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      className="smallcaps-mono"
      style={{
        padding: "6px 10px",
        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
        borderRadius: "3px",
        color: active ? "var(--accent)" : "var(--text-muted)",
        background: active ? "var(--accent-soft)" : "transparent",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function Arrow() {
  return (
    <span
      aria-hidden
      style={{
        color: "var(--text-muted)",
        fontFamily: "var(--font-mono), monospace",
        fontSize: "10px",
        letterSpacing: "0.1em",
      }}
    >
      ──→
    </span>
  );
}
