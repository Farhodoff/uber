import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon, LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import LiveCars from './LiveCars'

// Fix for default marker icons in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png'

delete (Icon.Default.prototype as any)._getIconUrl
Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetina,
    iconUrl: icon,
    shadowUrl: iconShadow,
})

// Custom icons
const pickupIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

const dropoffIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

const driverIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

interface Location {
    lat: number
    lng: number
}

interface LeafletMapProps {
    pickup?: Location | null
    dropoff?: Location | null
    driverLocation?: Location | null
}

// Auto-fit map to markers with Smart Zoom
function FitBounds({ pickup, dropoff, driverLocation }: LeafletMapProps) {
    const map = useMap()
    const [hasZoomed, setHasZoomed] = useState(false)

    useEffect(() => {
        if (!map) return

        const bounds: L.LatLngTuple[] = []
        if (pickup) bounds.push([pickup.lat, pickup.lng])
        if (dropoff) bounds.push([dropoff.lat, dropoff.lng])
        if (driverLocation) bounds.push([driverLocation.lat, driverLocation.lng])

        if (bounds.length > 0) {
            // Smart Zoom: If only pickup is set (initial state), zoom close to it
            if (bounds.length === 1 && pickup && !dropoff) {
                map.flyTo([pickup.lat, pickup.lng], 16, { duration: 2 })
            } else {
                // If route/driver exists, fit all bounds
                map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [50, 50], maxZoom: 15, animate: true, duration: 1.5 })
            }
        }
    }, [pickup, dropoff, driverLocation, map])

    return null
}

export default function LeafletMap({ pickup, dropoff, driverLocation }: LeafletMapProps) {
    const defaultCenter: LatLngExpression = [41.2995, 69.2401] // Tashkent

    return (
        <MapContainer
            center={defaultCenter}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            className="z-0"
        >
            {/* Dark Matter Map Style (Premium Look) */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
            />
            {/* Adding separate labels layer for crisp text */}
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
            />

            <LiveCars />

            <FitBounds pickup={pickup} dropoff={dropoff} driverLocation={driverLocation} />

            {pickup && (
                <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
                    <Popup>Pickup Location</Popup>
                </Marker>
            )}

            {dropoff && (
                <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffIcon}>
                    <Popup>Dropoff Location</Popup>
                </Marker>
            )}

            {driverLocation && (
                <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
                    <Popup>Driver Location</Popup>
                </Marker>
            )}
        </MapContainer>
    )
}
