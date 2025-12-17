import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icons
const createCustomIcon = (color, html) => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background: ${color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${html}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
    });
};

const pickupIcon = createCustomIcon('#10B981', '🎯');
const dropoffIcon = createCustomIcon('#EF4444', '📍');
const driverIcon = createCustomIcon('#FFD700', '🚗');

function MapUpdater({ center, zoom }) {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.setView(center, zoom);
        }
    }, [center, zoom, map]);

    return null;
}

export default function LiveMap({
    pickupLat,
    pickupLng,
    dropoffLat,
    dropoffLng,
    driverLat,
    driverLng,
    className = ''
}) {
    const hasPickup = pickupLat && pickupLng;
    const hasDropoff = dropoffLat && dropoffLng;
    const hasDriver = driverLat && driverLng;

    // Calculate center and bounds
    const getCenter = () => {
        if (hasDriver) return [driverLat, driverLng];
        if (hasPickup) return [pickupLat, pickupLng];
        return [40.4168, -3.7038]; // Madrid default
    };

    const getZoom = () => {
        if (hasPickup && hasDropoff) return 13;
        if (hasPickup || hasDriver) return 15;
        return 12;
    };

    // Route line
    const routePositions = [];
    if (hasPickup) routePositions.push([pickupLat, pickupLng]);
    if (hasDropoff) routePositions.push([dropoffLat, dropoffLng]);

    return (
        <div className={className}>
            <MapContainer
                center={getCenter()}
                zoom={getZoom()}
                className="h-full w-full rounded-xl"
                style={{ minHeight: '300px' }}
            >
                <MapUpdater center={getCenter()} zoom={getZoom()} />

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Pickup Marker */}
                {hasPickup && (
                    <Marker position={[pickupLat, pickupLng]} icon={pickupIcon}>
                        <Popup>Recogida</Popup>
                    </Marker>
                )}

                {/* Dropoff Marker */}
                {hasDropoff && (
                    <Marker position={[dropoffLat, dropoffLng]} icon={dropoffIcon}>
                        <Popup>Destino</Popup>
                    </Marker>
                )}

                {/* Driver Marker */}
                {hasDriver && (
                    <Marker position={[driverLat, driverLng]} icon={driverIcon}>
                        <Popup>Conductor</Popup>
                    </Marker>
                )}

                {/* Route Line */}
                {routePositions.length > 1 && (
                    <Polyline
                        positions={routePositions}
                        pathOptions={{
                            color: '#FFD700',
                            weight: 4,
                            opacity: 0.8,
                            dashArray: '10, 10'
                        }}
                    />
                )}
            </MapContainer>
        </div>
    );
}
