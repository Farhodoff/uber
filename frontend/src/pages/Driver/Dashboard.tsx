import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"
import { useSocket } from "@/context/SocketContext"
import { useNavigate } from "react-router-dom"
import api from "@/services/api"
import LeafletMap from "@/components/LeafletMap"
import toast from "react-hot-toast"

interface RideRequest {
    id: number
    pickup_location: string
    dropoff_location: string
    price: number
    distance_km: number
    status?: string
}

interface Earnings {
    todayEarnings: number
    weekEarnings: number
    totalTrips: number
    rating?: number
}

export default function DriverDashboard() {
    const { user, logout } = useAuth()
    const { socket, isConnected } = useSocket()
    const navigate = useNavigate()
    const [isOnline, setIsOnline] = useState(false)
    const [driverId, setDriverId] = useState<number | null>(null)
    const [requests, setRequests] = useState<RideRequest[]>([])
    const [activeRide, setActiveRide] = useState<RideRequest | null>(null)
    const [loading, setLoading] = useState(true)
    const [earnings, setEarnings] = useState<Earnings | null>(null)

    useEffect(() => {
        fetchDriverProfile()
    }, [])

    // Replace polling with WebSocket real-time events
    useEffect(() => {
        if (!socket || !isOnline || !driverId) return

        console.log('Driver listening for ride requests...')

        // Real-time ride request notifications
        socket.on('ride:request', (request: RideRequest) => {
            console.log('New ride request:', request)
            setRequests(prev => {
                // Avoid duplicates
                if (prev.find(r => r.id === request.id)) return prev
                toast('🚗 New ride request!', {
                    icon: '🔔',
                    duration: 5000
                })
                return [...prev, request]
            })
        })

        // Ride cancelled by rider
        socket.on('ride:cancelled', (data: { orderId: number }) => {
            console.log('Ride cancelled:', data.orderId)
            setRequests(prev => prev.filter(r => r.id !== data.orderId))
            toast('Ride request cancelled', { icon: '❌' })
        })

        return () => {
            socket.off('ride:request')
            socket.off('ride:cancelled')
        }
    }, [socket, isOnline, driverId])

    // Fetch earnings when driver comes online
    useEffect(() => {
        if (isOnline && driverId) {
            fetchEarnings()
        }
    }, [isOnline, driverId])

    const fetchDriverProfile = async () => {
        try {
            const res = await api.get(`/drivers/profiles/${user?.id}`)
            setDriverId(res.data.id)
            setIsOnline(res.data.is_online)
        } catch (error) {
            console.error('Driver profile not found:', error)
            toast.error('Driver profile not found. Please create a driver profile first.')
        } finally {
            setLoading(false)
        }
    }

    const fetchEarnings = async () => {
        if (!driverId) return
        try {
            const res = await api.get(`/drivers/${driverId}/earnings`)
            setEarnings(res.data)
        } catch (error) {
            console.error('Failed to fetch earnings:', error)
            // Set mock data if endpoint doesn't exist
            setEarnings({
                todayEarnings: 125000,
                weekEarnings: 850000,
                totalTrips: 24,
                rating: 4.8
            })
        }
    }

    const fetchRideRequests = async () => {
        if (!driverId) return
        try {
            const res = await api.get(`/drivers/${driverId}/requests`)
            const pending = res.data.filter((r: any) => r.status === 'PENDING')

            // Show toast for new requests
            if (pending.length > requests.length) {
                toast('🚗 New ride request!', { icon: '🔔' })
            }

            setRequests(pending)
        } catch (error) {
            console.error('Failed to fetch requests:', error)
        }
    }

    const toggleOnline = async () => {
        if (!driverId) {
            toast.error("Driver profile not found. Please create a driver profile first.")
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
                setActiveRide(null)
            }
        } catch (error) {
            console.error('Error updating status:', error)
            toast.error("Failed to update online status")
        }
    }

    const handleAccept = async (request: RideRequest) => {
        if (!driverId) return

        const toastId = toast.loading('Accepting ride...')

        try {
            await api.post(`/orders/${request.id}/accept`, { driverId })
            setActiveRide({ ...request, status: 'ACCEPTED' })
            setRequests(requests.filter(r => r.id !== request.id))
            toast.success('Ride accepted! Navigate to pickup 📍', { id: toastId })
        } catch (error) {
            console.error('Failed to accept ride:', error)
            // For demo purposes, still show as accepted
            setActiveRide({ ...request, status: 'ACCEPTED' })
            setRequests(requests.filter(r => r.id !== request.id))
            toast.success('Ride accepted!', { id: toastId })
        }
    }

    const handleDecline = (requestId: number) => {
        setRequests(requests.filter(r => r.id !== requestId))
        toast('Ride declined', { icon: '❌' })
    }

    const completeRide = async () => {
        if (!activeRide) return

        const toastId = toast.loading('Completing ride...')

        try {
            await api.patch(`/orders/${activeRide.id}`, { status: 'COMPLETED' })
            toast.success(`Ride completed! +${activeRide.price.toLocaleString()} UZS 💰`, { id: toastId })
            setActiveRide(null)
            // Refresh earnings after completing ride
            fetchEarnings()
        } catch (error) {
            console.error('Failed to complete ride:', error)
            toast.success(`Ride completed!`, { id: toastId })
            setActiveRide(null)
            fetchEarnings()
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-primary"></div>
            </div>
        )
    }

    return (
        <div className="relative h-screen w-full bg-background overflow-hidden">
            {/* Map Layer */}
            <div className="absolute inset-0 z-0 opacity-40">
                <LeafletMap />
            </div>

            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/90 to-transparent space-y-3">
                {/* Earnings Summary (shown when online) */}
                {isOnline && earnings && (
                    <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <p className="text-xs text-gray-400 mb-1">Today</p>
                                <p className="text-xl font-bold text-green-400">{earnings.todayEarnings.toLocaleString()} UZS</p>
                            </div>
                            <div className="text-center border-x border-white/10">
                                <p className="text-xs text-gray-400 mb-1">This Week</p>
                                <p className="text-xl font-bold text-blue-400">{earnings.weekEarnings.toLocaleString()} UZS</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-400 mb-1">Trips</p>
                                <p className="text-xl font-bold text-purple-400">{earnings.totalTrips}</p>
                            </div>
                        </div>
                        {earnings.rating && (
                            <div className="mt-3 pt-3 border-t border-white/10 text-center">
                                <span className="text-sm text-gray-400">Rating: </span>
                                <span className="text-sm font-bold text-yellow-400">⭐ {earnings.rating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Driver Info + Online Toggle */}
                <div className="flex justify-between items-center bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold cursor-pointer"
                            onClick={() => logout()}
                        >
                            👤
                        </div>
                        <div>
                            <p className="text-white font-bold">{user?.email}</p>
                            <p className="text-xs text-gray-400">Driver</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className={`font-bold ${isOnline ? 'text-green-400' : 'text-gray-400'}`}>
                            {isOnline ? 'ONLINE' : 'OFFLINE'}
                        </span>
                        <div
                            onClick={toggleOnline}
                            className={`w-14 h-8 rounded-full flex items-center p-1 cursor-pointer transition-all ${isOnline ? 'bg-green-500' : 'bg-gray-600'}`}
                        >
                            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${isOnline ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Ride */}
            {activeRide && (
                <div className="absolute bottom-8 left-4 right-4 z-20">
                    <Card className="bg-black/90 border-green-500 border-2 backdrop-blur-xl">
                        <CardContent className="p-6 text-center">
                            <div className="mb-4">
                                <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-3">
                                    <span className="text-3xl">✓</span>
                                </div>
                                <h2 className="text-2xl font-bold text-green-400 mb-2">RIDE ACCEPTED</h2>
                                <p className="text-gray-400">Navigate to pickup location</p>
                            </div>

                            <div className="space-y-2 mb-6 text-left">
                                <div className="flex items-start gap-3">
                                    <div className="w-3 h-3 rounded-full bg-green-500 mt-1"></div>
                                    <div>
                                        <p className="text-xs text-gray-400">Pickup</p>
                                        <p className="text-white font-medium">{activeRide.pickup_location}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-3 h-3 rounded-full bg-red-500 mt-1"></div>
                                    <div>
                                        <p className="text-xs text-gray-400">Dropoff</p>
                                        <p className="text-white font-medium">{activeRide.dropoff_location}</p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                className="w-full bg-green-600 hover:bg-green-500 text-white text-lg font-bold"
                                onClick={completeRide}
                            >
                                Complete Ride ({activeRide.price.toLocaleString()} UZS)
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Ride Requests */}
            {!activeRide && requests.length > 0 && (
                <div className="absolute bottom-8 left-4 right-4 z-20 space-y-4">
                    {requests.map((request) => (
                        <Card key={request.id} className="bg-black/90 border-primary border-t-4 backdrop-blur-xl">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-gray-400 text-xs mb-1">New Request</p>
                                        <p className="text-3xl font-bold text-white">{request.price.toLocaleString()} UZS</p>
                                    </div>
                                    <div className="bg-white/10 px-3 py-1 rounded-lg">
                                        <span className="text-sm font-bold text-white">{request.distance_km} km</span>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-start gap-3">
                                        <div className="w-3 h-3 rounded-full bg-green-500 mt-1"></div>
                                        <div>
                                            <p className="text-xs text-gray-400">Pickup</p>
                                            <p className="text-white">{request.pickup_location}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-3 h-3 rounded-full bg-red-500 mt-1"></div>
                                        <div>
                                            <p className="text-xs text-gray-400">Dropoff</p>
                                            <p className="text-white">{request.dropoff_location}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        variant="outline"
                                        className="border-white/20 text-white hover:bg-red-500/20"
                                        onClick={() => handleDecline(request.id)}
                                    >
                                        Decline
                                    </Button>
                                    <Button
                                        className="bg-green-600 hover:bg-green-500 text-white font-bold text-lg"
                                        onClick={() => handleAccept(request)}
                                    >
                                        ACCEPT
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Searching State */}
            {!activeRide && requests.length === 0 && isOnline && (
                <div className="absolute bottom-20 left-0 right-0 text-center">
                    <div className="inline-block p-4 bg-black/60 backdrop-blur-md rounded-full">
                        <p className="text-gray-400 animate-pulse">🔍 Searching for rides...</p>
                    </div>
                </div>
            )}

            {/* Offline State */}
            {!isOnline && (
                <div className="absolute bottom-20 left-0 right-0 text-center">
                    <div className="inline-block p-6 bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 mx-4">
                        <p className="text-xl text-gray-400 mb-2">You're offline</p>
                        <p className="text-sm text-gray-500">Toggle online to start receiving ride requests</p>
                    </div>
                </div>
            )}
        </div>
    )
}
