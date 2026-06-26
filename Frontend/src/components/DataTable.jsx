import './DataTable.css'

export default function DataTable({ title, table, emptyMessage = 'No data available' }) {
  if (!table?.columns?.length) {
    return (
      <div className="data-table-section card">
        <h3 className="data-table-title">{title}</h3>
        <p className="empty-message">{emptyMessage}</p>
      </div>
    )
  }

  const metricCol = table.columns[0]
  const periodCols = table.columns.slice(1)

  return (
    <div className="data-table-section card">
      <h3 className="data-table-title">{title}</h3>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th className="sticky-col">{metricCol}</th>
              {periodCols.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, i) => (
              <tr key={i}>
                <td className="sticky-col metric-cell">{row[0]}</td>
                {row.slice(1).map((cell, j) => (
                  <td key={j} className="value-cell">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
