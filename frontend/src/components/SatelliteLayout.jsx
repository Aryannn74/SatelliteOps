
import { useEffect, useState } from 'react'
import {
  Link,
  Outlet,
  useLocation,
  useNavigate
} from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './SatelliteLayout.css'

const menuGroups = [
  {
    title: 'CORE MANAGEMENT',
    links: [
      {
        label: 'Dashboard',
        path: '/',
        icon: '▦'
      },
      {
        label: 'Telemetry Management',
        path: '/telemetry',
        icon: '◉'
      }
    ]
  },
  {
    title: 'INTELLIGENT PRIORITIZATION',
    links: [
      {
        label: 'Priority Evaluation',
        path: '/priority',
        icon: '◈'
      },
      {
        label: 'Decision History',
        path: '/history',
        icon: '◷'
      }
    ]
  },
  {
    title: 'TRANSMISSION OPERATIONS',
    links: [
      {
        label: 'Transmission Queue',
        path: '/queue',
        icon: '☷'
      },
      {
        label: 'Transmission History',
        path: '/queue?section=history',
        icon: '↺'
      }
    ]
  },
  {
    title: 'ANALYTICS & SYSTEM',
    links: [
      {
        label: 'Reports & Analytics',
        path: '/analytics',
        icon: '▥'
      }
    ]
  }
]

export default function SatelliteLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  // JWT authentication
  const { user, logout } = useAuth()

  // Light / Dark theme
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('satellite-theme')
    return savedTheme === 'dark' ? 'dark' : 'light'
  })

  // Apply theme and remember preference
  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      theme
    )

    localStorage.setItem('satellite-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((current) =>
      current === 'light' ? 'dark' : 'light'
    )
  }

  // JWT LOGOUT
  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  // Custom active link detection
  const currentSection = new URLSearchParams(
    location.search
  ).get('section')

  const isActiveLink = (path) => {
    if (path === '/queue') {
      return (
        location.pathname === '/queue' &&
        currentSection !== 'history'
      )
    }

    if (path === '/queue?section=history') {
      return (
        location.pathname === '/queue' &&
        currentSection === 'history'
      )
    }

    return location.pathname === path
  }

  return (
    <div className="satellite-layout">

      {/* NAVY BLUE SIDEBAR */}
      <aside className="satellite-sidebar">

        {/* PROJECT BRANDING */}
        <div className="satellite-brand">
          <div className="satellite-logo">
            🛰️
          </div>

          <div className="satellite-brand-text">
            <h2>SatelliteOps</h2>
            <p>Telemetry & Priority Dashboard</p>
          </div>
        </div>

        {/* SIDEBAR NAVIGATION */}
        {menuGroups.map((group) => (
          <div
            className="satellite-menu-group"
            key={group.title}
          >
            <div className="satellite-menu-heading">
              {group.title}
            </div>

            <nav className="satellite-nav">
              {group.links.map((link) => {
                const active = isActiveLink(link.path)

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={
                      active
                        ? 'satellite-link active'
                        : 'satellite-link'
                    }
                    aria-current={
                      active ? 'page' : undefined
                    }
                  >
                    <span className="satellite-menu-icon">
                      {link.icon}
                    </span>

                    <span className="satellite-menu-label">
                      {link.label}
                    </span>
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}

        {/* LIGHT / DARK MODE SWITCH */}
        <div className="satellite-theme-section">
          <p className="satellite-theme-heading">
            APPEARANCE
          </p>

          <button
            type="button"
            className="satellite-theme-toggle"
            onClick={toggleTheme}
            aria-label={
              theme === 'light'
                ? 'Switch to dark mode'
                : 'Switch to light mode'
            }
          >
            <span>
              {theme === 'light' ? '🌙' : '☀️'}
            </span>

            <span>
              {theme === 'light'
                ? 'Switch to Dark Mode'
                : 'Switch to Light Mode'}
            </span>
          </button>
        </div>

        {/* USER ACCOUNT AND LOGOUT */}
        <div
          style={{
            padding: '18px',
            borderTop: '1px solid rgba(255,255,255,0.15)'
          }}
        >
          <p
            style={{
              color: '#94a3b8',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1px',
              marginBottom: '12px'
            }}
          >
            USER ACCOUNT
          </p>

          {user && (
            <div
              style={{
                marginBottom: '14px',
                overflowWrap: 'anywhere'
              }}
            >
              <p
                style={{
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  margin: '0 0 4px'
                }}
              >
                {user.name || user.email || 'User'}
              </p>

              {user.name && user.email && (
                <p
                  style={{
                    color: '#94a3b8',
                    fontSize: '12px',
                    margin: 0
                  }}
                >
                  {user.email}
                </p>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '11px 14px',
              background: 'rgba(220,38,38,0.12)',
              color: '#fca5a5',
              border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <span>↪</span>
            <span>Logout</span>
          </button>
        </div>

        {/* SIDEBAR FOOTER */}
        <div className="satellite-sidebar-footer">
          <p>SatelliteOps</p>
          <span>Telemetry Monitoring System</span>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="satellite-content">
        <Outlet />
      </main>

    </div>
  )
}
