import React from 'react';
import { User, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { theme } from './theme';

const VehicleCard3D = ({ vehicle, price, time, isSelected, onClick }) => {
    // Map vehicle type to 3D asset path
    const getVehicleImage = (type) => {
        switch (type) {
            case 'standard': return '/assets/3d/vehicle_standard.png';
            case 'economy': return '/assets/3d/vehicle_economy.png';
            case 'large': return '/assets/3d/vehicle_xl.png';
            case 'comfort': return '/assets/3d/vehicle_comfort.png';
            case 'xl': return '/assets/3d/vehicle_xl.png';
            case 'branded': return '/assets/3d/vehicle_branded.png';
            case 'moto': return '/assets/3d/moto.png';
            default: return '/assets/3d/ride.png';
        }
    };

    return (
        <div
            onClick={onClick}
            className={`relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer overflow-hidden group ${isSelected
                ? 'border-[#FFD700] bg-[#FFD700]/5'
                : 'border-transparent bg-[#1A1A1A] hover:bg-[#252525]'
                }`}
        >
            {/* Background Glow for Selected State */}
            {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/10 to-transparent blur-xl" />
            )}

            <div className="flex items-center justify-between relative z-10">
                {/* Vehicle Image */}
                <div className={`w-28 h-20 -ml-2 transition-transform duration-500 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                    <img
                        src={getVehicleImage(vehicle.vehicle_type)}
                        alt={theme.vehicleTypes[vehicle.vehicle_type]?.name}
                        className="w-full h-full object-contain filter drop-shadow-2xl"
                        style={{ filter: isSelected ? 'drop-shadow(0 10px 15px rgba(255, 215, 0, 0.3))' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}
                    />
                </div>

                {/* Info */}
                <div className="flex-1 px-4">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                            {theme.vehicleTypes[vehicle.vehicle_type]?.name || 'GO'}
                        </h3>
                        <div className="flex items-center gap-0.5 text-xs text-gray-400 bg-white/10 px-1.5 py-0.5 rounded">
                            <User size={10} />
                            <span>{vehicle.vehicle_type === 'xl' ? '6' : vehicle.vehicle_type === 'moto' ? '1' : '4'}</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={10} />
                        Llega en {Math.round(time / 2)} min
                    </p>
                </div>

                {/* Price */}
                <div className="text-right">
                    <p className={`text-lg font-bold ${isSelected ? 'text-[#FFD700]' : 'text-white'}`}>
                        {formatCurrency(price)}
                    </p>
                    {vehicle.surge_multiplier > 1.0 && (
                        <span className="text-[10px] text-white bg-red-500 px-1.5 py-0.5 rounded-full font-bold">
                            High Demand
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VehicleCard3D;
