
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo
} from 'react'

const AuthContext = createContext(null)

const API_URL = 'http://localhost:8080'

export function AuthProvider({ children }) {

  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)

  // Login with email and password
  const login = useCallback(async (email, password) => {

    const response = await fetch(
      `${API_URL}/api/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          password
        })
      }
    )

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid email or password.')
      }

      throw new Error('Login failed. Please try again.')
    }

    const data = await response.json()

    if (!data.token || data.tokenType !== 'Bearer') {
      throw new Error('Invalid authentication response.')
    }

    // Store JWT only in React memory
    setToken(data.token)
    setUser(data.user)

    return data.user

  }, [])

  // Clear the JWT when logging out
  const logout = useCallback(() => {
    setToken(null)
    setUser(null)

    // Remove temporary session flag from old implementation
    sessionStorage.removeItem('satellite-auth')
  }, [])

  // Helper for authenticated API requests
  const authFetch = useCallback(
    async (path, options = {}) => {

      if (!token) {
        throw new Error('Please log in first.')
      }

      const headers = new Headers(options.headers || {})

      headers.set(
        'Authorization',
        `Bearer ${token}`
      )

      const url = path.startsWith('http')
        ? path
        : `${API_URL}${path}`

      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'omit'
      })

      if (response.status === 401) {
        setToken(null)
        setUser(null)
        throw new Error(
          'Your session has expired. Please log in again.'
        )
      }

      return response
    },
    [token]
  )

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: Boolean(token),
    login,
    logout,
    authFetch
  }), [token, user, login, logout, authFetch])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Use authentication anywhere in SatelliteOps
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider.'
    )
  }

  return context
}
