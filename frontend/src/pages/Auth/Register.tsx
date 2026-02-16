import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link, useNavigate } from "react-router-dom"
import api from "@/services/api"

export default function Register() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("RIDER")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            await api.post('/auth/register', {
                email,
                password,
                role
            })
            navigate('/login')
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[100px]" />

            <Card className="w-full max-w-md z-10 border-white/10 bg-black/50 backdrop-blur-xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-white">Create Account</CardTitle>
                    <p className="text-gray-400">Join the ride today</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <div className="flex gap-4">
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white glass focus:ring-2 focus:ring-primary"
                            >
                                <option value="RIDER" className="bg-black">I am a Rider</option>
                                <option value="DRIVER" className="bg-black">I am a Driver</option>
                            </select>
                        </div>
                        <Button disabled={loading} className="w-full text-lg h-12 bg-gradient-to-r from-secondary to-primary">
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                        <div className="text-center text-sm text-gray-400">
                            Already have an account?{" "}
                            <Link to="/login" className="text-primary hover:underline">
                                Login
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
