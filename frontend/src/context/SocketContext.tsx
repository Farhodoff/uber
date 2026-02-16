import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'

interface SocketContextType {
    socket: Socket | null
    isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false })

export const useSocket = () => useContext(SocketContext)

interface SocketProviderProps {
    children: ReactNode
}

export function SocketProvider({ children }: SocketProviderProps) {
    const { user, token } = useAuth()
    const [socket, setSocket] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        if (!token || !user) {
            // Disconnect if no auth
            if (socket) {
                socket.disconnect()
                setSocket(null)
                setIsConnected(false)
            }
            return
        }

        // Connect to socket server
        const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000'
        const newSocket = io(socketUrl, {
            auth: { token },
            transports: ['websocket', 'polling']
        })

        newSocket.on('connect', () => {
            console.log('✅ Socket connected:', newSocket.id)
            setIsConnected(true)
        })

        newSocket.on('disconnect', () => {
            console.log('❌ Socket disconnected')
            setIsConnected(false)
        })

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error)
            setIsConnected(false)
        })

        setSocket(newSocket)

        return () => {
            newSocket.disconnect()
        }
    }, [token, user])

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    )
}
