import { useState, useEffect } from "react"
import LeafletMap from "@/components/LeafletMap"
import { useAuth } from "@/context/AuthContext"
import { useSocket } from "@/context/SocketContext"
import LocationAutocomplete from "@/components/LocationAutocomplete"
import api from "@/services/api"
import toast from "react-hot-toast"
import { User, History, MapPin, DollarSign } from "lucide-react"

export default function RiderHome() {
    const { user } = useAuth()
    const { socket } = useSocket()
    const [pickup, setPickup] = useState("")
    const [dropoff, setDropoff] = useState("")
    const [pickupCoords, setPickupCoords] = useState<{ lat: number, lng: number } | null>(null)
    const [dropoffCoords, setDropoffCoords] = useState<{ lat: number, lng: number } | null>(null)
    const [loading, setLoading] = useState(false)
    const [prices, setPrices] = useState<{ type: string, price: number }[]>([])
    const [currentOrder, setCurrentOrder] = useState<any>(null)
    const [driverInfo, setDriverInfo] = useState<any>(null)

    // WebSocket real-time order updates
    useEffect(() => {
        if (!socket) return

        socket.on('order:status', (data) => {
            console.log('Order status update:', data)
            setCurrentOrder(data)

            if (data.status === 'ACCEPTED') {
                toast.success('Driver accepted your ride! 🚗')
            } else if (data.status === 'IN_PROGRESS') {
                toast('Trip started! 🚀', { icon: '🚗' })
            } else if (data.status === 'COMPLETED') {
                toast.success('Trip completed! Thank you 🎉')
                setCurrentOrder(null)
                setDriverInfo(null)
            }
        })

        socket.on('driver:assigned', (data) => {
            console.log('Driver assigned:', data)
            setDriverInfo(data.driver)
            toast.success(`${data.driver.name || 'Driver'} is on the way!`, {
                duration: 5000,
            })
        })

        socket.on('driver:location', (data) => {
            if (driverInfo) {
                setDriverInfo({ ...driverInfo, location: data.location })
            }
        })

        return () => {
            socket.off('order:status')
            socket.off('driver:assigned')
            socket.off('driver:location')
        }
    }, [socket, driverInfo])

    useEffect(() => {
        if (dropoff) {
            setPrices([
                { type: "UberX", price: 12 },
                { type: "Comfort", price: 15 },
                { type: "XL", price: 18 },
            ])
        }
    }, [dropoff])

    const requestRide = async () => {
        if (!pickup || !dropoff) {
            toast.error("Please enter both locations")
            return
        }

        setLoading(true)
        const toastId = toast.loading("Requesting ride...")

        try {
            const res = await api.post('/orders', {
                riderId: user?.id,
                pickup_location: pickup,
                dropoff_location: dropoff,
                distance_km: 5.0,
                price: 25000
            })

            toast.success("Ride requested! Searching for drivers...", { id: toastId })

            setTimeout(() => {
                setPickup("")
                setDropoff("")
                setPickupCoords(null)
                setDropoffCoords(null)
            }, 1000)
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to request ride", { id: toastId })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative h-screen w-full bg-white overflow-hidden">
            {/* Map Layer */}
            <div className="absolute inset-0 z-0">
                <LeafletMap
                    pickup={pickupCoords}
                    dropoff={dropoffCoords}
                />
            </div>

            {/* Top Bar - White with shadow */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 shadow-sm">
                <div className="px-6 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold">Uber</h1>
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.location.href = '/rider/history'}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <History className="w-5 h-5 text-gray-700" />
                        </button>
                        <button
                            onClick={() => window.location.href = '/rider/profile'}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <User className="w-5 h-5 text-gray-700" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Sheet - White card */}
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-white rounded-t-3xl shadow-2xl border-t border-gray-200 max-h-[70vh] overflow-y-auto">
                <div className="p-6 space-y-6">
                    {!currentOrder ? (
                        <>
                            <h2 className="text-2xl font-medium text-gray-900">Where to?</h2>

                            <div className="space-y-4">
                                {/* Pickup */}
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></div>
                                    <LocationAutocomplete
                                        value={pickup}
                                        onChange={setPickup}
                                        onSelect={(location) => {
                                            setPickup(location.description)
                                            if (location.lat && location.lng) {
                                                setPickupCoords({ lat: location.lat, lng: location.lng })
                                            }
                                        }}
                                        placeholder="Pickup location"
                                    />
                                </div>

                                {/* Dropoff */}
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></div>
                                    <LocationAutocomplete
                                        value={dropoff}
                                        onChange={setDropoff}
                                        onSelect={(location) => {
                                            setDropoff(location.description)
                                            if (location.lat && location.lng) {
                                                setDropoffCoords({ lat: location.lat, lng: location.lng })
                                            }
                                        }}
                                        placeholder="Drop-off location"
                                    />
                                </div>
                            </div>

                            {/* Price Options */}
                            {dropoff && prices.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-medium text-gray-700">Choose a ride</h3>
                                    <div className="space-y-2">
                                        {prices.map((p) => (
                                            <button
                                                key={p.type}
                                                onClick={() => requestRide()}
                                                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-gray-900 transition-all bg-white"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-8 bg-gray-200 rounded"></div>
                                                    <div className="text-left">
                                                        <p className="font-medium text-gray-900">{p.type}</p>
                                                        <p className="text-xs text-gray-500">2 min away</p>
                                                    </div>
                                                </div>
                                                <p className="text-lg font-bold text-gray-900">${p.price}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Request Button */}
                            <button
                                className="w-full bg-black text-white font-medium text-lg py-4 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => requestRide()}
                                disabled={loading || !pickup || !dropoff}
                            >
                                {loading ? "Requesting..." : "Request Ride"}
                            </button>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MapPin className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Ride in progress</h3>
                            <p className="text-gray-600">{currentOrder.status}</p>
                            {driverInfo && (
                                <p className="text-sm text-gray-500 mt-2">Driver: {driverInfo.name || 'On the way'}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
