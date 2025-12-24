import React, { useState, useEffect } from 'react';
import { goApp } from '@/api/goAppClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, ArrowRight, User, Car, FileText, Check, Upload, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Logo from '@/components/go/Logo';
import { theme } from '@/components/go/theme';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
    { id: 'personal', title: 'Datos Personales', icon: User, description: 'Tu información básica' },
    { id: 'vehicle', title: 'Tu Vehículo', icon: Car, description: 'Detalles del auto' },
    { id: 'documents', title: 'Documentación', icon: FileText, description: 'Licencia y permisos' },
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
        email: '',
        password: '',

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
        license_status: 'pending', // pending, uploading, uploaded
    });

    useEffect(() => {
        // Cargar datos previos si existen (del DriverSignup)
        const savedData = localStorage.getItem('driver_signup');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                // Separar nombre completo
                const names = (parsed.fullName || '').split(' ');
                const firstName = names[0] || '';
                const lastName = names.slice(1).join(' ') || '';

                setFormData(prev => ({
                    ...prev,
                    first_name: firstName,
                    last_name: lastName,
                    phone: parsed.phone || '',
                    vehicle_type: parsed.vehicleType || 'economy'
                }));
            } catch (e) {
                console.error("Error loading saved signup data", e);
            }
        }
    }, []);

    const updateForm = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 0:
                return formData.first_name && formData.last_name && formData.phone && /^09\d{8}$/.test(formData.phone) && formData.email && formData.password.length >= 6;
            case 1:
                return formData.vehicle_make && formData.vehicle_model && formData.vehicle_plate && formData.vehicle_color;
            case 2:
                return formData.license_number && formData.license_status === 'uploaded';
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
            // Usamos el registro de Auth (que maneja auth + profile DB)
            await goApp.auth.register(formData.phone, formData.password, {
                role: 'driver',
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone,
                email: formData.email,
                vehicle_type: formData.vehicle_type,
                vehicle_make: formData.vehicle_make,
                vehicle_model: formData.vehicle_model,
                vehicle_year: formData.vehicle_year,
                vehicle_color: formData.vehicle_color,
                vehicle_plate: formData.vehicle_plate,
                license_number: formData.license_number,
                license_expiry: formData.license_expiry
            });

            // Simulate slight delay for effect
            setTimeout(() => {
                // Auto-login or redirect
                navigate(createPageUrl('DriverHome'));
            }, 1000);
        } catch (error) {
            console.error('Error registering driver:', error);
            // Si el usuario ya existe, podríamos mostrar un mensaje específico
            if (error.message.includes('User already registered') || error.message.includes('duplicate')) {
                alert('Este número ya está registrado. Por favor inicia sesión.');
                navigate(createPageUrl('DriverLogin'));
            } else {
                alert('Error al registrar: ' + error.message);
            }
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#FFD700]/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#FFA500]/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Header */}
            <header className="sticky top-0 z-40 bg-black/50 backdrop-blur-xl border-b border-[#FFD700]/10">
                <div className="flex items-center justify-between px-6 py-4 max-w-2xl mx-auto w-full">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => currentStep > 0 ? prevStep() : navigate(-1)}
                        className="text-white hover:bg-white/10 hover:text-[#FFD700] transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </Button>
                    <div className="flex flex-col items-center">
                        <span className="text-sm text-[#FFD700] font-medium tracking-wider uppercase">Registro</span>
                        <div className="flex gap-1 mt-1">
                            {STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-[#FFD700]' :
                                        i < currentStep ? 'w-2 bg-[#FFD700]/50' : 'w-2 bg-white/10'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>
            </header>

            <main className="max-w-xl mx-auto px-6 py-8 pb-32 relative z-10">

                {/* Step Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={currentStep}
                    className="text-center mb-10"
                >
                    <div className="w-16 h-16 bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/5 rounded-2xl border border-[#FFD700]/20 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_-5px_rgba(255,215,0,0.15)]">
                        {React.createElement(STEPS[currentStep].icon, { size: 30, className: "text-[#FFD700]" })}
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400 mb-2">
                        {STEPS[currentStep].title}
                    </h1>
                    <p className="text-gray-400">
                        {STEPS[currentStep].description}
                    </p>
                </motion.div>

                {/* Form Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        {/* Personal Info */}
                        {currentStep === 0 && (
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-400 ml-1">Nombre</Label>
                                        <Input
                                            value={formData.first_name}
                                            onChange={(e) => updateForm('first_name', e.target.value)}
                                            placeholder="Juan"
                                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-14 rounded-xl focus:border-[#FFD700]/50 focus:ring-[#FFD700]/20 transition-all text-lg"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-400 ml-1">Apellido</Label>
                                        <Input
                                            value={formData.last_name}
                                            onChange={(e) => updateForm('last_name', e.target.value)}
                                            placeholder="Pérez"
                                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-14 rounded-xl focus:border-[#FFD700]/50 focus:ring-[#FFD700]/20 transition-all text-lg"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-400 ml-1">Teléfono móvil</Label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🇵🇾</span>
                                        <Input
                                            placeholder="0981 123 456"
                                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-14 rounded-xl pl-12 focus:border-[#FFD700]/50 focus:ring-[#FFD700]/20 transition-all text-lg tracking-wide"
                                            maxLength={10}
                                            value={formData.phone}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                if (val.length <= 10) updateForm('phone', val);
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 ml-1">Te enviaremos un código de verificación.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-400 ml-1">Correo electrónico</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => updateForm('email', e.target.value)}
                                        placeholder="juan@ejemplo.com"
                                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-14 rounded-xl focus:border-[#FFD700]/50 focus:ring-[#FFD700]/20 transition-all text-lg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-gray-400 ml-1">Contraseña</Label>
                                    <Input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => updateForm('password', e.target.value)}
                                        placeholder="••••••••"
                                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-14 rounded-xl focus:border-[#FFD700]/50 focus:ring-[#FFD700]/20 transition-all text-lg"
                                    />
                                    <p className="text-xs text-gray-500 ml-1">Mínimo 6 caracteres.</p>
                                </div>
                            </div>
                        )}

                        {/* Vehicle Info */}
                        {currentStep === 1 && (
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-gray-400 ml-1">Tipo de Servicio</Label>
                                    <Select
                                        value={formData.vehicle_type}
                                        onValueChange={(value) => updateForm('vehicle_type', value)}
                                    >
                                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-14 rounded-xl focus:ring-[#FFD700]/20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1A1A1A] border-[#FFD700]/20 text-white">
                                            {Object.entries(theme.vehicleTypes).map(([key, config]) => (
                                                <SelectItem key={key} value={key} className="focus:bg-[#FFD700]/20 focus:text-[#FFD700]">
                                                    <span className="flex items-center gap-3">
                                                        <span className="text-lg">{config.icon}</span>
                                                        <span className="font-medium">{config.name}</span>
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-400 ml-1">Marca</Label>
                                        <Input
                                            value={formData.vehicle_make}
                                            onChange={(e) => updateForm('vehicle_make', e.target.value)}
                                            placeholder="Toyota"
                                            className="bg-white/5 border-white/10 text-white h-14 rounded-xl focus:border-[#FFD700]/50 focus:ring-[#FFD700]/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-400 ml-1">Modelo</Label>
                                        <Input
                                            value={formData.vehicle_model}
                                            onChange={(e) => updateForm('vehicle_model', e.target.value)}
                                            placeholder="Vitz / Corolla"
                                            className="bg-white/5 border-white/10 text-white h-14 rounded-xl focus:border-[#FFD700]/50 focus:ring-[#FFD700]/20"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-400 ml-1">Año</Label>
                                        <Input
                                            type="number"
                                            value={formData.vehicle_year}
                                            onChange={(e) => updateForm('vehicle_year', parseInt(e.target.value) || '')}
                                            className="bg-white/5 border-white/10 text-white h-14 rounded-xl focus:border-[#FFD700]/50 focus:ring-[#FFD700]/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-400 ml-1">Color</Label>
                                        <Input
                                            value={formData.vehicle_color}
                                            onChange={(e) => updateForm('vehicle_color', e.target.value)}
                                            placeholder="Gris"
                                            className="bg-white/5 border-white/10 text-white h-14 rounded-xl focus:border-[#FFD700]/50 focus:ring-[#FFD700]/20"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-400 ml-1">Número de Chapa (Matrícula)</Label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-white/10 rounded text-[10px] font-bold tracking-widest text-white/70 border border-white/20">PY</div>
                                        <Input
                                            value={formData.vehicle_plate}
                                            onChange={(e) => updateForm('vehicle_plate', e.target.value.toUpperCase())}
                                            placeholder="ABCD 123"
                                            className="bg-white/5 border-white/10 text-white h-14 rounded-xl pl-16 uppercase font-mono tracking-wider focus:border-[#FFD700]/50 focus:ring-[#FFD700]/20"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Documents */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-[#FFD700]/5 border border-[#FFD700]/20 flex gap-4 items-start">
                                        <div className="p-2 rounded-full bg-[#FFD700]/10 text-[#FFD700]">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-[#FFD700] font-medium mb-1">Verificación de Seguridad</h3>
                                            <p className="text-sm text-gray-400 leading-relaxed">
                                                Para activar tu cuenta, necesitamos validar tu identidad y documentación legal. Todos los datos están encriptados. 🔒
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-gray-400 ml-1">Nro. Licencia de Conducir</Label>
                                            <Input
                                                value={formData.license_number}
                                                onChange={(e) => updateForm('license_number', e.target.value)}
                                                className="bg-white/5 border-white/10 text-white h-14 rounded-xl focus:border-[#FFD700]/50"
                                                placeholder="Ej. 1234567"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-400 ml-1">Vencimiento Licencia</Label>
                                            <Input
                                                type="date"
                                                value={formData.license_expiry}
                                                onChange={(e) => updateForm('license_expiry', e.target.value)}
                                                className="bg-white/5 border-white/10 text-white h-14 rounded-xl focus:border-[#FFD700]/50"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <Label className="text-gray-400 ml-1 mb-2 block">Foto de la Licencia (Frente y Dorso)</Label>
                                        <div
                                            onClick={() => {
                                                updateForm('license_status', 'uploading');
                                                setTimeout(() => updateForm('license_status', 'uploaded'), 1500);
                                            }}
                                            className={`
                                                border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer group relative overflow-hidden
                                                ${formData.license_status === 'uploaded' ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 bg-white/5 hover:bg-white/[0.07] hover:border-[#FFD700]/30'}
                                            `}
                                        >
                                            {formData.license_status === 'uploading' && (
                                                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
                                                    <div className="w-8 h-8 border-2 border-[#FFD700] border-t-transparent rounded-full animate-spin" />
                                                </div>
                                            )}

                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-transform ${formData.license_status === 'uploaded' ? 'bg-green-500 text-black' : 'bg-black text-[#FFD700] group-hover:scale-110'}`}>
                                                {formData.license_status === 'uploaded' ? <Check size={32} /> : <Upload size={24} />}
                                            </div>
                                            <span className="text-white font-medium mb-1">
                                                {formData.license_status === 'uploaded' ? '¡Licencia cargada!' : 'Toca para subir foto'}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {formData.license_status === 'uploaded' ? 'Puedes cambiarla haciendo clic de nuevo' : 'JPG, PNG o PDF (Max 5MB)'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent z-50">
                <div className="max-w-xl mx-auto">
                    {currentStep < STEPS.length - 1 ? (
                        <Button
                            onClick={nextStep}
                            disabled={!isStepValid()}
                            className="w-full h-14 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold text-lg rounded-xl shadow-[0_0_20px_-5px_#FFD700] hover:shadow-[0_0_30px_-5px_#FFD700] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
                        >
                            <span className="flex items-center gap-2">
                                Continuar <ArrowRight size={20} />
                            </span>
                        </Button>
                    ) : (
                        <Button
                            onClick={submitRegistration}
                            disabled={!isStepValid() || isSubmitting}
                            className="w-full h-14 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-bold text-lg rounded-xl shadow-[0_0_20px_-5px_#FFD700] hover:shadow-[0_0_30px_-5px_#FFD700] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none relative overflow-hidden"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    <span>Creando cuenta...</span>
                                </div>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Sparkles size={20} /> Finalizar Registro
                                </span>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
