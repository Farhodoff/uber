import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import api from '@/services/api'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) {
            toast.error('Please fill in all fields')
            return
        }

        setLoading(true)
        try {
            const res = await api.post('/auth/login', { email, password })
            login(res.data.token, {
                id: res.data.userId,
                email: res.data.email,
                role: res.data.role || 'RIDER'
            })
            toast.success('Welcome back!')
            navigate(res.data.role === 'DRIVER' ? '/driver' : '/rider/home')
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid credentials')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen overflow-hidden font-sans">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-600 to-pink-500 opacity-90" role="presentation"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptMCAxMmMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptLTE4IDBjMy4zMTQgMCA2IDIuNjg2IDYgNnMtMi42ODYgNi02IDYtNi0yLjY4Ni02LTYgMi42ODYtNiA2LTZ6bTAtMTJjMy4zMTQgMCA2IDIuNjg2IDYgNnMtMi42ODYgNi02IDYtNi0yLjY4Ni02LTYgMi42ODYtNiA2LTZ6IiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48L2c+PC9zdmc+')] opacity-20" role="presentation"></div>

            {/* Floating orbs - hidden on mobile for performance */}
            <div className="hidden md:block absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" aria-hidden="true"></div>
            <div className="hidden md:block absolute bottom-20 right-10 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl animate-pulse" aria-hidden="true"></div>

            {/* Content */}
            <main className="relative z-10 min-h-screen flex flex-col justify-center p-6 md:p-10">
                <div className="max-w-md mx-auto w-full">
                    {/* Logo */}
                    <div className="mb-12 text-center animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-2xl shadow-black/20 mb-6" aria-label="Uber Mini Logo">
                            <span className="text-primary text-4xl font-black" aria-hidden="true">U</span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tight mb-3 drop-shadow-lg">Welcome Back</h1>
                        <p className="text-xl text-white/80 font-medium flex items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5" aria-hidden="true" />
                            Let's get you back on the road
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="glass backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-2xl border border-white/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="group">
                                    <label htmlFor="email" className="sr-only">Email or phone number</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email or phone"
                                        className="w-full bg-white/90 border-2 border-white/50 rounded-2xl px-6 py-4 text-lg font-semibold outline-none transition-all focus:bg-white focus:border-primary focus:scale-[1.02] focus:shadow-xl focus:shadow-primary/20"
                                        required
                                        aria-required="true"
                                    />
                                </div>
                                <div className="group">
                                    <label htmlFor="password" className="sr-only">Password</label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Password"
                                        className="w-full bg-white/90 border-2 border-white/50 rounded-2xl px-6 py-4 text-lg font-semibold outline-none transition-all focus:bg-white focus:border-primary focus:scale-[1.02] focus:shadow-xl focus:shadow-primary/20"
                                        required
                                        aria-required="true"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Link to="/forgot-password" className="text-white/90 font-bold text-sm hover:text-white transition-colors">
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                aria-busy={loading}
                                className="w-full bg-white text-primary font-black text-xl py-5 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
                            >
                                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-white/80 font-medium">
                                New here?{' '}
                                <Link to="/register" className="text-white font-black hover:underline">
                                    Create an account
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Footer tagline */}
                    <p className="text-center text-white/60 text-sm font-medium mt-8 animate-in fade-in duration-1000 delay-500">
                        Your ride. Your rules. Premium experience.
                    </p>
                </div>
            </main>
        </div>
    )
}
