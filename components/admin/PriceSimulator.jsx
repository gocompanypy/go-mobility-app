import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Calculator, MapPin, Clock, ArrowRight } from 'lucide-react';
import { theme } from '@/components/go/theme';

export default function PriceSimulator({ configs }) {
    const [distance, setDistance] = useState(5.0); // km
    const [duration, setDuration] = useState(15); // min
    const [results, setResults] = useState([]);

    useEffect(() => {
        calculatePrices();
    }, [distance, duration, configs]);

    const calculatePrices = () => {
        if (!configs || configs.length === 0) {
            setResults([]);
            return;
        }

        const calculated = configs.filter(c => c.is_active).map(config => {
            let price = config.base_fare +
                (config.price_per_km * distance) +
                (config.price_per_min * duration) +
                (config.booking_fee || 0);

            // Apply minimum fare rule
            price = Math.max(price, config.minimum_fare);

            return {
                ...config,
                estimatedPrice: price
            };
        }).sort((a, b) => a.estimatedPrice - b.estimatedPrice);

        setResults(calculated);
    };

    return (
        <Card className="bg-[#1A1A2E] border-[#2D2D44] mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Calculator className="text-[#FFD700]" />
                    Simulador de Tarifas en Tiempo Real
                </CardTitle>
                <p className="text-gray-400 text-sm">
                    Ajusta la distancia y el tiempo para ver cómo cambian los precios según tu configuración actual.
                </p>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Controls */}
                    <div className="space-y-6 lg:col-span-1 border-r border-[#2D2D44] pr-6">
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Label className="text-white flex items-center gap-2">
                                    <MapPin size={16} className="text-[#FFD700]" /> Distancia (km)
                                </Label>
                                <span className="text-[#FFD700] font-bold">{distance.toFixed(1)} km</span>
                            </div>
                            <Slider
                                value={[distance]}
                                min={1}
                                max={50}
                                step={0.5}
                                onValueChange={(vals) => setDistance(vals[0])}
                                className="py-2"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Label className="text-white flex items-center gap-2">
                                    <Clock size={16} className="text-[#FFD700]" /> Duración (min)
                                </Label>
                                <span className="text-[#FFD700] font-bold">{duration} min</span>
                            </div>
                            <Slider
                                value={[duration]}
                                min={5}
                                max={120}
                                step={1}
                                onValueChange={(vals) => setDuration(vals[0])}
                                className="py-2"
                            />
                        </div>

                        <div className="p-4 bg-[#252538] rounded-xl text-sm text-gray-400">
                            <p>Ruta estimada:</p>
                            <div className="flex items-center gap-2 mt-2 font-mono text-white">
                                <span>Centro</span>
                                <ArrowRight size={14} />
                                <span>Aeropuerto</span>
                            </div>
                            <p className="mt-2 text-xs">
                                * Cálculo basado solo en tarifas base. No incluye Surge Pricing.
                            </p>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.map((res) => {
                            const vehicleConfig = theme.vehicleTypes[res.vehicle_type] || {};
                            return (
                                <div key={res.id} className="flex items-center justify-between p-4 rounded-xl border border-[#2D2D44] bg-[#0F0F1A] hover:bg-[#252538] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">{vehicleConfig.icon || '🚗'}</div>
                                        <div>
                                            <p className="font-bold text-white uppercase text-sm">
                                                {res.display_name || res.vehicle_type}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Base: {res.base_fare.toLocaleString()} | Min: {res.minimum_fare.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[#FFD700] font-bold text-lg">
                                            Gs. {Math.round(res.estimatedPrice).toLocaleString('es-PY')}
                                        </p>
                                        {res.estimatedPrice <= res.minimum_fare && (
                                            <span className="text-[10px] text-yellow-500 bg-yellow-500/10 px-1 rounded">
                                                Tarifa Mínima
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
