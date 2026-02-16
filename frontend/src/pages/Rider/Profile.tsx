import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import api from "@/services/api"
import toast from "react-hot-toast"
import { User, LogOut, ChevronLeft } from "lucide-react"

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
                name: res.data.name || '',
                phone: res.data.phone || ''
            })
        } catch (error) {
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
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                    <button
                        onClick={() => navigate('/rider/home')}
                        className="flex items-center gap-2 text-gray-900 hover:text-gray-600 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back
                    </button>
                    <h1 className="text-xl font-medium">Profile</h1>
                    <div className="w-16"></div> {/* Spacer for centering */}
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 py-8">
                {/* Profile Avatar */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-4xl font-medium text-gray-700 mb-4">
                        {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="text-2xl font-medium text-gray-900">{formData.name || 'User'}</h2>
                    <p className="text-gray-500 mt-1">{user?.email}</p>
                </div>

                {/* Edit Mode Toggle */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                    <span className="text-gray-900 font-medium">Edit mode</span>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isEditing ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEditing ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-8 mb-8">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm text-gray-500 mb-2">Full name</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter your name"
                                className="w-full px-0 py-3 text-lg bg-transparent border-0 border-b-2 border-gray-300 focus:border-black focus:ring-0 placeholder:text-gray-400 transition-colors outline-none"
                            />
                        ) : (
                            <p className="text-lg text-gray-900 py-3 border-b-2 border-gray-200">{formData.name || 'Not set'}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm text-gray-500 mb-2">Email</label>
                        <p className="text-lg text-gray-900 py-3 border-b-2 border-gray-200">{user?.email}</p>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm text-gray-500 mb-2">Phone</label>
                        {isEditing ? (
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="Enter your phone"
                                className="w-full px-0 py-3 text-lg bg-transparent border-0 border-b-2 border-gray-300 focus:border-black focus:ring-0 placeholder:text-gray-400 transition-colors outline-none"
                            />
                        ) : (
                            <p className="text-lg text-gray-900 py-3 border-b-2 border-gray-200">{formData.phone || 'Not set'}</p>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleUpdate}
                                className="w-full bg-blue-600 text-white font-medium text-lg py-4 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Save changes
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false)
                                    setFormData({
                                        name: profile?.name || '',
                                        phone: profile?.phone || ''
                                    })
                                }}
                                className="w-full border-2 border-gray-300 text-gray-900 font-medium text-lg py-4 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleLogout}
                            className="w-full border-2 border-gray-900 text-gray-900 font-medium text-lg py-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-5 h-5" />
                            Logout
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
