import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import api from "@/services/api"
import { CardSkeleton } from "@/components/LoadingSkeleton"

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

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            PENDING: 'bg-yellow-500/20 text-yellow-400',
            ACCEPTED: 'bg-blue-500/20 text-blue-400',
            IN_PROGRESS: 'bg-purple-500/20 text-purple-400',
            COMPLETED: 'bg-green-500/20 text-green-400',
            CANCELLED: 'bg-red-500/20 text-red-400'
        }
        return colors[status] || 'bg-gray-500/20 text-gray-400'
    }

    return (
        <div className="min-h-screen bg-background p-4">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-white">Ride History</h1>
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/rider')}
                        className="text-white"
                    >
                        ← Back
                    </Button>
                </div>
            </div>

            {/* Orders List */}
            <div className="max-w-4xl mx-auto space-y-4">
                {loading && (
                    <>
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </>
                )}

                {!loading && orders.length === 0 && (
                    <Card className="border-white/10 bg-black/50 backdrop-blur-xl">
                        <CardContent className="p-12 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 mx-auto text-gray-600 mb-4">
                                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                                <circle cx="7" cy="17" r="2" />
                                <path d="M9 17h6" />
                                <circle cx="17" cy="17" r="2" />
                            </svg>
                            <h3 className="text-xl font-bold text-white mb-2">No rides yet</h3>
                            <p className="text-gray-400 mb-6">Your ride history will appear here once you book your first trip</p>
                            <Button onClick={() => navigate('/rider')}>
                                Book a Ride
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {!loading && orders.map((order) => (
                    <Card key={order.id} className="border-white/10 bg-black/50 backdrop-blur-xl hover:bg-black/60 transition-all">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(order.status)}`}>
                                        {order.status}
                                    </span>
                                    <p className="text-gray-500 text-sm mt-2">
                                        {new Date(order.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-white">{order.price.toLocaleString()} UZS</p>
                                    <p className="text-gray-400 text-sm">{order.distance_km} km</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {/* Pickup */}
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-xs">Pickup</p>
                                        <p className="text-white font-medium">{order.pickup_location}</p>
                                    </div>
                                </div>

                                {/* Connecting line */}
                                <div className="flex items-center gap-3">
                                    <div className="w-3 flex justify-center">
                                        <div className="w-0.5 h-6 bg-gradient-to-b from-green-500 to-red-500"></div>
                                    </div>
                                </div>

                                {/* Dropoff */}
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-xs">Dropoff</p>
                                        <p className="text-white font-medium">{order.dropoff_location}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
