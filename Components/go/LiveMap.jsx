import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Car, Navigation } from 'lucide-react';

// Custom icons
const createIcon = (color) => new L.Input({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Custom svg icons for better quality
const getSvgIcon = (type) => {
    let html = '';

    if (type === 'car') {
        html = `<div style="background-color: #000; border: 2px solid #FFD700; border-radius: 50%; width: 36px; height: 36px; display: flex; items-center; justify-content: center; box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
        </div>`;
    } else if (type === 'pickup') {
        html = `<div style="background-color: #00D4B1; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 4px 8px rgba(0,0,0,0.3);"></div>`;
    } else if (type === 'dropoff') {
        html = `<div style="background-color: #FFD700; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 4px 8px rgba(0,0,0,0.3);"></div>`;
    }

    return L.divIcon({
        className: 'custom-icon',
        html: html,
        iconSize: type === 'car' ? [36, 36] : [24, 24],
        iconAnchor: type === 'car' ? [18, 18] : [12, 12],
    });
};

// Component to handle map center updates
function MapUpdater({ center, type }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 15, {
                duration: 1.5,
                easeLinearity: 0.25
            });
        }
    }, [center, map]);
    return null;
}

// Component to handle drag events for "interactive" mode
function MapEvents({ onCenterChange, interactive }) {
    const map = useMap();
    const mapEvents = useMapEvents({
        moveend: () => {
            if (interactive && onCenterChange) {
                const center = map.getCenter();
                onCenterChange({ lat: center.lat, lng: center.lng });
            }
        },
        dragend: () => {
            // Trigger haptic feedback if available (simulated)
        }
    });
    return null;
}

const LiveMap = ({
    pickupLat,
    pickupLng,
    dropoffLat,
    dropoffLng,
    driverLat,
    driverLng,
    className,
    interactive = false,
    onCenterChange,
    nearbyDrivers = [] // Array of {lat, lng, rotation}
}) => {
    // Default center (Asunción, Paraguay for context or Madrid as default)
    const defaultCenter = [pickupLat || -25.2867, pickupLng || -57.6470];
    const isPickupActive = pickupLat && pickupLng;
    const isDropoffActive = dropoffLat && dropoffLng;
    const isDriverActive = driverLat && driverLng;

    // Simulated nearby drivers if none provided
    const [simulatedDrivers, setSimulatedDrivers] = useState([]);

    useEffect(() => {
        if (nearbyDrivers.length > 0) {
            setSimulatedDrivers(nearbyDrivers);
        } else {
            setSimulatedDrivers([]);
        }
    }, [pickupLat, pickupLng, nearbyDrivers]);

    return (
        <div className={`relative w-full h-full ${className}`}>
            <MapContainer
                center={defaultCenter}
                zoom={14}
                className="w-full h-full z-0"
                zoomControl={false}
                attributionControl={false}
            >
                {/* Dark Theme Tile Layer - "CartoDB Dark Matter" */}
                {/* This fits the "Retro/Silver" premium aesthetic requested */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {/* Map Interface Handlers */}
                <MapUpdater center={isPickupActive ? [pickupLat, pickupLng] : defaultCenter} />
                <MapEvents onCenterChange={onCenterChange} interactive={interactive} />

                {/* Markers */}
                {isPickupActive && !interactive && (
                    <Marker position={[pickupLat, pickupLng]} icon={getSvgIcon('pickup')} />
                )}

                {isDropoffActive && !interactive && (
                    <Marker position={[dropoffLat, dropoffLng]} icon={getSvgIcon('dropoff')} />
                )}

                {isDriverActive && (
                    <Marker position={[driverLat, driverLng]} icon={getSvgIcon('car')} />
                )}

                {/* Nearby Simulated Drivers */}
                {!isDriverActive && simulatedDrivers.map(driver => (
                    <Marker
                        key={driver.id}
                        position={[driver.lat, driver.lng]}
                        icon={getSvgIcon('car')}
                        opacity={0.7}
                    />
                ))}
            </MapContainer>

            {/* Overlay Gradient for premium feel */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-[400]" />
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-[400]" />
        </div>
    );
};

export default LiveMap;
