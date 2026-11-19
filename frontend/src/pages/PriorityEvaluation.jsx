
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../App.css'

const PRIORITY_URL = 'http://localhost:8080/api/priority'

// Theme-aware styling
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
    marginBottom: '22px',
    boxShadow: 'var(--theme-shadow)'
  },

  sectionTitle: {
    color: 'var(--theme-text)',
    fontSize: '20px',
    margin: '0 0 14px'
  },

  button: {
    background: 'var(--theme-primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
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

  infoGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginTop: '20px'
  },

  infoCard: {
    background: 'var(--theme-bg)',
    border: '1px solid var(--theme-border)',
    borderRadius: '10px',
    padding: '18px'
  },

  label: {
    color: 'var(--theme-muted)',
    fontSize: '13px',
    margin: '0 0 10px'
  },

  value: {
    color: 'var(--theme-text)',
    fontSize: '23px',
    fontWeight: 700,
    margin: 0,
    overflowWrap: 'anywhere'
  },

  explanationCard: {
    marginTop: '26px',
    padding: '22px',
    background: 'var(--theme-bg)',
    border: '1px solid var(--theme-border)',
    borderRadius: '10px'
  },

  explanationText: {
    color: 'var(--theme-muted)',
    lineHeight: 1.8
  }
}

function PriorityEvaluation() {
  const navigate = useNavigate()
  const location = useLocation()

  // JWT authentication
  const { authFetch } = useAuth()

  const satellite = location.state?.satellite

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Evaluate priority using authenticated Spring Boot API
  const evaluatePriority = async () => {
    if (!satellite || loading || result) return

    setLoading(true)
    setError('')

    try {
      const response = await authFetch(
        `${PRIORITY_URL}/evaluate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            satelliteId: satellite.satelliteId,
            batteryLevel: satellite.batteryLevel,
            linkQuality: satellite.linkQuality,
            payloadType: satellite.payloadType
          })
        }
      )

      if (!response.ok) {
        throw new Error('Priority evaluation failed')
      }

      const data = await response.json()
      setResult(data)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Priority classification colors
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

  return (
    <div style={styles.page}>

      {/* PAGE HEADER */}
      <header style={styles.header}>
        <p style={styles.breadcrumb}>
          SatelliteOps / Intelligent Prioritization /
          Priority Evaluation
        </p>

        <h1 style={styles.title}>
          Intelligent Priority Evaluation
        </h1>

        <p style={styles.subtitle}>
          Evaluate satellite telemetry and recommend
          transmission priority using an intelligent
          rule-based decision system.
        </p>
      </header>

      {/* BACK BUTTON */}
      <button
        type="button"
        onClick={() => navigate('/telemetry')}
        style={{
          ...styles.secondaryButton,
          marginBottom: '24px'
        }}
      >
        ← Back to Telemetry Management
      </button>

      {/* EVALUATION INTRODUCTION */}
      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>
          Priority Evaluation System
        </h2>

        <p style={styles.subtitle}>
          The SatelliteOps intelligent rule-based
          algorithm evaluates satellite telemetry
          using battery level, communication link
          quality, and payload type.
        </p>

        <p style={styles.subtitle}>
          Based on these parameters, the system
          calculates a priority score and assigns
          a transmission priority classification.
          The evaluated decision is saved to
          MongoDB for future review.
        </p>
      </section>

      {/* NO SATELLITE SELECTED */}
      {!satellite && (
        <section style={styles.card}>
          <div
            style={{
              background: 'var(--theme-bg)',
              border: '1px solid var(--theme-border)',
              padding: '20px',
              borderRadius: '10px',
              color: 'var(--theme-text)'
            }}
          >
            <h3
              style={{
                marginTop: 0,
                color: 'var(--theme-text)'
              }}
            >
              No Satellite Selected
            </h3>

            <p style={styles.subtitle}>
              Please select a satellite from
              Telemetry Management to run
              priority evaluation.
            </p>

            <button
              type="button"
              onClick={() => navigate('/telemetry')}
              style={styles.button}
            >
              Go to Telemetry Management
            </button>
          </div>
        </section>
      )}

      {/* SELECTED SATELLITE */}
      {satellite && (
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>
            Selected Satellite Telemetry
          </h2>

          <p style={styles.subtitle}>
            Review the satellite information before
            running the priority evaluation.
          </p>

          <div style={styles.infoGrid}>

            <div style={styles.infoCard}>
              <p style={styles.label}>
                Satellite ID
              </p>

              <p style={styles.value}>
                {satellite.satelliteId}
              </p>
            </div>

            <div style={styles.infoCard}>
              <p style={styles.label}>
                Battery Level
              </p>

              <p style={styles.value}>
                {satellite.batteryLevel}%
              </p>
            </div>

            <div style={styles.infoCard}>
              <p style={styles.label}>
                Link Quality
              </p>

              <p style={styles.value}>
                {satellite.linkQuality}%
              </p>
            </div>

            <div style={styles.infoCard}>
              <p style={styles.label}>
                Payload Type
              </p>

              <p style={styles.value}>
                {satellite.payloadType}
              </p>
            </div>

          </div>

          {/* RUN EVALUATION */}
          {!result && (
            <div style={{ marginTop: '25px' }}>
              <button
                type="button"
                onClick={evaluatePriority}
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
                  ? 'Evaluating Priority...'
                  : 'Run Intelligent Evaluation'}
              </button>
            </div>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <div
              role="alert"
              style={{
                marginTop: '20px',
                background: 'var(--theme-bg)',
                color: 'var(--theme-danger)',
                border: '1px solid var(--theme-danger)',
                padding: '15px',
                borderRadius: '8px'
              }}
            >
              {error}
            </div>
          )}
        </section>
      )}

      {/* EVALUATION RESULTS */}
      {result && (
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>
            Evaluation Results
          </h2>

          <p style={styles.subtitle}>
            The intelligent priority evaluation
            has been completed successfully.
          </p>

          {/* RESULT CARDS */}
          <div style={styles.infoGrid}>

            {/* PRIORITY CLASSIFICATION */}
            <div style={styles.infoCard}>
              <p style={styles.label}>
                Priority Classification
              </p>

              <span
                style={{
                  display: 'inline-block',
                  background:
                    getPriorityBackground(result.priority),
                  color:
                    getPriorityColor(result.priority),
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontSize: '19px',
                  fontWeight: 700
                }}
              >
                {result.priority}
              </span>
            </div>

            {/* PRIORITY SCORE */}
            <div style={styles.infoCard}>
              <p style={styles.label}>
                Priority Score
              </p>

              <p style={styles.value}>
                {result.score} / 100
              </p>
            </div>

            {/* BATTERY LEVEL */}
            <div style={styles.infoCard}>
              <p style={styles.label}>
                Battery Level
              </p>

              <p style={styles.value}>
                {result.batteryLevel}%
              </p>
            </div>

            {/* LINK QUALITY */}
            <div style={styles.infoCard}>
              <p style={styles.label}>
                Link Quality
              </p>

              <p style={styles.value}>
                {result.linkQuality}%
              </p>
            </div>

          </div>

          {/* PRIORITY SCORE BAR */}
          <div style={{ marginTop: '26px' }}>
            <h3
              style={{
                color: 'var(--theme-text)',
                fontSize: '17px'
              }}
            >
              Priority Score Visualization
            </h3>

            <div
              style={{
                width: '100%',
                height: '14px',
                background: 'var(--theme-border)',
                borderRadius: '20px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${
                    Math.min(
                      100,
                      Math.max(
                        0,
                        Number(result.score) || 0
                      )
                    )
                  }%`,
                  height: '100%',
                  background:
                    getPriorityColor(result.priority),
                  borderRadius: '20px'
                }}
              />
            </div>

            <p
              style={{
                color: 'var(--theme-muted)',
                fontSize: '12px',
                marginTop: '8px'
              }}
            >
              Evaluated priority score: {result.score} / 100
            </p>
          </div>

          {/* INTELLIGENT DECISION EXPLANATION */}
          <div style={styles.explanationCard}>
            <h3
              style={{
                color: 'var(--theme-text)',
                marginTop: 0
              }}
            >
              Intelligent Decision Explanation
            </h3>

            <p style={styles.explanationText}>
              {result.explanation}
            </p>

            <h3 style={{ color: 'var(--theme-text)' }}>
              Payload Type
            </h3>

            <p style={styles.explanationText}>
              {result.payloadType}
            </p>

            <h3 style={{ color: 'var(--theme-text)' }}>
              Evaluation Timestamp
            </h3>

            <p style={styles.explanationText}>
              {result.createdAt
                ? new Date(
                    result.createdAt
                  ).toLocaleString()
                : 'N/A'}
            </p>
          </div>

          {/* SUCCESS MESSAGE */}
          <div
            role="status"
            style={{
              background: 'var(--theme-bg)',
              border: '1px solid var(--theme-border)',
              borderRadius: '10px',
              padding: '15px',
              marginTop: '22px',
              color: 'var(--theme-success)',
              fontWeight: 600
            }}
          >
            ✓ Evaluation completed and saved to MongoDB.
          </div>

          {/* DECISION HISTORY BUTTON */}
          <button
            type="button"
            onClick={() => navigate('/history')}
            style={{
              ...styles.button,
              marginTop: '20px'
            }}
          >
            View Decision History
          </button>
        </section>
      )}
    </div>
  )
}

export default PriorityEvaluation
