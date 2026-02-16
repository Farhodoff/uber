import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import api from "@/services/api"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { login } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const res = await api.post('/auth/login', {
                email,
                password
            })

            login(res.data.token, {
                id: res.data.userId,
                email: res.data.email,
                role: res.data.role || 'RIDER' // Default to RIDER if not returned
            })

            if (res.data.role === 'DRIVER') {
                navigate('/driver')
            } else {
                navigate('/rider')
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Login failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[100px]" />

            <Card className="w-full max-w-md z-10 border-white/10 bg-black/50 backdrop-blur-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-white/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                        {/* Logo Placeholder */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-white"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" /></svg>
                    </div>
                    <CardTitle className="text-3xl font-bold text-white">Welcome Back</CardTitle>
                    <p className="text-gray-400">Enter your credentials to continue</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button disabled={loading} className="w-full text-lg h-12 bg-gradient-to-r from-primary to-secondary">
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                        <div className="text-center text-sm text-gray-400">
                            Don't have an account?{" "}
                            <Link to="/register" className="text-secondary hover:underline">
                                Sign Up
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
