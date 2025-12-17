import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, ArrowRight, User, Car, FileText, Check, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Logo from '@/components/go/Logo';
import { theme } from '@/components/go/theme';

const STEPS = [
    { id: 'personal', title: 'Datos personales', icon: User },
    { id: 'vehicle', title: 'Vehículo', icon: Car },
    { id: 'documents', title: 'Documentos', icon: FileText },
];

export default function DriverRegister() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        // Personal
        first_name: '',
        last_name: '',
        phone: '',

        // Vehicle
        vehicle_type: 'economy',
        vehicle_make: '',
        vehicle_model: '',
        vehicle_year: new Date().getFullYear(),
        vehicle_color: '',
        vehicle_plate: '',

        // Documents
        license_number: '',
        license_expiry: '',
    });

    const updateForm = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 0:
                return formData.first_name && formData.last_name && formData.phone && /^09\d{8}$/.test(formData.phone);
            case 1:
                return formData.vehicle_make && formData.vehicle_model && formData.vehicle_plate;
            case 2:
                return formData.license_number;
            default:
                return false;
        }
    };

    const nextStep = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const submitRegistration = async () => {
        setIsSubmitting(true);

        try {
            await base44.entities.Driver.create({
                ...formData,
                status: 'pending',
                is_online: false,
                is_available: true,
                rating: 5.0,
                total_trips: 0,
                total_ratings: 0,
                acceptance_rate: 1.0,
                total_earnings: 0,
            });

            navigate(createPageUrl('DriverHome'));
        } catch (error) {
            console.error('Error registering driver:', error);
        }

        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-[#0F0F1A] text-white">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0F0F1A]/90 backdrop-blur-lg border-b border-[#2D2D44]">
                <div className="flex items-center gap-4 px-4 py-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => currentStep > 0 ? prevStep() : navigate(-1)}
                        className="text-white"
                    >
                        <ArrowLeft size={24} />
                    </Button>
                    <div className="flex-1">
                        <Logo size="sm" />
                    </div>
                </div>
            </header>

            {/* Progress Steps */}
            <div className="px-4 py-6">
                <div className="flex items-center justify-between mb-8">
                    {STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = index === currentStep;
                        const isComplete = index < currentStep;

                        return (
                            <div key={step.id} className="flex flex-col items-center flex-1">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${isComplete ? 'bg-[#00D4B1] text-black' :
                                    isActive ? 'bg-[#00D4B1]/20 text-[#00D4B1] border-2 border-[#00D4B1]' :
                                        'bg-[#252538] text-gray-400'
                                    }`}>
                                    {isComplete ? <Check size={20} /> : <Icon size={20} />}
                                </div>
                                <span className={`text-xs text-center ${isActive ? 'text-[#00D4B1]' : 'text-gray-400'}`}>
                                    {step.title}
                                </span>
                                {index < STEPS.length - 1 && (
                                    <div className={`absolute top-6 left-1/2 w-full h-0.5 ${isComplete ? 'bg-[#00D4B1]' : 'bg-[#252538]'
                                        }`} style={{ transform: 'translateX(50%)' }} />
                                )}
                            </div>
                        );
                    })}
                </div>

                <h1 className="text-2xl font-bold mb-6">{STEPS[currentStep].title}</h1>

                {/* Step Content */}
                <div className="space-y-6">
                    {/* Personal Info */}
                    {currentStep === 0 && (
                        <>
                            <div className="space-y-2">
                                <Label>Nombre</Label>
                                <Input
                                    value={formData.first_name}
                                    onChange={(e) => updateForm('first_name', e.target.value)}
                                    placeholder="Tu nombre"
                                    className="bg-[#252538] border-[#2D2D44] text-white py-6"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Apellidos</Label>
                                <Input
                                    value={formData.last_name}
                                    onChange={(e) => updateForm('last_name', e.target.value)}
                                    placeholder="Tus apellidos"
                                    className="bg-[#252538] border-[#2D2D44] text-white py-6"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Teléfono</Label>
                                <Input
                                    placeholder="0981 123 456"
                                    className="bg-[#252538] border-[#2D2D44] text-white py-6"
                                    maxLength={10}
                                    value={formData.phone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 10) {
                                            updateForm('phone', val);
                                        }
                                    }}
                                />
                            </div>
                        </>
                    )}

                    {/* Vehicle Info */}
                    {currentStep === 1 && (
                        <>
                            <div className="space-y-2">
                                <Label>Tipo de servicio</Label>
                                <Select
                                    value={formData.vehicle_type}
                                    onValueChange={(value) => updateForm('vehicle_type', value)}
                                >
                                    <SelectTrigger className="bg-[#252538] border-[#2D2D44] text-white py-6">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1A1A2E] border-[#2D2D44]">
                                        {Object.entries(theme.vehicleTypes).map(([key, config]) => (
                                            <SelectItem key={key} value={key} className="text-white">
                                                <span className="flex items-center gap-2">
                                                    <span>{config.icon}</span>
                                                    <span>{config.name}</span>
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Marca</Label>
                                    <Input
                                        value={formData.vehicle_make}
                                        onChange={(e) => updateForm('vehicle_make', e.target.value)}
                                        placeholder="Toyota"
                                        className="bg-[#252538] border-[#2D2D44] text-white py-6"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Modelo</Label>
                                    <Input
                                        value={formData.vehicle_model}
                                        onChange={(e) => updateForm('vehicle_model', e.target.value)}
                                        placeholder="Corolla"
                                        className="bg-[#252538] border-[#2D2D44] text-white py-6"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Año</Label>
                                    <Input
                                        type="number"
                                        value={formData.vehicle_year}
                                        onChange={(e) => updateForm('vehicle_year', parseInt(e.target.value))}
                                        className="bg-[#252538] border-[#2D2D44] text-white py-6"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Color</Label>
                                    <Input
                                        value={formData.vehicle_color}
                                        onChange={(e) => updateForm('vehicle_color', e.target.value)}
                                        placeholder="Negro"
                                        className="bg-[#252538] border-[#2D2D44] text-white py-6"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Matrícula</Label>
                                <Input
                                    value={formData.vehicle_plate}
                                    onChange={(e) => updateForm('vehicle_plate', e.target.value.toUpperCase())}
                                    placeholder="1234 ABC"
                                    className="bg-[#252538] border-[#2D2D44] text-white py-6 uppercase"
                                />
                            </div>
                        </>
                    )}

                    {/* Documents */}
                    {currentStep === 2 && (
                        <>
                            <div className="space-y-2">
                                <Label>Número de licencia de conducir</Label>
                                <Input
                                    value={formData.license_number}
                                    onChange={(e) => updateForm('license_number', e.target.value)}
                                    placeholder="12345678A"
                                    className="bg-[#252538] border-[#2D2D44] text-white py-6"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha de vencimiento</Label>
                                <Input
                                    type="date"
                                    value={formData.license_expiry}
                                    onChange={(e) => updateForm('license_expiry', e.target.value)}
                                    className="bg-[#252538] border-[#2D2D44] text-white py-6"
                                />
                            </div>

                            <div className="bg-[#252538] rounded-xl p-6 border border-dashed border-[#2D2D44]">
                                <div className="text-center">
                                    <Upload size={32} className="mx-auto text-gray-400 mb-3" />
                                    <p className="text-gray-400 mb-2">Sube fotos de tus documentos</p>
                                    <p className="text-xs text-gray-500">
                                        DNI, Licencia de conducir, Seguro del vehículo
                                    </p>
                                    <Button variant="outline" className="mt-4 border-[#00D4B1] text-[#00D4B1]">
                                        Seleccionar archivos
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-[#00D4B1]/10 rounded-xl p-4 border border-[#00D4B1]/20">
                                <p className="text-[#00D4B1] text-sm">
                                    📋 Tus documentos serán revisados en 24-48 horas. Te notificaremos cuando tu cuenta esté activa.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0F0F1A] border-t border-[#2D2D44]">
                {currentStep < STEPS.length - 1 ? (
                    <Button
                        onClick={nextStep}
                        disabled={!isStepValid()}
                        className="w-full py-6 bg-[#00D4B1] hover:bg-[#00B89C] text-black font-semibold text-lg disabled:opacity-50"
                    >
                        Continuar
                        <ArrowRight size={20} className="ml-2" />
                    </Button>
                ) : (
                    <Button
                        onClick={submitRegistration}
                        disabled={!isStepValid() || isSubmitting}
                        className="w-full py-6 bg-[#00D4B1] hover:bg-[#00B89C] text-black font-semibold text-lg disabled:opacity-50"
                    >
                        {isSubmitting ? 'Enviando...' : 'Completar registro'}
                    </Button>
                )}
            </div>
        </div>
    );
}
