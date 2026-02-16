import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import api from "@/services/api"
import { ChevronLeft, Car, MapPin, DollarSign } from "lucide-react"

interface Order {
    id: number
    pickup_location: string
    dropoff_location: string
    price: number
    distance_km: number
    status: string
    created_at: string
}

export default function RiderHistory() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const res = await api.get(`/orders/user/${user?.id}`)
            setOrders(res.data)
        } catch (error) {
            console.error('Failed to fetch orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            ACCEPTED: 'bg-blue-100 text-blue-800',
            IN_PROGRESS: 'bg-purple-100 text-purple-800',
            COMPLETED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800'
        }
        return colors[status] || 'bg-gray-100 text-gray-800'
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-4 max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate('/rider/home')}
                        className="text-gray-900 hover:text-gray-600 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-medium">Your Trips</h1>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-6">
                {loading && (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-gray-100 rounded-2xl h-32 animate-pulse"></div>
                        ))}
                    </div>
                )}

                {!loading && orders.length === 0 && (
                    <div className="text-center py-20">
                        <Car className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-2xl font-medium text-gray-900 mb-2">No rides yet</h3>
                        <p className="text-gray-500 mb-6">Your ride history will appear here</p>
                        <button
                            onClick={() => navigate('/rider/home')}
                            className="bg-black text-white font-medium px-8 py-3 rounded-lg hover:bg-gray-900 transition-colors"
                        >
                            Book a Ride
                        </button>
                    </div>
                )}

                {!loading && orders.length > 0 && (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                                {/* Header Row */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                            <Car className="w-6 h-6 text-gray-700" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(order.created_at).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-gray-900">${order.price.toFixed(2)}</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Locations */}
                                <div className="space-y-3 ml-14">
                                    {/* Pickup */}
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1.5 w-2 h-2 rounded-full bg-green-500"></div>
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500 mb-0.5">Pickup</p>
                                            <p className="text-sm text-gray-900 font-medium">{order.pickup_location}</p>
                                        </div>
                                    </div>

                                    {/* Connecting Line */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 flex justify-center">
                                            <div className="w-0.5 h-4 bg-gray-300"></div>
                                        </div>
                                    </div>

                                    {/* Dropoff */}
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1.5 w-2 h-2 rounded-full bg-red-500"></div>
                                        <div className="flex-1">
                                            <p className="text-xs text-gray-500 mb-0.5">Dropoff</p>
                                            <p className="text-sm text-gray-900 font-medium">{order.dropoff_location}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
