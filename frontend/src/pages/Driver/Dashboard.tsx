import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useSocket } from "@/context/SocketContext"
import { useNavigate } from "react-router-dom"
import api from "@/services/api"
import toast from "react-hot-toast"
import { DollarSign, Clock, MapPin, User } from "lucide-react"

interface RideRequest {
    id: number
    pickup_location: string
    dropoff_location: string
    price: number
    distance_km: number
    status?: string
}

export default function DriverDashboard() {
    const { user, logout } = useAuth()
    const { socket } = useSocket()
    const navigate = useNavigate()
    const [isOnline, setIsOnline] = useState(false)
    const [driverId, setDriverId] = useState<number | null>(null)
    const [requests, setRequests] = useState<RideRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        todayEarnings: 245.50,
        tripsToday: 12,
        hoursOnline: 6.5
    })

    useEffect(() => {
        fetchDriverProfile()
    }, [])

    // WebSocket real-time ride requests
    useEffect(() => {
        if (!socket || !isOnline || !driverId) return

        socket.on('ride:request', (request: RideRequest) => {
            console.log('New ride request:', request)
            setRequests(prev => {
                if (prev.find(r => r.id === request.id)) return prev
                toast('🚗 New ride request!', { icon: '🔔', duration: 5000 })
                return [...prev, request]
            })
        })

        socket.on('ride:cancelled', (data: { orderId: number }) => {
            setRequests(prev => prev.filter(r => r.id !== data.orderId))
            toast('Ride cancelled', { icon: '❌' })
        })

        return () => {
            socket.off('ride:request')
            socket.off('ride:cancelled')
        }
    }, [socket, isOnline, driverId])

    const fetchDriverProfile = async () => {
        try {
            const res = await api.get(`/drivers/profiles/${user?.id}`)
            setDriverId(res.data.id)
            setIsOnline(res.data.is_online)
        } catch (error) {
            console.error('Driver profile not found:', error)
            toast.error('Driver profile not found')
        } finally {
            setLoading(false)
        }
    }

    const toggleOnline = async () => {
        if (!driverId) {
            toast.error("Driver profile not found")
            return
        }
        try {
            const newStatus = !isOnline
            await api.patch(`/drivers/status/${driverId}`, {
                isOnline: newStatus,
                lat: 41.2995,
                lon: 69.2401
            })
            setIsOnline(newStatus)

            if (newStatus) {
                toast.success('You are now online! 🟢')
            } else {
                toast('You are now offline', { icon: '⚫' })
                setRequests([])
            }
        } catch (error) {
            console.error('Failed to toggle online status:', error)
            toast.error('Failed to update status')
        }
    }

    const acceptRide = async (orderId: number) => {
        if (!driverId) return
        const toastId = toast.loading('Accepting ride...')

        try {
            await api.patch(`/orders/${orderId}/accept`, { driverId })
            setRequests(prev => prev.filter(r => r.id !== orderId))
            toast.success('Ride accepted! 🚗', { id: toastId })
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to accept ride', { id: toastId })
        }
    }

    const declineRide = async (orderId: number) => {
        setRequests(prev => prev.filter(r => r.id !== orderId))
        toast('Ride declined', { icon: 'ℹ️' })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-black"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <h1 className="text-xl font-bold">Uber Driver</h1>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">${stats.todayEarnings}</p>
                            <p className="text-xs text-gray-500">Today's earnings</p>
                        </div>
                        <button
                            onClick={toggleOnline}
                            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${isOnline ? 'bg-green-600' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isOnline ? 'translate-x-9' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className="text-lg font-medium text-gray-900">
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                    </div>
                    <button
                        onClick={logout}
                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        Logout
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white border border-gray-200 rounded-2xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <p className="text-sm text-gray-600">Trips Today</p>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stats.tripsToday}</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <Clock className="w-5 h-5 text-purple-600" />
                            </div>
                            <p className="text-sm text-gray-600">Hours Online</p>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{stats.hoursOnline}</p>
                    </div>
                </div>

                {/* Active Rides Section */}
                <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Active Rides</h2>

                    {!isOnline && (
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MapPin className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">You're offline</h3>
                            <p className="text-gray-600 mb-4">Go online to start receiving ride requests</p>
                            <button
                                onClick={toggleOnline}
                                className="bg-black text-white font-medium px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors"
                            >
                                Go Online
                            </button>
                        </div>
                    )}

                    {isOnline && requests.length === 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                            <p className="text-green-800 font-medium">🟢 Waiting for ride requests...</p>
                            <p className="text-green-600 text-sm mt-1">You'll be notified when a new request comes in</p>
                        </div>
                    )}

                    {isOnline && requests.length > 0 && (
                        <div className="space-y-4">
                            {requests.map((request) => (
                                <div key={request.id} className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                                <User className="w-6 h-6 text-gray-700" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Passenger</p>
                                                <p className="text-sm text-gray-500">{request.distance_km} km away</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-gray-900">${request.price.toFixed(2)}</p>
                                            <p className="text-xs text-gray-500">Estimated fare</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1.5 w-2 h-2 rounded-full bg-green-500"></div>
                                            <div>
                                                <p className="text-xs text-gray-500">Pickup</p>
                                                <p className="text-sm text-gray-900 font-medium">{request.pickup_location}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1.5 w-2 h-2 rounded-full bg-red-500"></div>
                                            <div>
                                                <p className="text-xs text-gray-500">Dropoff</p>
                                                <p className="text-sm text-gray-900 font-medium">{request.dropoff_location}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => acceptRide(request.id)}
                                            className="flex-1 bg-green-600 text-white font-medium py-3 rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => declineRide(request.id)}
                                            className="flex-1 border-2 border-gray-300 text-gray-900 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
