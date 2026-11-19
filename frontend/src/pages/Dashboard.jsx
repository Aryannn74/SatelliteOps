
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

import { useAuth } from '../context/AuthContext'
import '../App.css'

const API_URL = 'http://localhost:8080/api/telemetry'
const QUEUE_URL = 'http://localhost:8080/api/queue'

const emptyForm = {
  satelliteId: '',
  batteryLevel: '',
  linkQuality: '',
  payloadType: 'IMAGE'
}

const PAYLOAD_COLORS = {
  IMAGE: '#2563eb',
  VIDEO: '#8b5cf6',
  SENSOR: '#0d9488',
  TEXT: '#f59e0b'
}

const cardStyle = {
  background: 'var(--theme-card)',
  color: 'var(--theme-text)',
  border: '1px solid var(--theme-border)',
  borderRadius: 14,
  padding: 22,
  boxShadow: 'var(--theme-shadow)'
}

const buttonStyle = {
  background: 'var(--theme-primary)',
  color: '#ffffff',
  border: 'none',
  borderRadius: 8,
  padding: '11px 17px',
  fontWeight: 600,
  cursor: 'pointer'
}

const mutedStyle = {
  color: 'var(--theme-muted)'
}

const headingStyle = {
  color: 'var(--theme-text)'
}

const tooltipStyle = {
  backgroundColor: 'var(--theme-card)',
  color: 'var(--theme-text)',
  border: '1px solid var(--theme-border)',
  borderRadius: 8
}

export default function Dashboard({ view = 'overview' }) {
  const navigate = useNavigate()

  // JWT authentication
  const { authFetch } = useAuth()

  const [telemetry, setTelemetry] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [addingToQueueId, setAddingToQueueId] = useState(null)
  const [form, setForm] = useState({ ...emptyForm })

  // FETCH TELEMETRY WITH JWT
  const refreshTelemetry = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await authFetch(API_URL, {
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch telemetry')
      }

      const data = await response.json()
      setTelemetry(data)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [authFetch])

  useEffect(() => {
    refreshTelemetry()
  }, [refreshTelemetry])

  // FORM INPUT
  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((previous) => ({
      ...previous,
      [name]: value
    }))
  }

  // EDIT TELEMETRY
  const handleEdit = (record) => {
    setEditingId(record.id)

    setForm({
      satelliteId: record.satelliteId,
      batteryLevel: String(record.batteryLevel),
      linkQuality: String(record.linkQuality),
      payloadType: record.payloadType
    })

    setError('')
    setMessage('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // CANCEL EDIT
  const handleCancelEdit = () => {
    setEditingId(null)
    setForm({ ...emptyForm })
    setError('')
    setMessage('')
  }

  // ADD OR UPDATE TELEMETRY WITH JWT
  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setMessage('')

    const batteryLevel = Number(form.batteryLevel)
    const linkQuality = Number(form.linkQuality)

    if (
      !form.satelliteId.trim() ||
      form.batteryLevel === '' ||
      form.linkQuality === '' ||
      !Number.isFinite(batteryLevel) ||
      !Number.isFinite(linkQuality) ||
      batteryLevel < 0 ||
      batteryLevel > 100 ||
      linkQuality < 0 ||
      linkQuality > 100
    ) {
      setError(
        'Please enter valid telemetry values between 0 and 100.'
      )
      return
    }

    const telemetryData = {
      satelliteId: form.satelliteId.trim(),
      batteryLevel,
      linkQuality,
      payloadType: form.payloadType
    }

    const isEditing = editingId !== null

    const url = isEditing
      ? `${API_URL}/${editingId}`
      : API_URL

    setSubmitting(true)

    try {
      const response = await authFetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(telemetryData)
      })

      if (!response.ok) {
        throw new Error(
          isEditing
            ? 'Failed to update telemetry'
            : 'Failed to add telemetry'
        )
      }

      const savedTelemetry = await response.json()

      if (isEditing) {
        setTelemetry((previous) =>
          previous.map((record) =>
            record.id === editingId
              ? savedTelemetry
              : record
          )
        )

        setMessage('Telemetry updated successfully!')
      } else {
        setTelemetry((previous) => [
          ...previous,
          savedTelemetry
        ])

        setMessage('Telemetry added successfully!')
      }

      setEditingId(null)
      setForm({ ...emptyForm })

    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // DELETE TELEMETRY WITH JWT
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this telemetry record?'
    )

    if (!confirmed) return

    setError('')
    setMessage('')
    setDeletingId(id)

    try {
      const response = await authFetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete telemetry')
      }

      setTelemetry((previous) =>
        previous.filter((record) => record.id !== id)
      )

      if (editingId === id) {
        setEditingId(null)
        setForm({ ...emptyForm })
      }

      setMessage('Telemetry deleted successfully!')

    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  // NAVIGATE TO PRIORITY EVALUATION
  const evaluatePriority = (satellite) => {
    navigate('/priority', {
      state: {
        satellite: {
          satelliteId: satellite.satelliteId,
          batteryLevel: satellite.batteryLevel,
          linkQuality: satellite.linkQuality,
          payloadType: satellite.payloadType
        }
      }
    })
  }

  // ADD TO TRANSMISSION QUEUE WITH JWT
  const addToQueue = async (telemetryId) => {
    if (addingToQueueId !== null) return

    setAddingToQueueId(telemetryId)
    setError('')
    setMessage('')

    try {
      const response = await authFetch(
        `${QUEUE_URL}/from-telemetry/${telemetryId}`,
        { method: 'POST' }
      )

      if (!response.ok) {
        throw new Error(
          'Failed to add telemetry to transmission queue'
        )
      }

      const queueItem = await response.json()

      setMessage(
        `${queueItem.satelliteId} added to Transmission Queue! ` +
        `Priority: ${queueItem.priority}, ` +
        `Score: ${queueItem.priorityScore}, ` +
        `Status: ${queueItem.status}`
      )

      window.alert(
        `Successfully added to Transmission Queue!\n\n` +
        `Satellite: ${queueItem.satelliteId}\n` +
        `Payload: ${queueItem.payloadType}\n` +
        `Priority: ${queueItem.priority}\n` +
        `Score: ${queueItem.priorityScore}\n` +
        `Status: ${queueItem.status}`
      )

    } catch (err) {
      setError(err.message)
      window.alert(`Error: ${err.message}`)
    } finally {
      setAddingToQueueId(null)
    }
  }

  // DASHBOARD STATISTICS
  const activeSatellites = new Set(
    telemetry.map((item) => item.satelliteId)
  ).size

  const averageBattery = telemetry.length > 0
    ? (
        telemetry.reduce(
          (sum, item) => sum + Number(item.batteryLevel),
          0
        ) / telemetry.length
      ).toFixed(1)
    : '0.0'

  const averageLink = telemetry.length > 0
    ? (
        telemetry.reduce(
          (sum, item) => sum + Number(item.linkQuality),
          0
        ) / telemetry.length
      ).toFixed(1)
    : '0.0'

  // ANALYTICS DATA
  const satelliteData = telemetry.map((item) => ({
    id: item.id,
    name: item.satelliteId,
    battery: Number(item.batteryLevel),
    link: Number(item.linkQuality)
  }))

  const payloadData = [
    'IMAGE',
    'VIDEO',
    'SENSOR',
    'TEXT'
  ]
    .map((type) => ({
      name: type,
      value: telemetry.filter(
        (item) => item.payloadType === type
      ).length
    }))
    .filter((item) => item.value > 0)

  const titles = {
    overview: 'Satellite Operations Dashboard',
    telemetry: 'Telemetry Management',
    analytics: 'Reports & Analytics'
  }

  const descriptions = {
    overview:
      'Monitor satellite telemetry and operational performance.',
    telemetry:
      'Add, edit, delete and manage satellite telemetry records.',
    analytics:
      'Analyze battery levels, link quality and payload distribution.'
  }

  const stats = [
    {
      label: 'Total Telemetry Records',
      value: telemetry.length,
      icon: '📡',
      color: '#dbeafe'
    },
    {
      label: 'Active Satellites',
      value: activeSatellites,
      icon: '🛰️',
      color: '#e0e7ff'
    },
    {
      label: 'Average Battery Level',
      value: `${averageBattery}%`,
      icon: '🔋',
      color: '#dcfce7'
    },
    {
      label: 'Average Link Quality',
      value: `${averageLink}%`,
      icon: '📶',
      color: '#fef3c7'
    }
  ]

  const chartAxisStyle = {
    fill: 'var(--theme-muted)',
    fontSize: 11
  }

  return (
    <div
      className="dashboard satellite-dashboard"
      style={{
        width: '100%',
        maxWidth: 'none',
        margin: 0,
        padding: 0,
        background: 'transparent',
        color: 'var(--theme-text)'
      }}
    >

      {/* PAGE HEADER */}
      <header
        style={{
          marginBottom: 28,
          textAlign: 'left'
        }}
      >
        <p
          style={{
            ...mutedStyle,
            fontSize: 13,
            marginBottom: 12
          }}
        >
          SatelliteOps / {titles[view]}
        </p>

        <h1
          style={{
            ...headingStyle,
            fontSize: 28,
            margin: '0 0 8px'
          }}
        >
          {titles[view]}
        </h1>

        <p style={{ ...mutedStyle, margin: 0 }}>
          {descriptions[view]}
        </p>
      </header>

      {/* ERROR MESSAGE */}
      {error && (
        <div
          role="alert"
          style={{
            background: 'var(--theme-card)',
            color: 'var(--theme-danger)',
            border: '1px solid var(--theme-danger)',
            padding: 14,
            borderRadius: 8,
            marginBottom: 18
          }}
        >
          {error}
        </div>
      )}

      {/* DASHBOARD OVERVIEW */}
      {view === 'overview' && (
        <>
          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              marginBottom: 24
            }}
          >
            <button
              type="button"
              onClick={refreshTelemetry}
              disabled={loading}
              style={buttonStyle}
            >
              {loading ? 'Refreshing...' : 'Refresh Telemetry'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/telemetry')}
              style={buttonStyle}
            >
              Manage Telemetry
            </button>

            <button
              type="button"
              onClick={() => navigate('/queue')}
              style={buttonStyle}
            >
              View Transmission Queue
            </button>

            <button
              type="button"
              onClick={() => navigate('/history')}
              style={buttonStyle}
            >
              Decision History
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 18
            }}
          >
            {stats.map((stat) => (
              <div key={stat.label} style={cardStyle}>
                <div
                  style={{
                    background: stat.color,
                    borderRadius: 10,
                    width: 46,
                    height: 46,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    marginBottom: 18
                  }}
                >
                  {stat.icon}
                </div>

                <p
                  style={{
                    ...mutedStyle,
                    fontSize: 13,
                    marginBottom: 8
                  }}
                >
                  {stat.label}
                </p>

                <h2
                  style={{
                    ...headingStyle,
                    fontSize: 29,
                    margin: 0
                  }}
                >
                  {loading ? '...' : stat.value}
                </h2>
              </div>
            ))}
          </div>
        </>
      )}

      {/* TELEMETRY MANAGEMENT */}
      {view === 'telemetry' && (
        <>
          <section
            className="telemetry-section"
            style={{
              ...cardStyle,
              marginBottom: 24
            }}
          >
            <h2 style={headingStyle}>
              {editingId ? 'Edit Telemetry' : 'Add New Telemetry'}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="telemetry-form"
            >
              <div className="form-group">
                <label htmlFor="satelliteId">
                  Satellite ID
                </label>

                <input
                  id="satelliteId"
                  type="text"
                  name="satelliteId"
                  placeholder="e.g. SAT-003"
                  value={form.satelliteId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="batteryLevel">
                  Battery Level (%)
                </label>

                <input
                  id="batteryLevel"
                  type="number"
                  name="batteryLevel"
                  min="0"
                  max="100"
                  step="any"
                  placeholder="e.g. 75"
                  value={form.batteryLevel}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="linkQuality">
                  Link Quality (%)
                </label>

                <input
                  id="linkQuality"
                  type="number"
                  name="linkQuality"
                  min="0"
                  max="100"
                  step="any"
                  placeholder="e.g. 90"
                  value={form.linkQuality}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="payloadType">
                  Payload Type
                </label>

                <select
                  id="payloadType"
                  name="payloadType"
                  value={form.payloadType}
                  onChange={handleChange}
                >
                  <option value="IMAGE">IMAGE</option>
                  <option value="VIDEO">VIDEO</option>
                  <option value="SENSOR">SENSOR</option>
                  <option value="TEXT">TEXT</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={buttonStyle}
              >
                {submitting
                  ? 'Saving...'
                  : editingId
                    ? 'Update Telemetry'
                    : 'Add Telemetry'}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCancelEdit}
                  disabled={submitting}
                >
                  Cancel Edit
                </button>
              )}
            </form>

            {message && (
              <p
                role="status"
                style={{
                  color: 'var(--theme-success)'
                }}
              >
                {message}
              </p>
            )}
          </section>

          {/* TELEMETRY RECORDS */}
          <section
            className="telemetry-section"
            style={cardStyle}
          >
            <h2 style={headingStyle}>
              Telemetry Records
            </h2>

            {loading ? (
              <p>Loading telemetry data...</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Satellite ID</th>
                      <th>Battery (%)</th>
                      <th>Link Quality (%)</th>
                      <th>Payload Type</th>
                      <th>Timestamp</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {telemetry.map((t) => (
                      <tr key={t.id}>
                        <td>{t.satelliteId}</td>
                        <td>{t.batteryLevel}</td>
                        <td>{t.linkQuality}</td>
                        <td>{t.payloadType}</td>

                        <td>
                          {t.timestamp
                            ? new Date(
                                t.timestamp
                              ).toLocaleString()
                            : 'N/A'}
                        </td>

                        <td>
                          <div
                            style={{
                              display: 'flex',
                              gap: 7,
                              flexWrap: 'wrap'
                            }}
                          >
                            <button
                              type="button"
                              className="edit-button"
                              onClick={() => handleEdit(t)}
                              disabled={
                                submitting ||
                                deletingId !== null
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="delete-button"
                              onClick={() =>
                                handleDelete(t.id)
                              }
                              disabled={
                                submitting ||
                                deletingId !== null
                              }
                            >
                              {deletingId === t.id
                                ? 'Deleting...'
                                : 'Delete'}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                evaluatePriority(t)
                              }
                              disabled={
                                submitting ||
                                deletingId !== null
                              }
                              style={buttonStyle}
                            >
                              Evaluate Priority
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                addToQueue(t.id)
                              }
                              disabled={
                                submitting ||
                                deletingId !== null ||
                                addingToQueueId !== null
                              }
                              style={{
                                ...buttonStyle,
                                background: '#7c3aed'
                              }}
                            >
                              {addingToQueueId === t.id
                                ? 'Adding...'
                                : 'Add to Queue'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {telemetry.length === 0 && (
                      <tr>
                        <td colSpan="6">
                          No telemetry records available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {/* REPORTS AND ANALYTICS */}
      {view === 'analytics' && (
        <section
          className="telemetry-section"
          style={cardStyle}
        >
          <h2 style={headingStyle}>
            Satellite Telemetry Analytics
          </h2>

          <p style={mutedStyle}>
            Visual comparison of satellite battery levels,
            communication link quality and payload types.
          </p>

          {loading ? (
            <p>Loading analytics...</p>
          ) : telemetry.length === 0 ? (
            <p>
              Add telemetry records to display analytics.
            </p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
                gap: 20,
                marginTop: 20
              }}
            >

              {/* BATTERY CHART */}
              <div style={cardStyle}>
                <h3 style={headingStyle}>
                  Battery Level Comparison
                </h3>

                <p style={mutedStyle}>
                  Battery percentage by satellite
                </p>

                <div
                  style={{
                    width: '100%',
                    height: 300
                  }}
                >
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart data={satelliteData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--theme-border)"
                      />

                      <XAxis
                        dataKey="name"
                        tick={chartAxisStyle}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={55}
                      />

                      <YAxis
                        domain={[0, 100]}
                        unit="%"
                        tick={chartAxisStyle}
                      />

                      <Tooltip
                        contentStyle={tooltipStyle}
                        labelStyle={headingStyle}
                        itemStyle={headingStyle}
                      />

                      <Bar
                        dataKey="battery"
                        name="Battery (%)"
                        fill="#2563eb"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* LINK QUALITY CHART */}
              <div style={cardStyle}>
                <h3 style={headingStyle}>
                  Link Quality Comparison
                </h3>

                <p style={mutedStyle}>
                  Communication link strength by satellite
                </p>

                <div
                  style={{
                    width: '100%',
                    height: 300
                  }}
                >
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart data={satelliteData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--theme-border)"
                      />

                      <XAxis
                        dataKey="name"
                        tick={chartAxisStyle}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={55}
                      />

                      <YAxis
                        domain={[0, 100]}
                        unit="%"
                        tick={chartAxisStyle}
                      />

                      <Tooltip
                        contentStyle={tooltipStyle}
                        labelStyle={headingStyle}
                        itemStyle={headingStyle}
                      />

                      <Bar
                        dataKey="link"
                        name="Link Quality (%)"
                        fill="#0d9488"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* PAYLOAD DISTRIBUTION */}
              <div style={cardStyle}>
                <h3 style={headingStyle}>
                  Payload Distribution
                </h3>

                <p style={mutedStyle}>
                  Distribution of satellite data types
                </p>

                <div
                  style={{
                    width: '100%',
                    height: 300
                  }}
                >
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <PieChart>
                      <Pie
                        data={payloadData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        outerRadius={90}
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {payloadData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={
                              PAYLOAD_COLORS[entry.name]
                            }
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        contentStyle={tooltipStyle}
                        labelStyle={headingStyle}
                        itemStyle={headingStyle}
                      />

                      <Legend
                        wrapperStyle={{
                          color: 'var(--theme-text)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}
        </section>
      )}

    </div>
  )
}
