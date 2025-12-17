import React from 'react';
import { Check, Users, Clock } from 'lucide-react';
import { theme } from './theme';

export default function VehicleSelector({
    vehicles = [],
    selected,
    onSelect,
    estimatedTime = 5
}) {
    const vehicleConfig = theme.vehicleTypes;

    return (
        <div className="space-y-2">
            {vehicles.map((vehicle) => {
                const config = vehicleConfig[vehicle.vehicle_type] || vehicleConfig.economy;
                const isSelected = selected === vehicle.vehicle_type;

                return (
                    <button
                        key={vehicle.vehicle_type}
                        onClick={() => onSelect(vehicle.vehicle_type)}
                        className={`w-full p-4 rounded-xl border-2 transition-all ${isSelected
                                ? 'border-[#00D4B1] bg-[#00D4B1]/10'
                                : 'border-[#2D2D44] bg-[#1A1A2E] hover:border-[#00D4B1]/50'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="text-3xl">{config.icon}</div>
                                <div className="text-left">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-white">{config.name}</span>
                                        {isSelected && (
                                            <Check size={16} className="text-[#00D4B1]" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400">{config.description}</p>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Users size={12} />
                                            {config.passengers}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {estimatedTime} min
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-white">
                                    €{vehicle.estimated_price?.toFixed(2) || '0.00'}
                                </p>
                                {vehicle.surge_multiplier > 1 && (
                                    <span className="text-xs text-[#FFB800]">
                                        ⚡ x{vehicle.surge_multiplier}
                                    </span>
                                )}
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
