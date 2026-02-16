import { Component, ReactNode } from 'react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('Error caught by boundary:', error, errorInfo)
        // You can log to error reporting service here (e.g., Sentry)
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="min-h-screen bg-background flex items-center justify-center p-4">
                    <div className="text-center max-w-md">
                        <div className="mb-6">
                            <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                                <span className="text-4xl">⚠️</span>
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">Oops! Something went wrong</h1>
                            <p className="text-gray-400 mb-6">
                                We're sorry for the inconvenience. The error has been logged.
                            </p>
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="text-left bg-black/50 p-4 rounded-lg mb-4">
                                    <summary className="cursor-pointer text-sm text-gray-400 mb-2">Error Details</summary>
                                    <pre className="text-xs text-red-400 overflow-auto">
                                        {this.state.error.toString()}
                                    </pre>
                                </details>
                            )}
                        </div>
                        <div className="space-y-2">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full bg-primary hover:bg-primary/80 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
