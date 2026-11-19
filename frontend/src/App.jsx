
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation
} from 'react-router-dom'

import { AuthProvider, useAuth } from './context/AuthContext'

import Dashboard from './pages/Dashboard'
import PriorityEvaluation from './pages/PriorityEvaluation'
import DecisionHistory from './pages/DecisionHistory'
import TransmissionQueue from './pages/TransmissionQueue'

import Login from './pages/Login'
import Register from './pages/Register'
import SatelliteLayout from './components/SatelliteLayout'

// Protect dashboard routes using JWT authentication
function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  // No JWT available: redirect to login
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    )
  }

  // JWT exists: allow access to protected pages
  return <Outlet />
}

// Prevent logged-in users from returning to login/register
function PublicRoute() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

function AppRoutes() {
  return (
    <Routes>

      {/* Public Authentication Pages */}
      <Route element={<PublicRoute />}>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

      </Route>

      {/* Protected SatelliteOps Pages */}
      <Route element={<ProtectedRoute />}>

        {/* Existing Sidebar and Layout */}
        <Route element={<SatelliteLayout />}>

          {/* Dashboard Overview */}
          <Route
            path="/"
            element={<Dashboard view="overview" />}
          />

          {/* Satellite Telemetry */}
          <Route
            path="/telemetry"
            element={<Dashboard view="telemetry" />}
          />

          {/* Priority Evaluation */}
          <Route
            path="/priority"
            element={<PriorityEvaluation />}
          />

          {/* Decision History */}
          <Route
            path="/history"
            element={<DecisionHistory />}
          />

          {/* Transmission Queue */}
          <Route
            path="/queue"
            element={<TransmissionQueue />}
          />

          {/* Analytics Dashboard */}
          <Route
            path="/analytics"
            element={<Dashboard view="analytics" />}
          />

        </Route>

      </Route>

      {/* Unknown URLs */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
