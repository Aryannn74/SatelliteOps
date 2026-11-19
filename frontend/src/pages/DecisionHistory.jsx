
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../App.css'

const HISTORY_URL =
  'http://localhost:8080/api/priority/history'

// LIGHT / DARK MODE STYLES
const styles = {
  page: {
    width: '100%',
    maxWidth: 'none',
    margin: 0,
    padding: 0,
    background: 'transparent',
    color: 'var(--theme-text)'
  },

  header: {
    marginBottom: '28px'
  },

  breadcrumb: {
    color: 'var(--theme-muted)',
    fontSize: '13px',
    marginBottom: '12px'
  },

  title: {
    color: 'var(--theme-text)',
    fontSize: '28px',
    margin: '0 0 8px'
  },

  subtitle: {
    color: 'var(--theme-muted)',
    fontSize: '14px',
    lineHeight: 1.7
  },

  card: {
    background: 'var(--theme-card)',
    color: 'var(--theme-text)',
    border: '1px solid var(--theme-border)',
    borderRadius: '14px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: 'var(--theme-shadow)'
  },

  button: {
    background: 'var(--theme-primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '11px 18px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer'
  },

  secondaryButton: {
    background: 'var(--theme-table-head)',
    color: 'var(--theme-text)',
    border: '1px solid var(--theme-border)',
    borderRadius: '8px',
    padding: '11px 18px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer'
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '18px',
    marginBottom: '26px'
  },

  statCard: {
    background: 'var(--theme-card)',
    color: 'var(--theme-text)',
    border: '1px solid var(--theme-border)',
    borderRadius: '14px',
    padding: '22px',
    boxShadow: 'var(--theme-shadow)'
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
    background: 'var(--theme-card)',
    color: 'var(--theme-text)'
  },

  th: {
    background: 'var(--theme-table-head)',
    color: 'var(--theme-text)',
    textAlign: 'left',
    padding: '15px 13px',
    borderBottom: '1px solid var(--theme-border)',
    whiteSpace: 'nowrap',
    fontWeight: 700
  },

  td: {
    padding: '15px 13px',
    borderBottom: '1px solid var(--theme-border)',
    color: 'var(--theme-text)',
    verticalAlign: 'top'
  }
}

function DecisionHistory() {
  const navigate = useNavigate()

  // JWT authentication
  const { authFetch } = useAuth()

  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // FETCH DECISION HISTORY WITH JWT
  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await authFetch(HISTORY_URL, {
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch priority history')
      }

      const data = await response.json()

      // Display latest decisions first
      const sortedHistory = [...data].sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      )

      setHistory(sortedHistory)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [authFetch])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  // PRIORITY BADGE COLORS
  const getPriorityColor = (priority) => {
    if (priority === 'HIGH') return '#dc2626'
    if (priority === 'MEDIUM') return '#d97706'
    return '#16a34a'
  }

  const getPriorityBackground = (priority) => {
    if (priority === 'HIGH') return '#fee2e2'
    if (priority === 'MEDIUM') return '#fef3c7'
    return '#dcfce7'
  }

  // SUMMARY STATISTICS
  const totalEvaluations = history.length

  const highPriority = history.filter(
    (item) => item.priority === 'HIGH'
  ).length

  const mediumPriority = history.filter(
    (item) => item.priority === 'MEDIUM'
  ).length

  const lowPriority = history.filter(
    (item) => item.priority === 'LOW'
  ).length

  const statistics = [
    {
      title: 'Total Evaluations',
      value: totalEvaluations,
      icon: '📊',
      background: '#dbeafe',
      color: 'var(--theme-primary)'
    },
    {
      title: 'High Priority',
      value: highPriority,
      icon: '🔴',
      background: '#fee2e2',
      color: 'var(--theme-text)'
    },
    {
      title: 'Medium Priority',
      value: mediumPriority,
      icon: '🟡',
      background: '#fef3c7',
      color: 'var(--theme-text)'
    },
    {
      title: 'Low Priority',
      value: lowPriority,
      icon: '🟢',
      background: '#dcfce7',
      color: 'var(--theme-text)'
    }
  ]

  return (
    <div style={styles.page}>

      {/* PAGE HEADER */}
      <header style={styles.header}>
        <p style={styles.breadcrumb}>
          SatelliteOps / Intelligent Prioritization /
          Decision History
        </p>

        <h1 style={styles.title}>
          Intelligent Decision History
        </h1>

        <p style={styles.subtitle}>
          Review previously evaluated satellite
          transmission priorities and decisions
          stored in MongoDB.
        </p>
      </header>

      {/* NAVIGATION BUTTONS */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '26px'
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/')}
          style={styles.secondaryButton}
        >
          ← Back to Dashboard
        </button>

        <button
          type="button"
          onClick={fetchHistory}
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.6 : 1,
            cursor: loading
              ? 'not-allowed'
              : 'pointer'
          }}
        >
          {loading
            ? 'Refreshing...'
            : '↻ Refresh History'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/telemetry')}
          style={styles.button}
        >
          Evaluate Another Satellite
        </button>
      </div>

      {/* STATISTICS CARDS */}
      <div style={styles.statsGrid}>
        {statistics.map((stat) => (
          <div
            key={stat.title}
            style={styles.statCard}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '10px',
                background: stat.background,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '23px',
                marginBottom: '16px'
              }}
            >
              {stat.icon}
            </div>

            <p
              style={{
                color: 'var(--theme-muted)',
                fontSize: '13px',
                margin: '0 0 8px'
              }}
            >
              {stat.title}
            </p>

            <h2
              style={{
                color: stat.color,
                fontSize: '30px',
                fontWeight: 700,
                margin: 0
              }}
            >
              {loading ? '...' : stat.value}
            </h2>
          </div>
        ))}
      </div>

      {/* DECISION HISTORY TABLE */}
      <section style={styles.card}>

        <div style={{ marginBottom: '22px' }}>
          <h2
            style={{
              color: 'var(--theme-text)',
              fontSize: '20px',
              margin: '0 0 10px'
            }}
          >
            Priority Evaluation Records
          </h2>

          <p
            style={{
              color: 'var(--theme-muted)',
              fontSize: '14px',
              margin: 0
            }}
          >
            Complete history of priority decisions
            generated by the intelligent rule-based
            evaluation engine.
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div
            style={{
              padding: '30px',
              textAlign: 'center',
              color: 'var(--theme-muted)'
            }}
          >
            Loading priority history...
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div
            role="alert"
            style={{
              padding: '16px',
              background: 'var(--theme-bg)',
              border: '1px solid var(--theme-danger)',
              borderRadius: '8px',
              color: 'var(--theme-danger)',
              marginBottom: '20px'
            }}
          >
            {error}
          </div>
        )}

        {/* HISTORY TABLE */}
        {!loading && !error && (
          <div
            style={{
              width: '100%',
              overflowX: 'auto',
              border: '1px solid var(--theme-border)',
              borderRadius: '10px'
            }}
          >
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>
                    Satellite ID
                  </th>

                  <th style={styles.th}>
                    Battery (%)
                  </th>

                  <th style={styles.th}>
                    Link Quality (%)
                  </th>

                  <th style={styles.th}>
                    Payload
                  </th>

                  <th style={styles.th}>
                    Score
                  </th>

                  <th style={styles.th}>
                    Priority
                  </th>

                  <th style={styles.th}>
                    Explanation
                  </th>

                  <th style={styles.th}>
                    Evaluated At
                  </th>
                </tr>
              </thead>

              <tbody>
                {history.map((item, index) => (
                  <tr key={item.id || index}>

                    {/* SATELLITE ID */}
                    <td
                      style={{
                        ...styles.td,
                        fontWeight: 700,
                        color: 'var(--theme-text)'
                      }}
                    >
                      {item.satelliteId}
                    </td>

                    {/* BATTERY LEVEL */}
                    <td style={styles.td}>
                      {item.batteryLevel}%
                    </td>

                    {/* LINK QUALITY */}
                    <td style={styles.td}>
                      {item.linkQuality}%
                    </td>

                    {/* PAYLOAD TYPE */}
                    <td style={styles.td}>
                      {item.payloadType}
                    </td>

                    {/* PRIORITY SCORE */}
                    <td
                      style={{
                        ...styles.td,
                        fontWeight: 700,
                        color: 'var(--theme-primary)'
                      }}
                    >
                      {item.score}
                    </td>

                    {/* PRIORITY BADGE */}
                    <td style={styles.td}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '7px 12px',
                          borderRadius: '7px',
                          fontWeight: 700,
                          fontSize: '12px',
                          color:
                            getPriorityColor(item.priority),
                          background:
                            getPriorityBackground(item.priority)
                        }}
                      >
                        {item.priority}
                      </span>
                    </td>

                    {/* EXPLANATION */}
                    <td
                      style={{
                        ...styles.td,
                        minWidth: '240px',
                        maxWidth: '350px',
                        lineHeight: 1.6
                      }}
                    >
                      {item.explanation || 'N/A'}
                    </td>

                    {/* EVALUATION TIMESTAMP */}
                    <td
                      style={{
                        ...styles.td,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.createdAt
                        ? new Date(
                            item.createdAt
                          ).toLocaleString()
                        : 'N/A'}
                    </td>
                  </tr>
                ))}

                {/* EMPTY STATE */}
                {history.length === 0 && (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        padding: '35px',
                        textAlign: 'center',
                        color: 'var(--theme-muted)'
                      }}
                    >
                      No priority decisions found.
                      Evaluate a satellite to create
                      your first decision record.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* INFORMATION SECTION */}
      <section style={styles.card}>
        <h2
          style={{
            color: 'var(--theme-text)',
            fontSize: '19px',
            marginTop: 0
          }}
        >
          About Decision History
        </h2>

        <p
          style={{
            color: 'var(--theme-muted)',
            lineHeight: 1.8,
            fontSize: '14px',
            marginBottom: 0
          }}
        >
          Each record represents a satellite
          transmission priority evaluation performed
          by the SatelliteOps intelligent rule-based
          engine. The system considers battery level,
          communication link quality and payload type
          to generate a priority score and classification.
          These decisions are stored in MongoDB for
          monitoring, analysis and future review.
        </p>
      </section>

    </div>
  )
}

export default DecisionHistory
