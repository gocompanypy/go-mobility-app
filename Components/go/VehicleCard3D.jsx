import React from 'react';
import { theme } from './theme';

// Componente de vehículo con estilo 3D dorado/blanco
export default function VehicleCard3D({ vehicle, price, time, isSelected, onClick }) {
    const vehicleConfig = theme.vehicleTypes[vehicle.vehicle_type] || {};

    // Gradientes dorados para cada tipo
    const goldGradients = {
        economy: 'from-amber-200 via-yellow-100 to-amber-200',
        comfort: 'from-amber-300 via-yellow-200 to-amber-300',
        premium: 'from-yellow-400 via-amber-300 to-yellow-400',
        xl: 'from-amber-400 via-yellow-300 to-amber-400',
        moto: 'from-orange-300 via-amber-200 to-orange-300',
        delivery: 'from-slate-300 via-gray-200 to-slate-300',
        van: 'from-amber-500 via-yellow-400 to-amber-500',
    };

    const gradient = goldGradients[vehicle.vehicle_type] || goldGradients.economy;

    return (
        <button
            onClick={onClick}
            className={`
        relative w-full p-4 rounded-2xl border-2 transition-all
        ${isSelected
                    ? 'border-[#FFD700] shadow-lg shadow-yellow-500/30 gold-glow'
                    : 'border-[#1A1A1A] hover:border-[#FFD700]/50'
                }
      `}
            style={{
                background: isSelected
                    ? 'linear-gradient(135deg, #0A0A0A, #000000)'
                    : '#0A0A0A'
            }}
        >
            {/* Indicador de selección */}
            {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-[#FFD700] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </div>
            )}

            <div className="flex items-center justify-between">
                {/* Vehículo 3D estilizado */}
                <div className="flex items-center gap-4">
                    <div className={`
            w-16 h-16 rounded-2xl 
            bg-gradient-to-br ${gradient}
            flex items-center justify-center
            shadow-lg transform transition-transform
            ${isSelected ? 'scale-110' : 'scale-100'}
          `}
                        style={{
                            boxShadow: isSelected
                                ? '0 10px 40px rgba(255, 215, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                                : '0 4px 12px rgba(255, 215, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                        }}
                    >
                        <span className="text-3xl drop-shadow-lg">{vehicleConfig.icon}</span>
                    </div>

                    <div className="text-left">
                        <h3 className="font-bold text-white">{vehicleConfig.name}</h3>
                        <p className="text-xs text-gray-400">{vehicleConfig.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">👤 {vehicleConfig.passengers}</span>
                            <span className="text-xs text-gray-500">• {time} min</span>
                        </div>
                    </div>
                </div>

                {/* Precio */}
                <div className="text-right">
                    <p className={`text-xl font-bold ${isSelected ? 'text-[#FFD700]' : 'text-white'}`}>
                        Gs. {price?.toLocaleString('es-PY')}
                    </p>
                </div>
            </div>
        </button>
    );
}
