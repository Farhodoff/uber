import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { Icon, LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'

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

// Auto-fit map to markers
function FitBounds({ pickup, dropoff, driverLocation }: LeafletMapProps) {
    const map = useMap()

    useEffect(() => {
        const bounds: LatLngExpression[] = []
        if (pickup) bounds.push([pickup.lat, pickup.lng])
        if (dropoff) bounds.push([dropoff.lat, dropoff.lng])
        if (driverLocation) bounds.push([driverLocation.lat, driverLocation.lng])

        if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
        }
    }, [pickup, dropoff, driverLocation, map])

    return null
}

export default function LeafletMap({ pickup, dropoff, driverLocation }: LeafletMapProps) {
    const defaultCenter: LatLngExpression = [41.2995, 69.2401] // Tashkent

    const routeCoordinates: LatLngExpression[] = []
    if (pickup) routeCoordinates.push([pickup.lat, pickup.lng])
    if (dropoff) routeCoordinates.push([dropoff.lat, dropoff.lng])

    return (
        <MapContainer
            center={defaultCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

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

            {routeCoordinates.length === 2 && (
                <Polyline
                    positions={routeCoordinates}
                    color="#6366f1"
                    weight={4}
                    opacity={0.7}
                />
            )}

            <FitBounds pickup={pickup} dropoff={dropoff} driverLocation={driverLocation} />
        </MapContainer>
    )
}
