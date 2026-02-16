import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import api from '@/services/api'

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
            const res = await api.post('/auth/register', { name, email, password, role })
            login(res.data.token, {
                id: res.data.userId,
                email: res.data.email,
                role: res.data.role || role
            })
            toast.success('Account created successfully!')
            navigate(role === 'DRIVER' ? '/driver' : '/rider/home')
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Simple header */}
            <div className="p-6">
                <Link to="/" className="text-2xl font-bold">Uber</Link>
            </div>

            {/* Main content */}
            <div className="flex-1 flex items-center justify-center px-6 pb-20">
                <div className="w-full max-w-sm">
                    <h1 className="text-4xl font-medium text-gray-900 mb-12">Create your account</h1>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Name input */}
                        <div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full px-0 py-3 text-lg bg-transparent border-0 border-b-2 border-gray-300 focus:border-black focus:ring-0 placeholder:text-gray-400 transition-colors outline-none"
                                required
                            />
                        </div>

                        {/* Email input */}
                        <div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full px-0 py-3 text-lg bg-transparent border-0 border-b-2 border-gray-300 focus:border-black focus:ring-0 placeholder:text-gray-400 transition-colors outline-none"
                                required
                            />
                        </div>

                        {/* Password input */}
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password"
                                className="w-full px-0 py-3 text-lg bg-transparent border-0 border-b-2 border-gray-300 focus:border-black focus:ring-0 placeholder:text-gray-400 transition-colors outline-none"
                                required
                            />
                        </div>

                        {/* Role selection - minimal version */}
                        <div>
                            <p className="text-sm text-gray-700 mb-3">I want to</p>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole('RIDER')}
                                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${role === 'RIDER'
                                            ? 'border-black bg-black text-white'
                                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                        }`}
                                >
                                    Ride
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('DRIVER')}
                                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${role === 'DRIVER'
                                            ? 'border-black bg-black text-white'
                                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                        }`}
                                >
                                    Drive
                                </button>
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white font-medium text-lg py-4 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500">or</span>
                        </div>
                    </div>

                    {/* Sign in link */}
                    <Link to="/login">
                        <button
                            type="button"
                            className="w-full border-2 border-gray-900 text-gray-900 font-medium text-lg py-4 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Sign in
                        </button>
                    </Link>

                    {/* Footer */}
                    <div className="text-xs text-gray-500 mt-8 text-center">
                        By creating an account, you agree to our{' '}
                        <button className="underline hover:text-gray-900">Terms of Service</button>
                        {' '}and{' '}
                        <button className="underline hover:text-gray-900">Privacy Policy</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
