import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Navigation, History, Star, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const AddressInput = ({ savedPlaces = [], onSelect, type, ...props }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(props.value || '');
    const [predictions, setPredictions] = useState([]);
    const [sessionToken, setSessionToken] = useState(null);

    const containerRef = useRef(null);
    const autocompleteService = useRef(null);
    const placesService = useRef(null);

    // Initial value sync
    useEffect(() => {
        setSearchTerm(props.value || '');
    }, [props.value]);

    // Initialize Google Services
    useEffect(() => {
        const initServices = () => {
            if (window.google && window.google.maps && window.google.maps.places) {
                autocompleteService.current = new window.google.maps.places.AutocompleteService();
                // We need a dummy element for PlacesService, or use Geocoder. 
                // PlacesService is better for Place ID details.
                const dummyDiv = document.createElement('div');
                placesService.current = new window.google.maps.places.PlacesService(dummyDiv);

                // Create session token for billing efficiency
                setSessionToken(new window.google.maps.places.AutocompleteSessionToken());
            }
        };

        // Try to init immediately or wait for script
        if (window.google) {
            initServices();
        } else {
            const interval = setInterval(() => {
                if (window.google) {
                    initServices();
                    clearInterval(interval);
                }
            }, 500);
            return () => clearInterval(interval);
        }
    }, []);

    // Fetch predictions (Debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!searchTerm || searchTerm.length < 3) {
                setPredictions([]);
                return;
            }

            // Fallback mocks if no API or error
            const runMocks = () => {
                const mocks = [
                    { place_id: 'mock1', description: 'Shopping del Sol, Asunción', structured_formatting: { main_text: 'Shopping del Sol', secondary_text: 'Asunción' } },
                    { place_id: 'mock2', description: 'Aeropuerto Silvio Pettirossi, Luque', structured_formatting: { main_text: 'Aeropuerto Silvio Pettirossi', secondary_text: 'Luque' } },
                    { place_id: 'mock3', description: 'Paseo La Galería, Asunción', structured_formatting: { main_text: 'Paseo La Galería', secondary_text: 'Asunción' } },
                ];
                setPredictions(mocks.filter(p => p.description.toLowerCase().includes(searchTerm.toLowerCase())));
            };

            if (autocompleteService.current) {
                try {
                    autocompleteService.current.getPlacePredictions({
                        input: searchTerm,
                        sessionToken: sessionToken,
                        componentRestrictions: { country: 'py' }, // Limit to Paraguay
                    }, (results, status) => {
                        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                            setPredictions(results);
                        } else {
                            runMocks(); // Fallback if query fails (e.g. key invalid)
                        }
                    });
                } catch (e) {
                    runMocks();
                }
            } else {
                runMocks();
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, sessionToken]);


    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleFocus = () => setIsOpen(true);

    const handleChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (props.onChange) props.onChange(value);
        setIsOpen(true);
    };

    const handleSelectPrediction = (prediction) => {
        setSearchTerm(prediction.description);
        setIsOpen(false);

        // Convert Place ID to Lat/Lng
        if (placesService.current && prediction.place_id && !prediction.place_id.startsWith('mock')) {
            placesService.current.getDetails({
                placeId: prediction.place_id,
                fields: ['geometry', 'formatted_address', 'name']
            }, (place, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry) {
                    const result = {
                        id: prediction.place_id,
                        address: prediction.structured_formatting.main_text, // Short name
                        full_address: place.formatted_address,
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    };
                    if (onSelect) onSelect(result);

                    // Refresh token after use
                    setSessionToken(new window.google.maps.places.AutocompleteSessionToken());
                } else {
                    toast.error("Error al obtener detalles de la ubicación");
                }
            });
        } else {
            // Check for mock coords
            const mocks = {
                'mock1': { lat: -25.2800, lng: -57.5700 },
                'mock2': { lat: -25.2400, lng: -57.5200 },
                'mock3': { lat: -25.2840, lng: -57.5700 },
            };
            const mock = mocks[prediction.place_id] || { lat: -25.2867, lng: -57.6470 };

            if (onSelect) onSelect({
                id: prediction.place_id,
                address: prediction.structured_formatting.main_text,
                lat: mock.lat,
                lng: mock.lng
            });
        }
    };

    const handleSelectMap = () => {
        setIsOpen(false);
        if (onSelect) onSelect({ id: 'map-pin', address: 'Seleccionar en mapa', lat: null, lng: null });
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {type === 'pickup' ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-white ring-4 ring-[#FFD700]/30 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                    ) : (
                        <div className="w-2 h-2 rounded-full bg-[#FFD700] ring-4 ring-[#FFD700]/20" />
                    )}
                </div>
                <Input
                    {...props}
                    value={searchTerm}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    className="pl-10 bg-[#252538] border-[#2D2D44] text-white placeholder:text-gray-500 focus:border-[#FFD700] focus:ring-[#FFD700]/20 transition-all h-14 rounded-xl"
                    placeholder={type === 'pickup' ? "Punto de partida" : "¿A dónde vas?"}
                    autoComplete="off"
                />
                {!window.google && isOpen && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-500 animate-pulse">
                        <AlertCircle size={16} />
                    </div>
                )}
                {searchTerm && (
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            if (props.onChange) props.onChange('');
                            setIsOpen(true);
                            setPredictions([]);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Dropdown Suggestions */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1A] border border-[#2D2D44] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-[300px] overflow-y-auto">
                        {/* Map Option */}
                        <button
                            onClick={handleSelectMap}
                            className="w-full flex items-center gap-3 p-4 hover:bg-[#252538] transition-colors border-b border-[#2D2D44] group"
                        >
                            <div className="w-10 h-10 rounded-full bg-[#FFD700]/10 flex items-center justify-center group-hover:bg-[#FFD700] transition-colors">
                                <MapPin size={20} className="text-[#FFD700] group-hover:text-black" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-white">Fijar en el mapa</p>
                                <p className="text-xs text-gray-400">Elige la ubicación exacta</p>
                            </div>
                        </button>

                        {/* Recent/Saved Places */}
                        {savedPlaces.length > 0 && !searchTerm && (
                            <div className="p-2">
                                <p className="text-xs font-bold text-gray-500 uppercase px-2 mb-1">Guardados</p>
                                {savedPlaces.map(place => (
                                    <button
                                        key={place.id}
                                        onClick={() => handleSelectPrediction({
                                            place_id: place.id,
                                            description: place.address,
                                            structured_formatting: { main_text: place.address, secondary_text: '' }
                                        })}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-[#252538] rounded-lg transition-colors text-left"
                                    >
                                        <Star size={16} className="text-gray-400" />
                                        <span className="text-sm text-gray-200">{place.address}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* API Suggestions */}
                        <div className="p-2">
                            {predictions.length > 0 ? (
                                <>
                                    <p className="text-xs font-bold text-gray-500 uppercase px-2 mb-1">Resultados</p>
                                    {predictions.map(item => (
                                        <button
                                            key={item.place_id}
                                            onClick={() => handleSelectPrediction(item)}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-[#252538] rounded-lg transition-colors text-left"
                                        >
                                            <Navigation size={16} className="text-gray-400 shrink-0" />
                                            <div className="truncate">
                                                <p className="text-sm text-gray-200 truncate">{item.structured_formatting.main_text}</p>
                                                <p className="text-xs text-gray-500 truncate">{item.structured_formatting.secondary_text}</p>
                                            </div>
                                        </button>
                                    ))}
                                </>
                            ) : searchTerm.length > 2 && (
                                <div className="p-4 text-center text-gray-500 text-sm">
                                    No se encontraron resultados
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressInput;
