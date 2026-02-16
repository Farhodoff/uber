import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import api from "@/services/api"
import toast from "react-hot-toast"
import {
    User, LogOut, CreditCard, Shield,
    Settings, Heart, Bell, ChevronRight, PenSquare
} from "lucide-react"
import BottomNav from "@/components/BottomNav"

export default function RiderProfile() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [profile, setProfile] = useState<any>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState({
        name: '',
        phone: ''
    })

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const res = await api.get(`/users/profiles/${user?.id}`)
            setProfile(res.data)
            setFormData({
                name: res.data.full_name || '',
                phone: res.data.phone || ''
            })
        } catch (error: any) {
            if (error.response?.status === 404) {
                // Profile doesn't exist, create one
                try {
                    await api.post('/users/profiles', {
                        authUserId: user?.id,
                        fullName: user?.email?.split('@')[0] || 'User',
                        phone: null
                    })
                    // Retry fetching
                    await fetchProfile()
                    return
                } catch (createError) {
                    console.error('Failed to create profile:', createError)
                }
            }
            console.error('Failed to fetch profile:', error)
            toast.error('Failed to load profile')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = async () => {
        const toastId = toast.loading('Saving changes...')
        try {
            await api.patch(`/users/profiles/${user?.id}`, formData)
            await fetchProfile()
            setIsEditing(false)
            toast.success('Profile updated!', { id: toastId })
        } catch (error) {
            console.error('Failed to update profile:', error)
            toast.error('Failed to update profile', { id: toastId })
        }
    }

    const handleLogout = () => {
        logout()
        toast.success('Logged out successfully')
        navigate('/login')
    }

    const MenuLink = ({ icon: Icon, label, onClick, color = "text-gray-600", bg = "bg-gray-100" }: any) => (
        <div
            onClick={onClick}
            className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-all active:scale-[0.99] group border-b border-gray-50 last:border-0"
        >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg} ${color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
            </div>
            <span className="flex-1 text-lg font-bold text-gray-900">{label}</span>
            <div className="p-2 bg-gray-50 rounded-full text-gray-400 group-hover:bg-white group-hover:shadow-sm">
                <ChevronRight className="w-5 h-5" />
            </div>
        </div>
    )

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin text-4xl">👾</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-24">
            {/* Unique Curved Header */}
            <div className="relative bg-black text-white pt-12 pb-24 px-6 rounded-b-[3rem] shadow-2xl overflow-hidden">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

                <div className="relative z-10 flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-black tracking-tight">Profile</h1>
                    <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 backdrop-blur-md">
                        <Settings className="w-6 h-6" />
                    </button>
                </div>

                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center text-4xl font-black shadow-lg shadow-primary/30 ring-4 ring-white/10">
                        {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{formData.name || 'Rider'}</h2>
                        <p className="text-gray-400 font-medium">{user?.email}</p>
                        <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-primary-light">
                            <span>⭐️</span>
                            <span>4.9 Rating</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Content */}
            <div className="max-w-xl mx-auto px-6 -mt-12 relative z-20 space-y-6">

                {/* Account Settings Card */}
                <div className="card-base p-2 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account</span>
                        <button onClick={() => setIsEditing(!isEditing)} className="text-primary text-xs font-bold hover:underline">
                            {isEditing ? 'Cancel' : 'Edit Info'}
                        </button>
                    </div>

                    {isEditing ? (
                        <div className="p-4 space-y-4 animate-in slide-in-from-top-2">
                            <div>
                                <label className="text-xs font-bold text-gray-500 ml-1">Full Name</label>
                                <input
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field mt-1"
                                    placeholder="Enter your name"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 ml-1">Phone Number</label>
                                <input
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="input-field mt-1"
                                    placeholder="+998 90 123 45 67"
                                />
                            </div>
                            <button onClick={handleUpdate} className="btn-primary">Save Changes</button>
                        </div>
                    ) : (
                        <div>
                            <MenuLink icon={User} label="Personal Info" bg="bg-blue-50" color="text-blue-600" />
                            <MenuLink icon={CreditCard} label="Payment Methods" bg="bg-green-50" color="text-green-600" />
                            <MenuLink icon={Heart} label="Saved Places" bg="bg-red-50" color="text-red-500" />
                        </div>
                    )}
                </div>

                {/* Preferences Card */}
                <div className="card-base p-2 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Preferences</span>
                    </div>
                    <MenuLink icon={Bell} label="Notifications" bg="bg-purple-50" color="text-purple-600" />
                    <MenuLink icon={Shield} label="Privacy & Security" bg="bg-orange-50" color="text-orange-600" />
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full p-4 rounded-2xl bg-gray-100 text-gray-500 font-bold flex items-center justify-center gap-2 hover:bg-gray-200 hover:text-red-500 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Log Out</span>
                </button>
            </div>

            <BottomNav />
        </div>
    )
}
