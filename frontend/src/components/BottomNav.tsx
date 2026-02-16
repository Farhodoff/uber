import { useLocation, useNavigate } from "react-router-dom"
import { Home, Clock, User } from "lucide-react"

export default function BottomNav() {
    const navigate = useNavigate()
    const location = useLocation()

    const navItems = [
        { path: '/rider/home', icon: Home, label: 'Home' },
        { path: '/rider/history', icon: Clock, label: 'Activity' },
        { path: '/rider/profile', icon: User, label: 'Profile' },
    ]

    return (
        <nav className="bottom-nav animate-in slide-in-from-bottom-4 duration-500 fade-in" aria-label="Main navigation">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        aria-label={item.label}
                        aria-current={isActive ? 'page' : undefined}
                        className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {isActive && (
                            <div className="absolute inset-0 bg-primary-light/20 blur-xl rounded-full" />
                        )}
                        <item.icon
                            className={`w-6 h-6 z-10 transition-transform duration-300 ${isActive ? 'scale-110 stroke-[2.5px]' : 'scale-100'
                                }`}
                            aria-hidden="true"
                        />
                        {isActive && (
                            <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" aria-hidden="true" />
                        )}
                    </button>
                )
            })}
        </nav>
    )
}
