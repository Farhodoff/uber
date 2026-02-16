import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import LeafletMap from "@/components/LeafletMap"
import { useAuth } from "@/context/AuthContext"
import { useSocket } from "@/context/SocketContext"
import LocationAutocomplete from "@/components/LocationAutocomplete"
import api from "@/services/api"
import toast from "react-hot-toast"

export default function RiderHome() {
    const { user } = useAuth()
    const { socket, isConnected } = useSocket()
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

            // Show toast based on status
            if (data.status === 'ACCEPTED') {
                toast.success('Driver accepted your ride! 🚗')
            } else if (data.status === 'IN_PROGRESS') {
                toast('Trip started! 🚀', { icon: '🚗' })
            } else if (data.status === 'COMPLETED') {
                toast.success('Trip completed! Thank you for riding 🎉')
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
            // Update driver location on map in real-time
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
        // Mock prices calculation based on input (debounce in real app)
        if (dropoff) {
            setPrices([
                { type: "Economy", price: 15000 },
                { type: "Comfort", price: 25000 },
                { type: "Lux", price: 40000 },
            ])
        }
    }, [dropoff])

    const requestRide = async () => {
        if (!pickup || !dropoff) {
            toast.error("Please enter both pickup and dropoff locations")
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

            // Reset form
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
        <div className="relative h-screen w-full bg-background overflow-hidden">
            {/* Map Layer */}
            <div className="absolute inset-0 z-0">
                <LeafletMap
                    pickup={pickupCoords}
                    dropoff={dropoffCoords}
                />
            </div>

            {/* Top Floating UI */}
            <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-10">
                <Card className="bg-black/60 backdrop-blur-md border-white/10">
                    <CardContent className="p-2 sm:p-4 flex gap-2">
                        <div
                            className="bg-white/10 p-2 rounded-full text-white cursor-pointer hover:bg-white/20 transition-all"
                            onClick={() => window.location.href = '/rider/profile'}
                        >
                            👤
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-sm sm:text-lg font-bold text-white truncate">Good Evening, {user?.email}</h1>
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.location.href = '/rider/history'}
                            className="text-white text-xs sm:text-sm"
                        >
                            📋 <span className="hidden sm:inline">History</span>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Sheet UI */}
            <div className="absolute bottom-0 left-0 right-0 z-20">
                <Card className="rounded-t-3xl rounded-b-none border-t border-white/10 bg-black/80 backdrop-blur-xl pb-8">
                    <CardContent className="p-6 space-y-4">
                        {!status && (
                            <>
                                <h2 className="text-xl font-bold text-white mb-2">Where to?</h2>
                                <div className="space-y-4">
                                    <LocationAutocomplete
                                        value={pickup}
                                        onChange={setPickup}
                                        onSelect={(location) => {
                                            setPickup(location.description)
                                            if (location.lat && location.lng) {
                                                setPickupCoords({ lat: location.lat, lng: location.lng })
                                            }
                                        }}
                                        placeholder="Pickup Location"
                                    />
                                    <LocationAutocomplete
                                        value={dropoff}
                                        onChange={setDropoff}
                                        onSelect={(location) => {
                                            setDropoff(location.description)
                                            if (location.lat && location.lng) {
                                                setDropoffCoords({ lat: location.lat, lng: location.lng })
                                            }
                                        }}
                                        placeholder="Dropoff Location"
                                    />
                                </div>

                                {dropoff && (
                                    <div className="grid grid-cols-3 gap-2 mt-4">
                                        {prices.map((p) => (
                                            <div key={p.type}
                                                onClick={() => requestRide()}
                                                className="bg-white/5 hover:bg-white/20 p-3 rounded-xl border border-white/10 cursor-pointer transition-all flex flex-col items-center">
                                                <div className="w-10 h-6 bg-gray-500 rounded-md mb-2"></div>
                                                <span className="text-xs font-bold text-white">{p.type}</span>
                                                <span className="text-xs text-gray-400">{p.price.toLocaleString()} UZS</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <Button
                                    className="w-full mt-4 py-6 text-lg font-bold bg-gradient-to-r from-primary to-secondary"
                                    onClick={() => requestRide()}
                                    disabled={loading}
                                >
                                    {loading ? "Requesting..." : "Request Ride"}
                                </Button>
                            </>
                        )}

                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
