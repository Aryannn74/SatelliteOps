
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  // JWT authentication from AuthContext
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()

    if (loading) return

    setError('')
    setLoading(true)

    try {
      // Authenticate with Spring Boot and receive JWT
      await login(email, password)

      // Return to the page the user originally requested
      const from = location.state?.from
      const destination = from
        ? `${from.pathname}${from.search || ''}${from.hash || ''}`
        : '/'

      navigate(destination, { replace: true })

    } catch (err) {
      setError(
        err instanceof TypeError
          ? 'Cannot connect to the backend. Check that Spring Boot is running.'
          : err.message || 'Login failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">

        {/* SatelliteOps Branding */}
        <div className="login-brand">
          <div className="login-logo">🛰️</div>

          <h1>SatelliteOps</h1>

          <p>
            Satellite Telemetry and
            Data-Priority Dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="login-card">
          <h2>Welcome Back</h2>

          <p className="login-subtitle">
            Sign in to access your satellite dashboard
          </p>

          <form onSubmit={handleLogin}>

            {/* Email */}
            <div className="login-field">
              <label htmlFor="login-email">
                Email Address
              </label>

              <input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="login-field">
              <label htmlFor="login-password">
                Password
              </label>

              <div className="password-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                  disabled={loading}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Login Error */}
            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

          </form>

          {/* Registration Link */}
          <p style={{
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '14px'
          }}>
            Don't have an account?{' '}
            <Link to="/register">
              Create Account
            </Link>
          </p>

        </div>

        {/* Footer */}
        <p className="login-footer">
          SatelliteOps © 2026
        </p>

      </div>
    </div>
  )
}

export default Login
