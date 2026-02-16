import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useSocket } from "@/context/SocketContext"
import { useNavigate } from "react-router-dom"
import api from "@/services/api"
import toast from "react-hot-toast"
import { DollarSign, Clock, MapPin, User, Menu, TrendingUp, Navigation, Power, Radar, ShieldCheck } from "lucide-react"
import LeafletMap from "@/components/LeafletMap"

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
            // toast.error('Driver profile not found')
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin text-4xl">🚖</div>
            </div>
        )
    }

    return (
        <div className="relative h-screen w-full bg-gray-100 overflow-hidden font-sans">
            {/* Map Background with Dark Overlay for contrast */}
            <div className="absolute inset-0 z-0">
                <LeafletMap />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/5 pointer-events-none" />
            </div>

            {/* Top Bar Floating (Glassmorphism Upgrade) */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4">
                <div className="glass backdrop-blur-xl rounded-[2rem] p-2 pr-2 text-gray-800 shadow-2xl flex justify-between items-center animate-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center gap-4 pl-2">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-primary">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Today</p>
                            <p className="text-2xl font-black tracking-tight text-gray-900">${stats.todayEarnings}</p>
                        </div>
                    </div>

                    <button
                        onClick={toggleOnline}
                        className={`px-6 py-3 rounded-[1.5rem] font-bold text-sm transition-all duration-300 shadow-lg flex items-center gap-2 ${isOnline
                            ? 'bg-green-500 text-white hover:bg-green-400 shadow-green-500/30'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                            }`}
                    >
                        <Power className="w-4 h-4" />
                        {isOnline ? 'ONLINE' : 'GO ONLINE'}
                    </button>
                </div>

                {/* Secondary stats floating below */}
                {isOnline && (
                    <div className="flex gap-3 mt-3 animate-in fade-in slide-in-from-top-2">
                        <div className="flex-1 glass p-3 rounded-2xl flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                <Navigation className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Trips</p>
                                <p className="text-lg font-black text-gray-800 leading-none">{stats.tripsToday}</p>
                            </div>
                        </div>
                        <div className="flex-1 glass p-3 rounded-2xl flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                                <Clock className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Online</p>
                                <p className="text-lg font-black text-gray-800 leading-none">{stats.hoursOnline}h</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Sheet area for requests */}
            <div className="absolute bottom-0 left-0 right-0 z-30 p-4 pb-8 flex flex-col items-center justify-end min-h-[50vh] pointer-events-none">

                {/* Offline State (Inspiring) */}
                {!isOnline && (
                    <div className="pointer-events-auto bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl text-center max-w-sm w-full animate-sway border border-white/50">
                        <div className="w-20 h-20 bg-gradient-to-tr from-gray-900 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gray-900/20 text-white">
                            <Power className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Ready to earn?</h2>
                        <p className="text-gray-500 mb-8 font-medium">High demand in your area. Go online to start receiving requests.</p>
                        <button
                            onClick={toggleOnline}
                            className="btn-primary flex items-center justify-center gap-3 text-lg"
                        >
                            <span>GO ONLINE</span>
                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </button>
                    </div>
                )}

                {/* Radar Searching Animation */}
                {isOnline && requests.length === 0 && (
                    <div className="relative pointer-events-auto mb-12">
                        {/* Radar Rings */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-primary/20 rounded-full radar-ring"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-primary/30 rounded-full radar-ring"></div>

                        <div className="glass px-8 py-4 rounded-full flex items-center gap-4 shadow-2xl shadow-primary/20 bg-white/90">
                            <div className="relative">
                                <div className="w-3 h-3 bg-primary rounded-full relative z-10"></div>
                                <div className="absolute inset-0 bg-primary/50 rounded-full animate-ping"></div>
                            </div>
                            <span className="font-bold text-gray-800 tracking-wide">Scanning for rides...</span>
                        </div>
                    </div>
                )}

                {/* Floating Ride Request Cards (Premium Swipe-like Cards) */}
                <div className="w-full max-w-md space-y-4 pointer-events-auto">
                    {requests.map((request) => (
                        <div key={request.id} className="card-base p-6 border-0 shadow-2xl shadow-black/10 animate-in slide-in-from-bottom duration-500 bg-white/95 backdrop-blur-md">
                            {/* Premium Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-lg shadow-primary/30">
                                        <User className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">New</span>
                                            <span className="text-gray-400 text-xs font-bold">• {request.distance_km} km away</span>
                                        </div>
                                        <h3 className="font-black text-xl text-gray-900 mt-0.5">Ride Request</h3>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-black text-gray-900 tracking-tighter">${request.price.toFixed(0)}</p>
                                    <p className="text-xs font-bold text-gray-400 uppercase">Est. Fare</p>
                                </div>
                            </div>

                            {/* Clean Route Visualization */}
                            <div className="relative pl-4 space-y-8 mb-8">
                                {/* Connecting Line */}
                                <div className="absolute left-[23px] top-3 bottom-8 w-0.5 bg-gray-100"></div>

                                <div className="relative z-10 flex gap-4 items-start group">
                                    <div className="w-4 h-4 rounded-full border-4 border-white bg-green-500 shadow-md"></div>
                                    <div className="flex-1 -mt-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Pickup</p>
                                        <p className="text-lg font-bold text-gray-900 leading-tight">{request.pickup_location}</p>
                                    </div>
                                </div>

                                <div className="relative z-10 flex gap-4 items-start group">
                                    <div className="w-4 h-4 rounded-full border-4 border-white bg-black shadow-md"></div>
                                    <div className="flex-1 -mt-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Dropoff</p>
                                        <p className="text-lg font-bold text-gray-900 leading-tight">{request.dropoff_location}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-[1fr,2fr] gap-3">
                                <button
                                    onClick={() => declineRide(request.id)}
                                    className="py-4 rounded-2xl font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 transition-all border border-gray-100"
                                >
                                    Decline
                                </button>
                                <button
                                    onClick={() => acceptRide(request.id)}
                                    className="btn-primary py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 flex items-center justify-center gap-2"
                                >
                                    <span>Accept Ride</span>
                                    <ShieldCheck className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
