import React, { useEffect, useState, Component } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- Error Boundary for Map ---
class MapErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Map Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="w-full h-full bg-[#1A1A1A] flex flex-col items-center justify-center p-6 text-center border border-white/10 rounded-xl relative overflow-hidden">
                    {/* Fallback Static Map Background */}
                    <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/-57.6, -25.3,12,0/800x600?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGZ5...')] bg-cover bg-center opacity-30 blur-sm grayscale" />

                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-[#FFD700]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#FFD700]/30">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">Vista de Mapa Simplificada</h3>
                        <p className="text-gray-400 text-sm">El mapa interactivo se ha desactivado para mejorar el rendimiento.</p>
                        <p className="text-gray-500 text-xs mt-4">La navegación sigue activa en segundo plano.</p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// --- Fix Leaflet Default Icon Issues ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom svg icons for better quality
const getSvgIcon = (type) => {
    let html = '';

    if (type === 'car') {
        html = `<div style="background-color: #000; border: 2px solid #FFD700; border-radius: 50%; width: 36px; height: 36px; display: flex; items-center; justify-content: center; box-shadow: 0 0 10px rgba(255, 215, 0, 0.5); transform: rotate(0deg); transition: transform 0.5s;">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
        </div>`;
    } else if (type === 'pickup') {
        html = `<div style="background-color: #fff; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #FFD700; box-shadow: 0 0 15px rgba(255,255,255,0.6); position: relative;">
    <div style="position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%); width: 2px; height: 10px; background: #FFD700;"></div>
        </div>`;
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

function MapUpdater({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            const currentCenter = map.getCenter();
            const distance = Math.sqrt(
                Math.pow(currentCenter.lat - center[0], 2) +
                Math.pow(currentCenter.lng - center[1], 2)
            );
            if (distance > 0.0001) {
                map.flyTo(center, 15, { duration: 1.5, easeLinearity: 0.25 });
            }
        }
    }, [center, map]);
    return null;
}

function MapEvents({ onCenterChange, interactive }) {
    useMapEvents({
        moveend: (e) => {
            if (interactive && onCenterChange) {
                const center = e.target.getCenter();
                onCenterChange({ lat: center.lat, lng: center.lng });
            }
        },
    });
    return null;
}

const LiveMap = ({ pickupLat, pickupLng, dropoffLat, dropoffLng, driverLat, driverLng, className, interactive = false, onCenterChange, nearbyDrivers = [] }) => {
    const defaultCenter = [pickupLat || -25.2867, pickupLng || -57.6470];
    const isPickupActive = pickupLat && pickupLng;
    const isDropoffActive = dropoffLat && dropoffLng;
    const isDriverActive = driverLat && driverLng;
    const [simulatedDrivers, setSimulatedDrivers] = useState([]);
    const nearbyDriversKey = JSON.stringify(nearbyDrivers.map(d => ({ id: d.id, lat: d.lat, lng: d.lng })));

    useEffect(() => {
        if (nearbyDrivers.length > 0) {
            setSimulatedDrivers(nearbyDrivers);
        } else {
            setSimulatedDrivers([]);
        }
    }, [nearbyDriversKey]);

    return (
        <MapErrorBoundary>
            <div className={`relative w-full h-full ${className} bg-[#0F0F1A]`}>
                <MapContainer center={defaultCenter} zoom={15} className="w-full h-full z-0 outline-none" zoomControl={false} attributionControl={false} dragging={interactive} zoomAnimation={true} fadeAnimation={true}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' maxZoom={20} />
                    <MapUpdater center={isPickupActive ? [pickupLat, pickupLng] : defaultCenter} />
                    <MapEvents onCenterChange={onCenterChange} interactive={interactive} />
                    {isPickupActive && <Marker position={[pickupLat, pickupLng]} icon={getSvgIcon('pickup')} />}
                    {isDropoffActive && <Marker position={[dropoffLat, dropoffLng]} icon={getSvgIcon('dropoff')} />}
                    {isDriverActive && <Marker position={[driverLat, driverLng]} icon={getSvgIcon('car')} />}
                    {!isDriverActive && simulatedDrivers.map(driver => (
                        <Marker key={driver.id} position={[driver.lat, driver.lng]} icon={getSvgIcon('car')} opacity={0.7} />
                    ))}
                </MapContainer>
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none z-[400]" />
                <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none z-[400]" />
            </div>
        </MapErrorBoundary>
    );
};

export default LiveMap;
