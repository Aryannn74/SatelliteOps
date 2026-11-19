
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Login.css'

const API_URL = 'http://localhost:8080'

function Register() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()

    if (loading) return

    setError('')

    // Validate name
    if (!name.trim()) {
      setError('Please enter your full name.')
      return
    }

    // Validate password length
    if (password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    // Confirm passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      // Register user through Spring Boot
      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'omit',
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password
          })
        }
      )

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error(
            'This email is already registered.'
          )
        }

        if (response.status === 400) {
          throw new Error(
            'Invalid registration details. Please check your inputs.'
          )
        }

        throw new Error(
          'Registration failed. Please try again.'
        )
      }

      // Registration successful
      // User must log in to receive a JWT
      navigate('/login', {
        replace: true,
        state: {
          message: 'Account created successfully. Please sign in.'
        }
      })

    } catch (err) {
      setError(
        err instanceof TypeError
          ? 'Cannot connect to the backend server.'
          : err.message || 'Registration failed.'
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

        {/* Registration Card */}
        <div className="login-card">
          <h2>Create Account</h2>

          <p className="login-subtitle">
            Register to access SatelliteOps
          </p>

          <form onSubmit={handleRegister}>

            {/* Full Name */}
            <div className="login-field">
              <label htmlFor="register-name">
                Full Name
              </label>

              <input
                id="register-name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
                disabled={loading}
              />
            </div>

            {/* Email Address */}
            <div className="login-field">
              <label htmlFor="register-email">
                Email Address
              </label>

              <input
                id="register-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="login-field">
              <label htmlFor="register-password">
                Password
              </label>

              <div className="password-wrapper">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                  disabled={loading}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="login-field">
              <label htmlFor="register-confirm">
                Confirm Password
              </label>

              <input
                id="register-confirm"
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="login-error"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading
                ? 'Creating Account...'
                : 'Create Account'}
            </button>

          </form>

          {/* Login Link */}
          <p style={{
            textAlign: 'center',
            marginTop: '22px',
            color: '#64748b',
            fontSize: '14px'
          }}>
            Already have an account?{' '}

            <Link
              to="/login"
              style={{
                color: '#2563eb',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Sign In
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

export default Register
