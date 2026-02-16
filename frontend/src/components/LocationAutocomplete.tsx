import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import api from "@/services/api"

interface LocationSuggestion {
    place_id: string
    description: string
}

interface LocationResult {
    placeId: string
    description: string
    lat?: number
    lng?: number
}

interface LocationAutocompleteProps {
    placeholder?: string
    value: string
    onChange: (value: string) => void
    onSelect: (location: LocationResult) => void
    className?: string
}

export default function LocationAutocomplete({
    placeholder = "Enter location",
    value,
    onChange,
    onSelect,
    className = ""
}: LocationAutocompleteProps) {
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const debounceTimer = useRef<NodeJS.Timeout>()
    const wrapperRef = useRef<HTMLDivElement>(null)

    // Debounced search
    useEffect(() => {
        if (value.length < 2) {
            setSuggestions([])
            return
        }

        setLoading(true)
        clearTimeout(debounceTimer.current)

        debounceTimer.current = setTimeout(async () => {
            try {
                const res = await api.get('/locations/autocomplete', {
                    params: { input: value }
                })
                setSuggestions(res.data.predictions || [])
                setIsOpen(true)
            } catch (error) {
                console.error('Autocomplete error:', error)
                setSuggestions([])
            } finally {
                setLoading(false)
            }
        }, 300)

        return () => clearTimeout(debounceTimer.current)
    }, [value])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = async (suggestion: LocationSuggestion) => {
        onChange(suggestion.description)
        setIsOpen(false)
        setSuggestions([])

        // Fetch lat/lng from place_id
        try {
            const res = await api.get('/locations/geocode', {
                params: { placeId: suggestion.place_id }
            })
            const location = res.data.result?.geometry?.location
            onSelect({
                placeId: suggestion.place_id,
                description: suggestion.description,
                lat: location?.lat,
                lng: location?.lng
            })
        } catch (error) {
            console.error('Geocode error:', error)
            onSelect({
                placeId: suggestion.place_id,
                description: suggestion.description
            })
        }
    }

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <Input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setIsOpen(true)}
                className="bg-white/5 border-white/10"
            />

            {loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
            )}

            {isOpen && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden shadow-xl max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion) => (
                        <div
                            key={suggestion.place_id}
                            onClick={() => handleSelect(suggestion)}
                            className="px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/5 last:border-b-0"
                        >
                            <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-400 flex-shrink-0">
                                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <span className="text-sm text-white">{suggestion.description}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
