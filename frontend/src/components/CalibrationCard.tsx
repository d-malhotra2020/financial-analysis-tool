export default function CalibrationCard() {
  return (
    <section className="page-frame section">
      <hr className="rule mb-10" />
      <p className="smallcaps mb-6">Calibration report</p>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 items-start">
        <p
          className="font-serif text-[var(--ink)]"
          style={{ fontSize: "18px", lineHeight: 1.6, maxWidth: "640px" }}
        >
          The 94% prediction accuracy claim is currently un-backtested. A
          first-class backtest harness — running every model against historical
          data and emitting a calibration report (predicted vs. actual, by time
          window and instrument class) — is the next milestone.{" "}
          <em>
            Code that runs the same way live as it does in backtests.
          </em>
        </p>

        <div
          className="border border-[var(--rule)] flex items-center justify-center text-center"
          style={{
            width: "320px",
            height: "200px",
            maxWidth: "100%",
          }}
        >
          <p
            className="smallcaps-mono"
            style={{
              color: "var(--accent)",
              letterSpacing: "0.14em",
              fontSize: "11px",
              padding: "0 1.5rem",
              lineHeight: 1.6,
            }}
          >
            Next: published calibration table
          </p>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-4">
        <Milestone
          step="01"
          label="Harness scaffolding"
          status="Designing"
        />
        <Milestone step="02" label="Historical replay" status="Queued" />
        <Milestone
          step="03"
          label="Calibration table emit"
          status="Queued"
        />
        <Milestone
          step="04"
          label="Published report"
          status="Queued"
        />
      </div>
    </section>
  );
}

function Milestone({
  step,
  label,
  status,
}: {
  step: string;
  label: string;
  status: string;
}) {
  return (
    <div className="border-t border-[var(--rule)] pt-3">
      <p className="font-mono tabular text-[12px] text-[var(--muted)]">
        {step}
      </p>
      <p
        className="font-serif text-[var(--ink)] mt-1"
        style={{ fontSize: "15px", lineHeight: 1.35 }}
      >
        {label}
      </p>
      <p className="smallcaps mt-2">{status}</p>
    </div>
  );
}
