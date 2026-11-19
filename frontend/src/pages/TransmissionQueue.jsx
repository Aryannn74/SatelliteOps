
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'
import '../App.css'

const API_URL = 'http://localhost:8080/api/queue'

const PRIORITY_COLORS = {
  HIGH: '#dc2626',
  MEDIUM: '#d97706',
  LOW: '#16a34a'
}

const PRIORITY_BACKGROUNDS = {
  HIGH: '#fee2e2',
  MEDIUM: '#fef3c7',
  LOW: '#dcfce7'
}

const STATUS_COLORS = {
  PENDING: '#f59e0b',
  TRANSMITTED: '#16a34a'
}

// Theme-aware styles
const styles = {
  page: {
    width: '100%',
    maxWidth: 'none',
    margin: 0,
    padding: 0,
    background: 'transparent',
    color: 'var(--theme-text)'
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
    padding: '11px 18px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer'
  },

  secondaryButton: {
    background: 'var(--theme-table-head)',
    color: 'var(--theme-text)',
    padding: '11px 18px',
    border: '1px solid var(--theme-border)',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer'
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '18px',
    marginBottom: '24px'
  },

  statCard: {
    background: 'var(--theme-card)',
    color: 'var(--theme-text)',
    border: '1px solid var(--theme-border)',
    borderRadius: '12px',
    padding: '22px',
    boxShadow: 'var(--theme-shadow)'
  },

  chartCard: {
    background: 'var(--theme-card)',
    color: 'var(--theme-text)',
    border: '1px solid var(--theme-border)',
    borderRadius: '12px',
    padding: '20px',
    minWidth: 0
  },

  th: {
    background: 'var(--theme-table-head)',
    color: 'var(--theme-text)',
    textAlign: 'left',
    padding: '15px 12px',
    borderBottom: '1px solid var(--theme-border)',
    whiteSpace: 'nowrap'
  },

  td: {
    padding: '15px 12px',
    borderBottom: '1px solid var(--theme-border)',
    color: 'var(--theme-text)',
    verticalAlign: 'middle'
  },

  heading: {
    color: 'var(--theme-text)',
    marginTop: 0
  },

  muted: {
    color: 'var(--theme-muted)',
    lineHeight: 1.7
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: 'var(--theme-card)',
    color: 'var(--theme-text)'
  }
}

function TransmissionQueue() {
  const navigate = useNavigate()
  const location = useLocation()

  // Separate Queue and History sidebar views
  const searchParams = new URLSearchParams(location.search)
  const isHistoryView =
    searchParams.get('section') === 'history'

  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [transmittingId, setTransmittingId] = useState(null)
  const [scheduling, setScheduling] = useState(false)

  // Retrieve queue records from Spring Boot
  const fetchQueue = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(API_URL, {
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error('Failed to load transmission queue')
      }

      const data = await response.json()
      setQueue(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQueue()
  }, [])

  // Manually mark transmission as completed
  const markTransmitted = async (id) => {
    if (transmittingId !== null || scheduling) return

    setTransmittingId(id)
    setError('')
    setMessage('')

    try {
      const response = await fetch(
        `${API_URL}/${id}/transmit`,
        { method: 'PUT' }
      )

      if (!response.ok) {
        throw new Error(
          'Failed to update transmission status'
        )
      }

      const updatedItem = await response.json()

      setQueue((previous) =>
        previous.map((item) =>
          item.id === id ? updatedItem : item
        )
      )

      setMessage(
        `${updatedItem.satelliteId} transmitted successfully!`
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setTransmittingId(null)
    }
  }

  // Automatically transmit highest-priority pending item
  const transmitNext = async () => {
    if (scheduling || transmittingId !== null) return

    setScheduling(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch(
        `${API_URL}/transmit-next`,
        { method: 'POST' }
      )

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error(
            'No pending transmissions available'
          )
        }

        throw new Error(
          'Failed to schedule transmission'
        )
      }

      const transmittedItem = await response.json()

      setQueue((previous) =>
        previous.map((item) =>
          item.id === transmittedItem.id
            ? transmittedItem
            : item
        )
      )

      setMessage(
        `${transmittedItem.satelliteId} transmitted successfully! ` +
        `Priority: ${transmittedItem.priority}, ` +
        `Score: ${transmittedItem.priorityScore}`
      )

      await fetchQueue()
    } catch (err) {
      setError(err.message)
    } finally {
      setScheduling(false)
    }
  }

  // Pending items: highest score first
  const pendingItems = queue
    .filter((item) => item.status === 'PENDING')
    .sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore
      }

      return (
        new Date(a.createdAt) -
        new Date(b.createdAt)
      )
    })

  // Completed transmissions: latest first
  const transmittedItems = queue
    .filter((item) => item.status === 'TRANSMITTED')
    .sort(
      (a, b) =>
        new Date(b.transmittedAt) -
        new Date(a.transmittedAt)
    )

  const completionRate =
    queue.length > 0
      ? (
          (transmittedItems.length / queue.length) * 100
        ).toFixed(1)
      : '0.0'

  // Chart data
  const priorityData = ['HIGH', 'MEDIUM', 'LOW'].map(
    (priority) => ({
      name: priority,
      count: queue.filter(
        (item) => item.priority === priority
      ).length
    })
  )

  const statusData = [
    {
      name: 'PENDING',
      value: pendingItems.length
    },
    {
      name: 'TRANSMITTED',
      value: transmittedItems.length
    }
  ]

  const formatDate = (date) => {
    if (!date) return 'N/A'

    const parsed = new Date(date)

    return Number.isNaN(parsed.getTime())
      ? 'N/A'
      : parsed.toLocaleString()
  }

  const priorityBadge = (priority) => (
    <span
      style={{
        display: 'inline-block',
        padding: '7px 12px',
        borderRadius: '7px',
        fontWeight: 700,
        fontSize: '12px',
        color:
          PRIORITY_COLORS[priority] ||
          'var(--theme-muted)',
        background:
          PRIORITY_BACKGROUNDS[priority] ||
          'var(--theme-table-head)'
      }}
    >
      {priority}
    </span>
  )

  const statistics = [
    {
      label: 'Total Queue Items',
      value: queue.length,
      color: 'var(--theme-primary)',
      icon: '📦'
    },
    {
      label: 'Pending',
      value: pendingItems.length,
      color: '#d97706',
      icon: '⏳'
    },
    {
      label: 'Transmitted',
      value: transmittedItems.length,
      color: 'var(--theme-success)',
      icon: '✓'
    },
    {
      label: 'Completion Rate',
      value: `${completionRate}%`,
      color: 'var(--theme-text)',
      icon: '📊'
    }
  ]

  return (
    <div style={styles.page}>

      {/* PAGE HEADER */}
      <header style={{ marginBottom: '26px' }}>
        <p
          style={{
            color: 'var(--theme-muted)',
            fontSize: '13px',
            marginBottom: '12px'
          }}
        >
          SatelliteOps / Transmission Operations /
          {isHistoryView
            ? ' Transmission History'
            : ' Transmission Queue'}
        </p>

        <h1
          style={{
            color: 'var(--theme-text)',
            fontSize: '28px',
            margin: '0 0 8px'
          }}
        >
          {isHistoryView
            ? 'Transmission History'
            : 'Transmission Queue'}
        </h1>

        <p style={styles.muted}>
          {isHistoryView
            ? 'Review completed satellite data transmissions and their history.'
            : 'Manage pending satellite data and transmit items based on priority.'}
        </p>
      </header>

      {/* NAVIGATION BUTTONS */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '24px'
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
          onClick={fetchQueue}
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading
            ? 'Refreshing...'
            : '↻ Refresh Data'}
        </button>

        <button
          type="button"
          onClick={() =>
            navigate(
              isHistoryView
                ? '/queue'
                : '/queue?section=history'
            )
          }
          style={styles.button}
        >
          {isHistoryView
            ? 'View Transmission Queue'
            : 'View Transmission History'}
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div
          role="alert"
          style={{
            background: 'var(--theme-bg)',
            color: 'var(--theme-danger)',
            border: '1px solid var(--theme-danger)',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}
        >
          {error}
        </div>
      )}

      {/* SUCCESS MESSAGE */}
      {message && (
        <div
          role="status"
          style={{
            background: 'var(--theme-bg)',
            color: 'var(--theme-success)',
            border: '1px solid var(--theme-border)',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}
        >
          {message}
        </div>
      )}

      {/* SUMMARY STATISTICS */}
      <div style={styles.statsGrid}>
        {statistics.map((stat) => (
          <div
            key={stat.label}
            style={styles.statCard}
          >
            <div
              style={{
                fontSize: '23px',
                marginBottom: '12px'
              }}
            >
              {stat.icon}
            </div>

            <p
              style={{
                color: 'var(--theme-muted)',
                fontSize: '13px',
                marginBottom: '8px'
              }}
            >
              {stat.label}
            </p>

            <h2
              style={{
                color: stat.color,
                fontSize: '29px',
                margin: 0
              }}
            >
              {loading ? '...' : stat.value}
            </h2>
          </div>
        ))}
      </div>

      {/* TRANSMISSION QUEUE VIEW */}
      {!isHistoryView && (
        <>

          {/* QUEUE OVERVIEW */}
          <section style={styles.card}>
            <h2 style={styles.heading}>
              Transmission Queue Overview
            </h2>

            <p style={styles.muted}>
              The queue organizes satellite data
              awaiting transmission. Pending items
              are ranked by their priority score.
            </p>

            <button
              type="button"
              onClick={transmitNext}
              disabled={
                loading ||
                scheduling ||
                transmittingId !== null ||
                pendingItems.length === 0
              }
              style={{
                ...styles.button,
                background: '#7c3aed',
                marginTop: '12px',
                opacity:
                  pendingItems.length === 0 ||
                  loading ||
                  scheduling ||
                  transmittingId !== null
                    ? 0.6
                    : 1
              }}
            >
              {scheduling
                ? 'Transmitting...'
                : 'Transmit Next (Highest Priority)'}
            </button>
          </section>

          {/* PENDING TRANSMISSIONS */}
          <section style={styles.card}>
            <h2 style={styles.heading}>
              Pending Transmissions
            </h2>

            <p style={styles.muted}>
              Items are displayed in descending
              order of priority score.
            </p>

            {loading ? (
              <p style={styles.muted}>
                Loading pending transmissions...
              </p>
            ) : (
              <div
                style={{
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
                        Payload
                      </th>

                      <th style={styles.th}>
                        Priority
                      </th>

                      <th style={styles.th}>
                        Score
                      </th>

                      <th style={styles.th}>
                        Created At
                      </th>

                      <th style={styles.th}>
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {pendingItems.map((item) => (
                      <tr key={item.id}>
                        <td style={styles.td}>
                          {item.satelliteId}
                        </td>

                        <td style={styles.td}>
                          {item.payloadType}
                        </td>

                        <td style={styles.td}>
                          {priorityBadge(item.priority)}
                        </td>

                        <td
                          style={{
                            ...styles.td,
                            fontWeight: 700,
                            color: 'var(--theme-primary)'
                          }}
                        >
                          {item.priorityScore}
                        </td>

                        <td style={styles.td}>
                          {formatDate(item.createdAt)}
                        </td>

                        <td style={styles.td}>
                          <button
                            type="button"
                            onClick={() =>
                              markTransmitted(item.id)
                            }
                            disabled={
                              transmittingId !== null ||
                              scheduling
                            }
                            style={{
                              ...styles.button,
                              background: '#16a34a',
                              opacity:
                                transmittingId !== null ||
                                scheduling
                                  ? 0.6
                                  : 1
                            }}
                          >
                            {transmittingId === item.id
                              ? 'Updating...'
                              : 'Mark Transmitted'}
                          </button>
                        </td>
                      </tr>
                    ))}

                    {pendingItems.length === 0 && (
                      <tr>
                        <td
                          colSpan="6"
                          style={{
                            ...styles.td,
                            textAlign: 'center',
                            padding: '30px'
                          }}
                        >
                          No pending transmissions.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* TRANSMISSION ANALYTICS */}
          <section style={styles.card}>
            <h2 style={styles.heading}>
              Transmission Analytics
            </h2>

            <p style={styles.muted}>
              Analyze transmission priority
              distribution and completion status.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                gap: '20px',
                marginTop: '22px'
              }}
            >

              {/* PRIORITY DISTRIBUTION CHART */}
              <div style={styles.chartCard}>
                <h3
                  style={{
                    color: 'var(--theme-text)'
                  }}
                >
                  Priority Distribution
                </h3>

                <div
                  style={{
                    width: '100%',
                    height: 280
                  }}
                >
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart data={priorityData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--theme-border)"
                      />

                      <XAxis
                        dataKey="name"
                        stroke="var(--theme-muted)"
                        tick={{
                          fill: 'var(--theme-muted)'
                        }}
                      />

                      <YAxis
                        allowDecimals={false}
                        stroke="var(--theme-muted)"
                        tick={{
                          fill: 'var(--theme-muted)'
                        }}
                      />

                      <Tooltip
                        contentStyle={{
                          background:
                            'var(--theme-card)',
                          color:
                            'var(--theme-text)',
                          border:
                            '1px solid var(--theme-border)',
                          borderRadius: '8px'
                        }}
                        labelStyle={{
                          color: 'var(--theme-text)'
                        }}
                        itemStyle={{
                          color: 'var(--theme-text)'
                        }}
                      />

                      <Bar
                        dataKey="count"
                        name="Items"
                      >
                        {priorityData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={
                              PRIORITY_COLORS[entry.name]
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* TRANSMISSION STATUS CHART */}
              <div style={styles.chartCard}>
                <h3
                  style={{
                    color: 'var(--theme-text)'
                  }}
                >
                  Transmission Status
                </h3>

                <div
                  style={{
                    width: '100%',
                    height: 280
                  }}
                >
                  {queue.length === 0 ? (
                    <p style={styles.muted}>
                      No transmission data available.
                    </p>
                  ) : (
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <PieChart>
                        <Pie
                          data={statusData.filter(
                            (item) => item.value > 0
                          )}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="45%"
                          outerRadius={80}
                          label={{
                            fill: 'var(--theme-text)'
                          }}
                        >
                          {statusData
                            .filter(
                              (item) => item.value > 0
                            )
                            .map((entry) => (
                              <Cell
                                key={entry.name}
                                fill={
                                  STATUS_COLORS[entry.name]
                                }
                              />
                            ))}
                        </Pie>

                        <Tooltip
                          contentStyle={{
                            background:
                              'var(--theme-card)',
                            color:
                              'var(--theme-text)',
                            border:
                              '1px solid var(--theme-border)',
                            borderRadius: '8px'
                          }}
                          labelStyle={{
                            color: 'var(--theme-text)'
                          }}
                          itemStyle={{
                            color: 'var(--theme-text)'
                          }}
                        />

                        <Legend
                          wrapperStyle={{
                            color: 'var(--theme-text)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

            </div>
          </section>
        </>
      )}

      {/* TRANSMISSION HISTORY VIEW */}
      {isHistoryView && (
        <section style={styles.card}>
          <h2 style={styles.heading}>
            Completed Transmission History
          </h2>

          <p style={styles.muted}>
            This section displays successfully
            transmitted satellite data, including
            priority, score and transmission timestamp.
          </p>

          {loading ? (
            <p style={styles.muted}>
              Loading transmission history...
            </p>
          ) : (
            <div
              style={{
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
                      Payload
                    </th>

                    <th style={styles.th}>
                      Priority
                    </th>

                    <th style={styles.th}>
                      Score
                    </th>

                    <th style={styles.th}>
                      Created At
                    </th>

                    <th style={styles.th}>
                      Transmitted At
                    </th>

                    <th style={styles.th}>
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {transmittedItems.map((item) => (
                    <tr key={item.id}>
                      <td style={styles.td}>
                        {item.satelliteId}
                      </td>

                      <td style={styles.td}>
                        {item.payloadType}
                      </td>

                      <td style={styles.td}>
                        {priorityBadge(item.priority)}
                      </td>

                      <td
                        style={{
                          ...styles.td,
                          color: 'var(--theme-primary)',
                          fontWeight: 700
                        }}
                      >
                        {item.priorityScore}
                      </td>

                      <td style={styles.td}>
                        {formatDate(item.createdAt)}
                      </td>

                      <td style={styles.td}>
                        {formatDate(item.transmittedAt)}
                      </td>

                      <td style={styles.td}>
                        <span
                          style={{
                            background: '#dcfce7',
                            color: '#15803d',
                            padding: '7px 12px',
                            borderRadius: '7px',
                            fontSize: '12px',
                            fontWeight: 700
                          }}
                        >
                          TRANSMITTED
                        </span>
                      </td>
                    </tr>
                  ))}

                  {transmittedItems.length === 0 && (
                    <tr>
                      <td
                        colSpan="7"
                        style={{
                          ...styles.td,
                          textAlign: 'center',
                          padding: '30px'
                        }}
                      >
                        No completed transmissions yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

    </div>
  )
}

export default TransmissionQueue
