import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

const UserNotRegisteredError = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center">
            <ShieldAlert className="h-20 w-20 text-red-500 mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Acceso Restringido</h1>
            <p className="text-gray-600 mb-8 max-w-md">
                Tu cuenta no tiene los permisos necesarios para acceder a esta aplicación.
                Por favor contacta al administrador o regístrate.
            </p>
            <div className="flex gap-4">
                <Button asChild>
                    <Link to="/passenger/signup">Registrarme como Pasajero</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link to="/driver/signup">Aplicar como Conductor</Link>
                </Button>
            </div>
            <Button variant="link" className="mt-8" asChild>
                <Link to="/">Volver al Inicio</Link>
            </Button>
        </div>
    );
};

export default UserNotRegisteredError;
