import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import api from '@/services/api'
import { ArrowRight, Car, Store, CheckCircle2, Sparkles } from 'lucide-react'

export default function Register() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState<'RIDER' | 'DRIVER'>('RIDER')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !email || !password) {
            toast.error('Please fill in all fields')
            return
        }

        setLoading(true)
        try {
            // Register user with auth service
            await api.post('/auth/register', {
                email,
                password,
                role: role
            })

            // Login to get token
            const loginRes = await api.post('/auth/login', {
                email,
                password
            })

            // Create user profile
            try {
                await api.post('/users/profiles', {
                    authUserId: loginRes.data.userId,
                    fullName: name,
                    phone: null
                })
            } catch (profileError) {
                console.warn('Profile creation failed (might already exist):', profileError)
            }

            toast.success('Account created! Please login.')
            navigate('/login')
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen overflow-hidden font-sans">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-primary opacity-90"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptMCAxMmMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptLTE4IDBjMy4zMTQgMCA2IDIuNjg2IDYgNnMtMi42ODYgNi02IDYtNi0yLjY4Ni02LTYgMi42ODYtNiA2LTZ6bTAtMTJjMy4zMTQgMCA2IDIuNjg2IDYgNnMtMi42ODYgNi02IDYtNi0yLjY4Ni02LTYgMi42ODYtNiA2LTZ6IiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48L2c+PC9zdmc+')] opacity-20"></div>

            {/* Floating orbs */}
            <div className="absolute top-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 left-10 w-64 h-64 bg-pink-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>

            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col justify-center p-6 md:p-10">
                <div className="max-w-md mx-auto w-full">
                    {/* Logo */}
                    <div className="mb-10 text-center animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-2xl shadow-black/20 mb-6">
                            <span className="text-primary text-4xl font-black">U</span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tight mb-3 drop-shadow-lg">Join Us</h1>
                        <p className="text-xl text-white/80 font-medium flex items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            Start your journey today
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="glass backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-2xl border border-white/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Role Selection */}
                        <div className="mb-8">
                            <p className="text-white/90 font-bold text-sm mb-4 uppercase tracking-wider">Choose your role</p>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setRole('RIDER')}
                                    className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 group ${role === 'RIDER'
                                        ? 'bg-white border-white shadow-xl scale-105'
                                        : 'bg-white/20 border-white/40 hover:bg-white/30 hover:scale-102'
                                        }`}
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${role === 'RIDER' ? 'bg-primary text-white' : 'bg-white/30 text-white'
                                        }`}>
                                        <Store className="w-7 h-7" />
                                    </div>
                                    <span className={`font-black text-lg ${role === 'RIDER' ? 'text-gray-900' : 'text-white'}`}>
                                        Customer
                                    </span>
                                    {role === 'RIDER' && (
                                        <CheckCircle2 className="w-6 h-6 text-primary" />
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setRole('DRIVER')}
                                    className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 group ${role === 'DRIVER'
                                        ? 'bg-white border-white shadow-xl scale-105'
                                        : 'bg-white/20 border-white/40 hover:bg-white/30 hover:scale-102'
                                        }`}
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${role === 'DRIVER' ? 'bg-primary text-white' : 'bg-white/30 text-white'
                                        }`}>
                                        <Car className="w-7 h-7" />
                                    </div>
                                    <span className={`font-black text-lg ${role === 'DRIVER' ? 'text-gray-900' : 'text-white'}`}>
                                        Driver
                                    </span>
                                    {role === 'DRIVER' && (
                                        <CheckCircle2 className="w-6 h-6 text-primary" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-4">
                                <div className="group">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Full Name"
                                        className="w-full bg-white/90 border-2 border-white/50 rounded-2xl px-6 py-4 text-lg font-semibold outline-none transition-all focus:bg-white focus:border-primary focus:scale-[1.02] focus:shadow-xl focus:shadow-primary/20"
                                        required
                                    />
                                </div>
                                <div className="group">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email"
                                        className="w-full bg-white/90 border-2 border-white/50 rounded-2xl px-6 py-4 text-lg font-semibold outline-none transition-all focus:bg-white focus:border-primary focus:scale-[1.02] focus:shadow-xl focus:shadow-primary/20"
                                        required
                                    />
                                </div>
                                <div className="group">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Password"
                                        className="w-full bg-white/90 border-2 border-white/50 rounded-2xl px-6 py-4 text-lg font-semibold outline-none transition-all focus:bg-white focus:border-primary focus:scale-[1.02] focus:shadow-xl focus:shadow-primary/20"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white text-primary font-black text-xl py-5 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group mt-6"
                            >
                                <span>{loading ? 'Creating account...' : 'Create Account'}</span>
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-white/80 font-medium">
                                Already a member?{' '}
                                <Link to="/login" className="text-white font-black hover:underline">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Footer tagline */}
                    <p className="text-center text-white/60 text-sm font-medium mt-8 animate-in fade-in duration-1000 delay-500">
                        Join thousands riding and earning with us
                    </p>
                </div>
            </div>
        </div>
    )
}
