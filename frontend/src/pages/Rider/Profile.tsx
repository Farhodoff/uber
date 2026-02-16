import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import api from "@/services/api"
import toast from "react-hot-toast"

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
            toast.success('Profile updated successfully!', { id: toastId })
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
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-white">Profile</h1>
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/rider')}
                        className="text-white"
                    >
                        ← Back
                    </Button>
                </div>

                {/* Profile Card */}
                <Card className="border-white/10 bg-black/50 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-2xl font-bold">
                                {user?.email?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xl">{formData.name || 'User'}</p>
                                <p className="text-sm text-gray-400 font-normal">{user?.email}</p>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Role */}
                        <div>
                            <label className="text-gray-400 text-sm">Role</label>
                            <p className="text-white text-lg font-medium">{user?.role}</p>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="text-gray-400 text-sm">Full Name</label>
                            {isEditing ? (
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter your name"
                                    className="mt-1"
                                />
                            ) : (
                                <p className="text-white text-lg">{formData.name || 'Not set'}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="text-gray-400 text-sm">Phone Number</label>
                            {isEditing ? (
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Enter your phone"
                                    className="mt-1"
                                />
                            ) : (
                                <p className="text-white text-lg">{formData.phone || 'Not set'}</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            {isEditing ? (
                                <>
                                    <Button
                                        onClick={handleUpdate}
                                        className="flex-1"
                                    >
                                        Save Changes
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsEditing(false)
                                            setFormData({
                                                name: profile?.name || '',
                                                phone: profile?.phone || ''
                                            })
                                        }}
                                        className="flex-1 border-white/20 text-white"
                                    >
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        className="flex-1"
                                    >
                                        Edit Profile
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleLogout}
                                        className="flex-1"
                                    >
                                        Logout
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
