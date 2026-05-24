export default function RecruiterIntro() {
  return (
    <section
      className="page-frame"
      style={{ paddingTop: "32px", paddingBottom: "32px" }}
    >
      <p
        style={{
          fontFamily: "var(--font-sans), sans-serif",
          fontSize: "16px",
          lineHeight: 1.55,
          color: "var(--text-soft)",
          maxWidth: "720px",
          margin: 0,
        }}
      >
        A real-time market analysis tool by Drew Malhotra. Live data via
        yfinance, S&amp;P 500 polled every 5 minutes, technical indicators
        (RSI · MACD · Bollinger), and an ML prediction layer with a published
        calibration report.
      </p>
    </section>
  );
}
