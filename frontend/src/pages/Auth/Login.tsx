import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import api from '@/services/api'

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
            navigate('/rider/home')
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid credentials')
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
                    <h1 className="text-4xl font-medium text-gray-900 mb-12">Welcome back</h1>

                    <form onSubmit={handleSubmit} className="space-y-8">
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
                                placeholder="Enter your password"
                                className="w-full px-0 py-3 text-lg bg-transparent border-0 border-b-2 border-gray-300 focus:border-black focus:ring-0 placeholder:text-gray-400 transition-colors outline-none"
                                required
                            />
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white font-medium text-lg py-4 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                        >
                            {loading ? 'Please wait...' : 'Continue'}
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

                    {/* Sign up link */}
                    <Link to="/register">
                        <button
                            type="button"
                            className="w-full border-2 border-gray-900 text-gray-900 font-medium text-lg py-4 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Sign up
                        </button>
                    </Link>

                    {/* Footer links */}
                    <div className="mt-8 text-center space-y-4">
                        <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                            Forgot password?
                        </button>
                        <div className="text-xs text-gray-500 mt-4">
                            By proceeding, you agree to our{' '}
                            <button className="underline hover:text-gray-900">Terms of Service</button>
                            {' '}and{' '}
                            <button className="underline hover:text-gray-900">Privacy Policy</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
