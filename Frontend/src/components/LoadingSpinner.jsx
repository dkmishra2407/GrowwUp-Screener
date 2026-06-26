export default function LoadingSpinner({ message = 'Loading stock data...' }) {
  return (
    <div className="loading-state">
      <div className="spinner" />
      <p style={{ color: 'var(--text-muted)' }}>{message}</p>
    </div>
  )
}
