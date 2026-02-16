import { useEffect, useState } from 'react'
import { Marker } from 'react-leaflet'
import { Icon } from 'leaflet'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

// Custom car icon
const carIcon = new Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3097/3097180.png', // Minimalist top-down car
    shadowUrl: iconShadow,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    className: 'transition-all duration-1000 ease-linear' // Smooth movement
})

export default function LiveCars() {
    const [cars, setCars] = useState([
        { id: 1, lat: 41.2995, lng: 69.2401, dir: { lat: 0.0001, lng: 0.0001 } },
        { id: 2, lat: 41.3050, lng: 69.2450, dir: { lat: -0.0001, lng: 0.0002 } },
        { id: 3, lat: 41.2900, lng: 69.2350, dir: { lat: 0.0002, lng: -0.0001 } },
        { id: 4, lat: 41.3100, lng: 69.2500, dir: { lat: -0.0001, lng: -0.0001 } },
    ])

    useEffect(() => {
        const interval = setInterval(() => {
            setCars(prev => prev.map(car => {
                // Randomly change direction slightly
                const latChange = car.dir.lat + (Math.random() - 0.5) * 0.00005
                const lngChange = car.dir.lng + (Math.random() - 0.5) * 0.00005

                return {
                    ...car,
                    lat: car.lat + latChange,
                    lng: car.lng + lngChange,
                    dir: { lat: latChange, lng: lngChange }
                }
            }))
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    return (
        <>
            {cars.map(car => (
                <Marker
                    key={car.id}
                    position={[car.lat, car.lng]}
                    icon={carIcon}
                    opacity={0.8}
                />
            ))}
        </>
    )
}
