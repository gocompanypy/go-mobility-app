import React from 'react';
import { Link } from 'react-router-dom';

export default function DemoImages() {
    const images = [
        { name: 'Ride', src: '/assets/3d/ride.png' },
        { name: 'Reserve', src: '/assets/3d/reserve.png' },
        { name: 'Moto', src: '/assets/3d/moto.png' },
        { name: 'Rent', src: '/assets/3d/rent.png' },
        { name: 'Freight', src: '/assets/3d/freight.png' },
        { name: 'Package', src: '/assets/3d/package.png' },
        { name: 'Food', src: '/assets/3d/food.png' },
        { name: 'Vehicle Economy', src: '/assets/3d/vehicle_economy.png' },
        { name: 'Vehicle Standard', src: '/assets/3d/vehicle_standard.png' },
        { name: 'Vehicle Large', src: '/assets/3d/vehicle_xl.png' }, // Placeholder
        { name: 'Vehicle Comfort', src: '/assets/3d/vehicle_comfort.png' },
        { name: 'Vehicle XL', src: '/assets/3d/vehicle_xl.png' },
        { name: 'Vehicle Branded', src: '/assets/3d/vehicle_branded.png' },
    ];

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <h1 className="text-3xl font-bold mb-8 text-[#FFD700]">Galería de Activos 3D</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {images.map((img) => (
                    <div key={img.name} className="bg-[#1A1A1A] p-4 rounded-xl border border-white/10 flex flex-col items-center">
                        <div className="w-32 h-32 mb-4 bg-black/50 rounded-lg flex items-center justify-center">
                            <img src={img.src} alt={img.name} className="max-w-full max-h-full object-contain" />
                        </div>
                        <p className="font-medium text-gray-300">{img.name}</p>
                        <p className="text-xs text-gray-500 mt-2 font-mono">{img.src}</p>
                    </div>
                ))}
            </div>
            <div className="mt-8 text-center">
                <Link to="/passenger/login" className="text-[#00D4B1] hover:underline">Ir al Login</Link>
            </div>
        </div>
    );
}
