
import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
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
