import React, { useEffect, useState, useRef, useCallback } from 'react';
import Map, { Marker, NavigationControl, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Car, Navigation, MapPin } from 'lucide-react';

// Default token if none provided (User needs to replace this)
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "pk.eyJ1IjoiZ29tb2JpbGl0eXVzZXIiLCJhIjoiY2x0eHdwMXJqMDFrazJqcW53Z3J2Y3Z0ZSJ9.PLACEHOLDER_KEY";

const LiveMapbox = ({
    pickupLat,
    pickupLng,
    dropoffLat,
    dropoffLng,
    driverLat,
    driverLng,
    className,
    interactive = false,
    onCenterChange,
    nearbyDrivers = [],
    routeGeoJSON = null
}) => {
    const mapRef = useRef(null);
    const [viewState, setViewState] = useState({
        latitude: -25.2867,
        longitude: -57.6470,
        zoom: 14,
        pitch: 45, // 3D effect
        bearing: 0
    });

    // Update view when pickup changes (flyTo effect)
    useEffect(() => {
        if (pickupLat && pickupLng && mapRef.current) {
            mapRef.current.flyTo({
                center: [pickupLng, pickupLat],
                zoom: 16,
                duration: 2000,
                essential: true
            });
        }
    }, [pickupLat, pickupLng]);

    const handleMove = useCallback((evt) => {
        setViewState(evt.viewState);
        if (interactive && onCenterChange) {
            onCenterChange({ lat: evt.viewState.latitude, lng: evt.viewState.longitude });
        }
    }, [interactive, onCenterChange]);

    const isPickupActive = pickupLat && pickupLng;
    const isDropoffActive = dropoffLat && dropoffLng;
    const isDriverActive = driverLat && driverLng;

    return (
        <div className={`relative w-full h-full ${className} overflow-hidden rounded-none`}>
            <Map
                {...viewState}
                ref={mapRef}
                onMove={handleMove}
                mapStyle="mapbox://styles/mapbox/navigation-night-v1" // Premium Dark Mode
                mapboxAccessToken={MAPBOX_TOKEN}
                style={{ width: '100%', height: '100%' }}
                attributionControl={false}
                dragPan={true} // Always allow drag
                touchZoomRotate={true}
            >
                {/* Pickup Marker */}
                {isPickupActive && !interactive && (
                    <Marker longitude={pickupLng} latitude={pickupLat} anchor="bottom">
                        <div className="relative flex flex-col items-center">
                            <div className="w-3 h-3 bg-[#00D4B1] rounded-full ring-4 ring-[#00D4B1]/30 animate-pulse" />
                            <div className="absolute -bottom-1 w-1 h-4 bg-black/50 blur-[2px]" />
                        </div>
                    </Marker>
                )}

                {/* Dropoff Marker */}
                {isDropoffActive && !interactive && (
                    <Marker longitude={dropoffLng} latitude={dropoffLat} anchor="bottom">
                        <MapPin size={32} className="text-[#FFD700] drop-shadow-lg" fill="black" />
                    </Marker>
                )}

                {/* Active Driver */}
                {isDriverActive && (
                    <Marker longitude={driverLng} latitude={driverLat}>
                        <div className="p-2 bg-[#FFD700] rounded-full shadow-[0_0_20px_rgba(255,215,0,0.6)]">
                            <Car size={20} className="text-black" />
                        </div>
                    </Marker>
                )}

                {/* Route Visualization */}
                {routeGeoJSON && (
                    <Source id="route" type="geojson" data={routeGeoJSON}>
                        <Layer
                            id="route-line"
                            type="line"
                            paint={{
                                'line-color': '#00D4B1',
                                'line-width': 5,
                                'line-opacity': 0.8,
                                'line-blur': 1
                            }}
                            layout={{
                                'line-join': 'round',
                                'line-cap': 'round'
                            }}
                        />
                        {/* Glow Effect Layer */}
                        <Layer
                            id="route-glow"
                            type="line"
                            paint={{
                                'line-color': '#00D4B1',
                                'line-width': 12,
                                'line-opacity': 0.3,
                                'line-blur': 10
                            }}
                            layout={{
                                'line-join': 'round',
                                'line-cap': 'round'
                            }}
                        />
                    </Source>
                )}

                {/* Simulated Nearby Drivers */}
                {!isDriverActive && nearbyDrivers.map(driver => (
                    <Marker
                        key={driver.id}
                        longitude={driver.lng}
                        latitude={driver.lat}
                        rotation={driver.rotation || 0}
                    >
                        <img
                            src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png" // Placeholder or car icon
                            style={{ width: 24, height: 24, opacity: 0.8 }}
                            alt="Semiconductor"
                        />
                        {/* Better Car Icon */}
                        <div style={{ transform: `rotate(${driver.rotation}deg)` }} className="transition-all duration-1000">
                            <div className="w-8 h-8 bg-black border border-[#FFD700] rounded-full flex items-center justify-center shadow-lg">
                                <Car size={16} className="text-[#FFD700]" />
                            </div>
                        </div>
                    </Marker>
                ))}
            </Map>

            {/* Premium Overlays */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />
        </div>
    );
};

export default LiveMapbox;
