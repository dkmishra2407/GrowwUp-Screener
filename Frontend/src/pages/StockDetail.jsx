import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { fetchStockDetails } from '../config/api'
import LoadingSpinner from '../components/LoadingSpinner'
import KeyRatios from '../components/KeyRatios'
import DataTable from '../components/DataTable'
import './StockDetail.css'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'quarterly', label: 'Quarterly' },
  { id: 'profit_loss', label: 'P&L' },
  { id: 'balance_sheet', label: 'Balance Sheet' },
  { id: 'cash_flow', label: 'Cash Flow' },
  { id: 'ratios', label: 'Ratios' },
  { id: 'shareholding', label: 'Shareholding' },
  { id: 'peers', label: 'Peers' },
]

export default function StockDetail() {
  const { symbol } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const view = searchParams.get('view') || 'consolidated'

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const result = await fetchStockDetails(symbol, view)
        if (!cancelled) setData(result)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [symbol, view])

  const setView = (newView) => {
    setSearchParams({ view: newView })
  }

  const scrollToSection = (tabId) => {
    setActiveTab(tabId)
    const el = document.getElementById(`section-${tabId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (loading) {
    return (
      <div className="page stock-detail-page">
        <header className="page-header">
          <Link to="/" className="brand">
            <div className="brand-icon">G</div>
            <div className="brand-text">
              <h1>GrowUp Screener</h1>
            </div>
          </Link>
        </header>
        <LoadingSpinner message={`Fetching ${symbol?.toUpperCase()} data...`} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="page stock-detail-page">
        <header className="page-header">
          <Link to="/" className="brand">
            <div className="brand-icon">G</div>
            <div className="brand-text">
              <h1>GrowUp Screener</h1>
            </div>
          </Link>
        </header>
        <div className="error-state card">
          <span style={{ fontSize: '2.5rem' }}>⚠️</span>
          <h2>Could not load stock</h2>
          <p>{error}</p>
          <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            ← Back to search
          </Link>
        </div>
      </div>
    )
  }

  const highlightEntries = Object.entries(data.ratios?.highlights || {})

  return (
    <div className="page stock-detail-page">
      <header className="page-header">
        <Link to="/" className="brand">
          <div className="brand-icon">G</div>
          <div className="brand-text">
            <h1>GrowUp Screener</h1>
          </div>
        </Link>
        <div className="view-toggle">
          <button
            type="button"
            className={`btn btn-ghost ${view === 'consolidated' ? 'active' : ''}`}
            onClick={() => setView('consolidated')}
          >
            Consolidated
          </button>
          <button
            type="button"
            className={`btn btn-ghost ${view === 'standalone' ? 'active' : ''}`}
            onClick={() => setView('standalone')}
          >
            Standalone
          </button>
        </div>
      </header>

      <section className="stock-hero card">
        <div className="stock-hero-top">
          <div>
            <div className="stock-badges">
              <span className="badge badge-success">{data.symbol}</span>
              <span className="badge badge-muted">{data.view}</span>
            </div>
            <h1 className="stock-name">{data.company_name || data.symbol}</h1>
          </div>
          <a
            href={data.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost source-link"
          >
            View on Screener.in ↗
          </a>
        </div>
        {data.about && <p className="stock-about">{data.about}</p>}
      </section>

      <KeyRatios ratios={data.key_ratios} />

      <nav className="tab-nav card">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => scrollToSection(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="sections">
        <div id="section-overview" className="section-anchor">
          <DataTable title="Annual Results" table={data.annual_results} />
        </div>

        <div id="section-quarterly" className="section-anchor">
          <DataTable title="Quarterly Results" table={data.quarterly} />
        </div>

        <div id="section-profit_loss" className="section-anchor">
          <DataTable title="Profit & Loss (Annual)" table={data.profit_loss} />
        </div>

        <div id="section-balance_sheet" className="section-anchor">
          <DataTable title="Balance Sheet" table={data.balance_sheet} />
        </div>

        <div id="section-cash_flow" className="section-anchor">
          <DataTable title="Cash Flow Statement" table={data.cash_flow} />
        </div>

        <div id="section-ratios" className="section-anchor">
          {highlightEntries.length > 0 && (
            <div className="highlights card">
              <h3 className="data-table-title">Highlighted Ratios</h3>
              <div className="highlights-grid">
                {highlightEntries.map(([metric, values]) => (
                  <div key={metric} className="highlight-item">
                    <span className="highlight-metric">{metric}</span>
                    <span className="highlight-values">
                      {values.filter(Boolean).join(' · ') || '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DataTable title="Detailed Ratios" table={data.ratios?.table} />
        </div>

        <div id="section-shareholding" className="section-anchor">
          <DataTable title="Shareholding Pattern" table={data.shareholding} />
        </div>

        <div id="section-peers" className="section-anchor">
          <DataTable title="Peer Comparison" table={data.peers} />
        </div>
      </div>
    </div>
  )
}
