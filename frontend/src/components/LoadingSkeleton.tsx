export function LoadingSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
    )
}

export function CardSkeleton() {
    return (
        <div className="border border-white/10 bg-black/50 backdrop-blur-xl rounded-lg p-6 animate-pulse">
            <div className="flex justify-between mb-4">
                <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-700 rounded w-24"></div>
                    <div className="h-8 bg-gray-700 rounded w-32"></div>
                </div>
                <div className="h-6 bg-gray-700 rounded w-16"></div>
            </div>
            <div className="space-y-3">
                <div className="h-4 bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            </div>
        </div>
    )
}

export function MapSkeleton() {
    return (
        <div className="w-full h-full bg-gray-900 animate-pulse flex items-center justify-center">
            <div className="text-gray-600">Loading map...</div>
        </div>
    )
}
