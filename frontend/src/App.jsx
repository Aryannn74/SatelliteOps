
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'

import Dashboard from './pages/Dashboard'
import PriorityEvaluation from './pages/PriorityEvaluation'
import DecisionHistory from './pages/DecisionHistory'
import TransmissionQueue from './pages/TransmissionQueue'

import SatelliteLayout from './components/SatelliteLayout'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Main layout with Navy Blue sidebar */}
        <Route element={<SatelliteLayout />}>

          {/* Dashboard overview only */}
          <Route
            path="/"
            element={<Dashboard view="overview" />}
          />

          {/* Telemetry Management */}
          <Route
            path="/telemetry"
            element={<Dashboard view="telemetry" />}
          />

          {/* Intelligent Prioritization */}
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

          {/* Reports and Analytics */}
          <Route
            path="/analytics"
            element={<Dashboard view="analytics" />}
          />

        </Route>

        {/* Redirect unknown URLs to Dashboard */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App
