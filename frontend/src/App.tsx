import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Auth/Login"
import Register from "./pages/Auth/Register"
import RiderHome from "./pages/Rider/Home"
import RiderHistory from "./pages/Rider/History"
import RiderProfile from "./pages/Rider/Profile"
import DriverDashboard from "./pages/Driver/Dashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import { Toaster } from "react-hot-toast"

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute allowedRoles={['RIDER']} />}>
          <Route path="/rider" element={<RiderHome />} />
          <Route path="/rider/home" element={<RiderHome />} />
          <Route path="/rider/history" element={<RiderHistory />} />
          <Route path="/rider/profile" element={<RiderProfile />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['DRIVER']} />}>
          <Route path="/driver" element={<DriverDashboard />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
