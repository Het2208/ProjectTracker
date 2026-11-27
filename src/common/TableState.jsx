/** Shared table body states for API-driven pages. */
export default function TableState({ colSpan, loading, error, count, emptyText = 'No records found.', loadingText = 'Loading…', onRetry }) {
  if (loading) {
    return <tr><td colSpan={colSpan} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>{loadingText}</td></tr>;
  }
  if (error) {
    return (
      <tr>
        <td colSpan={colSpan} style={{ textAlign: 'center', padding: '30px' }}>
          <span className="error-text" role="alert">{error}</span>
          {onRetry && <div style={{ marginTop: '10px' }}><button onClick={onRetry}>Retry</button></div>}
        </td>
      </tr>
    );
  }
  if (!count) {
    return <tr><td colSpan={colSpan} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>{emptyText}</td></tr>;
  }
  return null;
}
