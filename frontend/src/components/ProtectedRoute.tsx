import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

interface ProtectedRouteProps {
    allowedRoles?: string[]
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const { user, token, isLoading } = useAuth()

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>
    }

    if (!token || !user) {
        return <Navigate to="/login" replace />
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect based on actual role
        if (user.role === 'DRIVER') return <Navigate to="/driver" replace />
        if (user.role === 'RIDER') return <Navigate to="/rider" replace />
        return <Navigate to="/" replace />
    }

    return <Outlet />
}

export default ProtectedRoute
