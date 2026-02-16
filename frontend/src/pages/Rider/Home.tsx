import { useState, useEffect } from "react"
import LeafletMap from "@/components/LeafletMap"
import { useAuth } from "@/context/AuthContext"
import { useSocket } from "@/context/SocketContext"
import LocationAutocomplete from "@/components/LocationAutocomplete"
import api from "@/services/api"
import toast from "react-hot-toast"
import BottomNav from "@/components/BottomNav"
import {
    Search, MapPin, Package, Car, Clock,
    ChevronRight, Star, Navigation
} from "lucide-react"

export default function RiderHome() {
    const { user } = useAuth()
    const { socket } = useSocket()
    const [pickup, setPickup] = useState("")
    const [dropoff, setDropoff] = useState("")
    const [pickupCoords, setPickupCoords] = useState<{ lat: number, lng: number } | null>(null)
    const [dropoffCoords, setDropoffCoords] = useState<{ lat: number, lng: number } | null>(null)
    const [loading, setLoading] = useState(false)
    const [viewState, setViewState] = useState<'idle' | 'searching' | 'confirming' | 'active'>('idle')
    const [prices, setPrices] = useState<{ type: string, price: number, time: string, icon: any }[]>([])
    const [currentOrder, setCurrentOrder] = useState<any>(null)

    // Design System Mocks
    const categories = [
        { id: 'ride', name: 'Ride', icon: Car, color: 'bg-primary/10 text-primary' },
        { id: 'delivery', name: 'Delivery', icon: Package, color: 'bg-orange-50 text-orange-600' },
        { id: 'reserve', name: 'Reserve', icon: Clock, color: 'bg-blue-50 text-blue-600' },
    ]

    const recentPlaces = [
        { name: "Home", address: "Tashkent City, Block A", icon: Star },
        { name: "Work", address: "Techno Plaza, Floor 4", icon: MapPin },
    ]

    // Initialize prices mock
    useEffect(() => {
        setPrices([
            { type: "Start", price: 12000, time: "3 min", icon: Car },
            { type: "Comfort", price: 18000, time: "5 min", icon: Car },
            { type: "Business", price: 35000, time: "8 min", icon: Car },
        ])
    }, [])

    // WebSocket logic
    useEffect(() => {
        if (!socket) return
        socket.on('order:status', (data) => {
            setCurrentOrder(data)
            if (data.status === 'ACCEPTED') toast.success('Driver accepted! 🚗')
        })
        return () => { socket.off('order:status') }
    }, [socket])

    const handleRequest = async () => {
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            setViewState('active')
            toast.success("Looking for drivers...")
        }, 1500)
    }

    return (
        <div className="relative h-screen w-full bg-gray-50 overflow-hidden font-sans">
            {/* Full Screen Map */}
            <div className="absolute inset-0 z-0">
                <LeafletMap pickup={pickupCoords} dropoff={dropoffCoords} />
                <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white/80 to-transparent pointer-events-none"></div>
            </div>

            {/* Top Status Bar (Floating Glass) */}
            <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start pointer-events-none">
                <div className="pointer-events-auto glass px-4 py-2 rounded-full flex items-center gap-2 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-gray-700">Online</span>
                </div>
                {currentOrder && (
                    <div className="pointer-events-auto glass px-4 py-2 rounded-full flex items-center gap-2 shadow-lg border-primary/20">
                        <Navigation className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-primary">Driver arriving in 3 min</span>
                    </div>
                )}
            </div>

            {/* Main Bottom Sheet */}
            <div className={`absolute left-0 right-0 z-30 transition-all duration-500 ease-in-out ${viewState === 'idle' ? 'bottom-[90px]' : 'bottom-0 top-0 bg-white'
                }`}>
                <div className={`${viewState === 'idle' ? 'floating-panel mx-4' : 'h-full bg-white'} overflow-hidden`}>

                    {/* IDLE STATE: Floating Card */}
                    {viewState === 'idle' && (
                        <div className="p-5 pb-2">
                            {/* Search Trigger */}
                            <div
                                onClick={() => setViewState('searching')}
                                className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-100 transition-all active:scale-[0.98]"
                            >
                                <Search className="w-6 h-6 text-primary" />
                                <div className="flex-1">
                                    <p className="text-lg font-black text-gray-900 tracking-tight">Where to?</p>
                                </div>
                                <div className="bg-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm text-gray-500">
                                    Now
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="flex gap-4 overflow-x-auto no-scrollbar py-6">
                                {categories.map(cat => (
                                    <div key={cat.id} className="flex flex-col items-center gap-2 min-w-[70px] cursor-pointer group">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:-translate-y-1 ${cat.color}`}>
                                            <cat.icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-500 group-hover:text-gray-900">{cat.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SEARCHING STATE: Full Screen */}
                    {viewState === 'searching' && (
                        <div className="h-full flex flex-col p-6 animate-in slide-in-from-bottom duration-300">
                            <div className="flex items-center gap-4 mb-6">
                                <button onClick={() => setViewState('idle')} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                                    <ChevronRight className="w-6 h-6 rotate-180" />
                                </button>
                                <h2 className="text-2xl font-black tracking-tight">Plan your ride</h2>
                            </div>

                            {/* Inputs */}
                            <div className="relative mb-6">
                                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200"></div>
                                <div className="space-y-4 relative">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full bg-primary z-10 ring-4 ring-white"></div>
                                        <input
                                            value={pickup}
                                            onChange={e => setPickup(e.target.value)}
                                            className="input-field shadow-sm"
                                            placeholder="Current Location"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full bg-black z-10 ring-4 ring-white"></div>
                                        <input
                                            value={dropoff}
                                            onChange={e => setDropoff(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && setViewState('confirming')}
                                            className="input-field bg-white shadow-md border-primary/20 focus:border-primary"
                                            placeholder="Where to?"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Recent List */}
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Recent Locations</h3>
                            <div className="space-y-2">
                                {recentPlaces.map((place, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setViewState('confirming')}
                                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                            <place.icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900">{place.name}</p>
                                            <p className="text-sm text-gray-500">{place.address}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CONFIRMING STATE */}
                    {viewState === 'confirming' && (
                        <div className="h-full flex flex-col p-6 animate-in slide-in-from-right duration-300">
                            <div className="flex items-center gap-4 mb-6">
                                <button onClick={() => setViewState('searching')} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                                    <ChevronRight className="w-6 h-6 rotate-180" />
                                </button>
                                <h2 className="text-2xl font-black tracking-tight">Choose ride</h2>
                            </div>

                            <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar -mx-6 px-6">
                                {prices.map((p, i) => (
                                    <div
                                        key={i}
                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${i === 0
                                                ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                                                : 'border-transparent hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                                <p.icon className="w-8 h-8 text-gray-700" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg">{p.type}</p>
                                                <p className="text-sm text-gray-500">{p.time} away</p>
                                            </div>
                                        </div>
                                        <p className="font-bold text-lg text-gray-900">{p.price.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 mt-auto">
                                <button
                                    onClick={handleRequest}
                                    disabled={loading}
                                    className="btn-primary flex items-center justify-center gap-3 shadow-xl shadow-primary/30"
                                >
                                    {loading ? (
                                        <span className="animate-spin">⌛</span>
                                    ) : (
                                        <>
                                            <span>Request {prices[0].type}</span>
                                            <ChevronRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed Bottom Navigation (Only visible in idle) */}
            {viewState === 'idle' && <BottomNav />}
        </div>
    )
}
