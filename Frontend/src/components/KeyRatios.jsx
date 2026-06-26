import './KeyRatios.css'

export default function KeyRatios({ ratios }) {
  const entries = Object.entries(ratios || {})

  if (!entries.length) return null

  return (
    <section className="key-ratios">
      <h2 className="section-title">Key Metrics</h2>
      <div className="ratios-grid">
        {entries.map(([label, value]) => (
          <div key={label} className="ratio-card">
            <span className="ratio-label">{label}</span>
            <span className="ratio-value">{value}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
