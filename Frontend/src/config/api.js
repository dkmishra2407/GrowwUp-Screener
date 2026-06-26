const API_BASE = import.meta.env.VITE_API_URL || ''

export async function fetchStockDetails(symbol, view = 'consolidated') {
  const params = new URLSearchParams({ view })
  const res = await fetch(`${API_BASE}/api/stocks/${encodeURIComponent(symbol)}?${params}`)

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Failed to load stock data (${res.status})`)
  }

  return res.json()
}
