import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './Home.css'

const POPULAR_STOCKS = ['ITC', 'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'WIPRO', 'SBIN', 'TATAMOTORS']

export default function Home() {
  const [symbol, setSymbol] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = symbol.trim().toUpperCase()
    if (trimmed) {
      navigate(`/stock/${trimmed}`)
    }
  }

  return (
    <div className="page home-page">
      <header className="page-header">
        <Link to="/" className="brand">
          <div className="brand-icon">G</div>
          <div className="brand-text">
            <h1>GrowUp Screener</h1>
            <span>Indian stock fundamentals</span>
          </div>
        </Link>
      </header>

      <main className="hero card">
        <div className="hero-content">
          <span className="hero-eyebrow">Research smarter</span>
          <h2 className="hero-title">
            Deep dive into any
            <span className="gradient-text"> NSE/BSE stock</span>
          </h2>
          <p className="hero-subtitle">
            Enter a stock symbol to view quarterly results, P&amp;L, balance sheet,
            cash flow, ratios, shareholding, and peer comparison — all in one place.
          </p>

          <form className="search-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                className="input search-input"
                type="text"
                placeholder="e.g. ITC, RELIANCE, TCS..."
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn btn-primary">
                Analyze Stock →
              </button>
            </div>
          </form>

          <div className="popular-section">
            <span className="popular-label">Popular:</span>
            <div className="popular-chips">
              {POPULAR_STOCKS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="chip"
                  onClick={() => navigate(`/stock/${s}`)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-card">
            <div className="visual-row">
              <span>Market Cap</span>
              <strong>₹5.2L Cr</strong>
            </div>
            <div className="visual-row">
              <span>ROE</span>
              <strong className="up">28.4%</strong>
            </div>
            <div className="visual-row">
              <span>P/E</span>
              <strong>24.6</strong>
            </div>
            <div className="visual-chart">
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <div key={i} className="bar" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <section className="features">
        {[
          { icon: '📊', title: 'Quarterly Results', desc: 'Sales, profit, EPS trends' },
          { icon: '📈', title: 'Financial Statements', desc: 'P&L, balance sheet, cash flow' },
          { icon: '🔍', title: 'Key Ratios', desc: 'P/E, ROE, ROCE, debt metrics' },
          { icon: '👥', title: 'Shareholding', desc: 'Promoter & institutional holdings' },
        ].map((f) => (
          <div key={f.title} className="feature-card card">
            <span className="feature-icon">{f.icon}</span>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
