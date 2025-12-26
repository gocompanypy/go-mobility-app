import React, { useState, useEffect } from 'react';
import { goApp } from '@/api/goAppClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Bike, CheckCircle2, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Vehicle Dictionary
const vehicleBrands = {
    'Toyota': ['Vitz', 'Corolla', 'Allion', 'Premio', 'Yaris', 'Hilux', 'Fortuner', 'Rush', 'Otros'],
    'Kia': ['Picanto', 'Rio', 'Cerato', 'Sportage', 'Sorento', 'Soluto', 'Otros'],
    'Hyundai': ['HB20', 'Accent', 'Elantra', 'Tucson', 'Santa Fe', 'Creta', 'i10', 'Otros'],
    'Nissan': ['Tiida', 'Versa', 'Sentra', 'Kicks', 'Frontier', 'Sunny', 'March', 'Otros'],
    'Chevrolet': ['Onix', 'Prisma', 'Cruze', 'Tracker', 'S10', 'Sail', 'Spark', 'Otros'],
    'Volkswagen': ['Gol', 'Polo', 'Virtus', 'Saveiro', 'Amarok', 'T-Cross', 'Nivus', 'Otros'],
    'Honda': ['Fit', 'Civic', 'HR-V', 'CR-V', 'City', 'WR-V', 'Otros'],
    'Otros': [],
};

const motoBrands = ['Honda', 'Kenton', 'Taiga', 'Leopard', 'Star', 'Yamaha', 'Suzuki', 'Otra'];

export default function DriverBenefits() {


    // -- Form State & Logic --
    const [vehicleTypeTab, setVehicleTypeTab] = useState('car');
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        city: '',
        customCity: '',
        docType: 'ci',
        docNumber: '',
        vehicleBrand: '',
        vehicleModel: '',
        availability: '',
        suggestions: ''
    });

    const [availableModels, setAvailableModels] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errors, setErrors] = useState({});

    // Update models/brands based on Tab change
    useEffect(() => {
        setFormData(prev => ({ ...prev, vehicleBrand: '', vehicleModel: '' }));
        setErrors({}); // Clear errors on tab change
    }, [vehicleTypeTab]);

    // Update models when brand changes (Car only)
    useEffect(() => {
        if (vehicleTypeTab === 'car' && formData.vehicleBrand && vehicleBrands[formData.vehicleBrand]) {
            setAvailableModels(vehicleBrands[formData.vehicleBrand]);
        } else {
            setAvailableModels([]);
        }
    }, [formData.vehicleBrand, vehicleTypeTab]);

    const validate = () => {
        const newErrors = {};

        if (formData.fullName.trim().length < 3) newErrors.fullName = "Nombre muy corto";

        const phoneClean = formData.phone.replace(/\D/g, '');
        if (!/^09\d{8}$/.test(phoneClean)) newErrors.phone = "Ej: 0981123456";

        if (formData.docNumber.trim().length < 5) newErrors.docNumber = "Mínimo 5 caracteres";

        if (formData.city === 'Otros' && formData.customCity.trim().length < 2) {
            newErrors.customCity = "Requerido";
        }

        if (!formData.vehicleBrand) newErrors.vehicleBrand = "Requerido";
        if (!formData.vehicleModel) newErrors.vehicleModel = "Requerido";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            // Shake effect or simple return
            console.log("Validation Failed", errors);
            return;
        }

        setIsSubmitting(true);
        const finalData = {
            ...formData,
            city: formData.city === 'Otros' ? formData.customCity : formData.city,
            vehicleType: vehicleTypeTab
        };

        try {
            await goApp.entities.Marketing.Leads.create(finalData);
            setTimeout(() => {
                setIsSuccess(true);
            }, 1000);
        } catch (error) {
            console.error("Error submitting lead:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black text-white selection:bg-[#FFD700] selection:text-black font-sans scroll-smooth scrollbar-hide">

            {/* Hero Section (Split Layout) */}
            <section className="snap-start min-h-screen relative pt-12 pb-20 px-6 flex items-center bg-black overflow-hidden">
                {/* Brand Logo - Absolute Top Left */}
                <div className="absolute top-6 left-6 z-50 md:top-10 md:left-10">
                    <img
                        src="/logo.png"
                        alt="Go Logo"
                        className="h-10 md:h-[100px] w-auto object-contain mix-blend-lighten"
                    />
                </div>

                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left: Value Prop */}
                    <div className="space-y-6 lg:max-w-xl relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] text-xs font-bold uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-[#FFD700]" />
                            Genera Ingresos Extra
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                            Manejá tu tiempo,<br />
                            <span className="text-[#FFD700]">multiplicá tus ganancias.</span>
                        </h1>

                        <p className="text-xl text-gray-400 leading-relaxed">
                            Sin jefes, sin horarios fijos. Unite a la plataforma que más cuida a sus conductores en Paraguay. <span className="text-[#FFD700] font-bold text-2xl">LO QUE GANAS ES 100% TUYO</span>.
                        </p>

                        <ul className="space-y-3 pt-2">
                            <li className="flex items-center gap-3 text-white font-medium">
                                <div className="w-6 h-6 rounded-full bg-[#FFD700] flex items-center justify-center text-black"><CheckCircle2 size={14} className="stroke-current stroke-[3]" /></div>
                                Comisiones <span className="text-[#FFD700] font-bold text-lg">DE 0%</span>
                            </li>
                            <li className="flex items-center gap-3 text-white font-medium">
                                <div className="w-6 h-6 rounded-full bg-[#FFD700] flex items-center justify-center text-black"><CheckCircle2 size={14} className="stroke-current stroke-[3]" /></div>
                                Descuentos en Combustibles en Estaciones Aliadas
                            </li>
                            <li className="flex items-center gap-3 text-white font-medium">
                                <div className="w-6 h-6 rounded-full bg-[#FFD700] flex items-center justify-center text-black"><CheckCircle2 size={14} className="stroke-current stroke-[3]" /></div>
                                Soporte local 24/7
                            </li>
                            <li className="flex items-center gap-3 text-white font-medium">
                                <div className="w-6 h-6 rounded-full bg-[#FFD700] flex items-center justify-center text-black"><CheckCircle2 size={14} className="stroke-current stroke-[3]" /></div>
                                Centro de Atenciones en las Principales Ciudades
                            </li>
                            <li className="flex items-center gap-3 text-white font-medium">
                                <div className="w-6 h-6 rounded-full bg-[#FFD700] flex items-center justify-center text-black"><CheckCircle2 size={14} className="stroke-current stroke-[3]" /></div>
                                Descuentos <span className="text-[#FFD700] font-bold">REALES</span> en Centros de Mantenimientos y de Repuestos
                            </li>
                            <li className="flex items-center gap-3 text-white font-medium">
                                <div className="w-6 h-6 rounded-full bg-[#FFD700] flex items-center justify-center text-black"><CheckCircle2 size={14} className="stroke-current stroke-[3]" /></div>
                                Programa de <span className="text-[#FFD700] font-bold">RENOVA TU AUTO</span>
                            </li>
                            <li className="flex items-center gap-3 text-white font-medium">
                                <div className="w-6 h-6 rounded-full bg-[#FFD700] flex items-center justify-center text-black"><CheckCircle2 size={14} className="stroke-current stroke-[3]" /></div>
                                Programa de <span className="text-[#FFD700] font-bold">TU CASA PROPIA</span>
                            </li>
                        </ul>
                    </div>

                    {/* Right: Signup Form Card */}
                    <div className="relative z-10 bg-[#111] border border-white/10 p-6 rounded-2xl shadow-2xl lg:ml-auto w-full max-w-2xl font-sans h-fit">
                        {isSuccess ? (
                            <div className="flex flex-col items-center justify-center text-center py-16 px-4 animate-in fade-in zoom-in-95 duration-500">
                                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 0 30px rgba(255, 215, 0, 0.4)' }}>
                                    <CheckCircle className="text-black" size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">¡Solicitud Enviada!</h3>
                                <p className="text-gray-400 mb-6 text-sm max-w-xs mx-auto">
                                    Tu registro fue recibido correctamente. Nos pondremos en contacto contigo pronto vía WhatsApp.
                                </p>
                                <Button
                                    onClick={() => {
                                        setIsSuccess(false);
                                        setFormData({ fullName: '', phone: '', city: '', customCity: '', docType: 'ci', docNumber: '', vehicleBrand: '', vehicleModel: '', availability: '', suggestions: '' });
                                        setErrors({});
                                    }}
                                    className="bg-[#FFD700] text-black font-bold rounded-full px-8 py-2 hover:bg-[#F0C000]"
                                >
                                    Nuevo Registro
                                </Button>
                            </div>
                        ) : (
                            <>
                                {/* Header */}


                                <form onSubmit={handleSubmit}>
                                    <fieldset disabled={isSubmitting} className={`space-y-5 border-none p-0 ${isSubmitting ? 'opacity-50 pointer-events-none' : ''} transition-opacity duration-300`}>
                                        {/* Personal Info */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5 relative">
                                                <Label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Nombre Completo</Label>
                                                <Input
                                                    placeholder="Tu nombre aquí"
                                                    className={`bg-[#151515] h-10 text-xs rounded-lg placeholder:text-gray-600 transition-all font-medium ${errors.fullName ? 'border-red-500 focus:border-red-500' : 'border-white/5 focus:border-[#FFD700]'}`}
                                                    value={formData.fullName}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, fullName: e.target.value });
                                                        if (errors.fullName) setErrors({ ...errors, fullName: null });
                                                    }}
                                                // Removed 'required' to handle via JS
                                                />
                                                {errors.fullName && <span className="text-[9px] text-red-500 absolute -bottom-4 left-1">{errors.fullName}</span>}
                                            </div>
                                            <div className="space-y-1.5 relative">
                                                <Label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">WhatsApp</Label>
                                                <Input
                                                    type="tel"
                                                    placeholder="0981 112 223"
                                                    className={`bg-[#151515] h-10 text-xs rounded-lg placeholder:text-gray-600 transition-all font-medium ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-white/5 focus:border-[#FFD700]'}`}
                                                    value={formData.phone}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, phone: e.target.value });
                                                        if (errors.phone) setErrors({ ...errors, phone: null });
                                                    }}
                                                // Removed 'required'
                                                />
                                                {errors.phone && <span className="text-[9px] text-red-500 absolute -bottom-4 left-1">{errors.phone}</span>}
                                            </div>
                                        </div>

                                        {/* Doc Info */}
                                        <div className="grid grid-cols-12 gap-4">
                                            <div className="col-span-5 space-y-1.5">
                                                <Label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Tipo Doc</Label>
                                                <Tabs value={formData.docType} onValueChange={(val) => setFormData({ ...formData, docType: val })} className="w-full">
                                                    <TabsList className="grid w-full grid-cols-3 bg-[#151515] h-10 p-1 rounded-lg border border-white/5">
                                                        <TabsTrigger value="ci" className="text-[9px] font-bold h-full data-[state=active]:bg-[#FFD700] data-[state=active]:text-black rounded-md transition-all">C.I.</TabsTrigger>
                                                        <TabsTrigger value="ruc" className="text-[9px] font-bold h-full data-[state=active]:bg-[#FFD700] data-[state=active]:text-black rounded-md transition-all">RUC</TabsTrigger>
                                                        <TabsTrigger value="pas" className="text-[9px] font-bold h-full data-[state=active]:bg-[#FFD700] data-[state=active]:text-black rounded-md transition-all">PAS</TabsTrigger>
                                                    </TabsList>
                                                </Tabs>
                                            </div>
                                            <div className="col-span-7 space-y-1.5 relative">
                                                <Label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">N° Documento</Label>
                                                <Input
                                                    placeholder="3.123.456"
                                                    className={`bg-[#151515] h-10 text-xs rounded-lg placeholder:text-gray-600 font-mono tracking-wide transition-all ${errors.docNumber ? 'border-red-500 focus:border-red-500' : 'border-white/5 focus:border-[#FFD700]'}`}
                                                    value={formData.docNumber}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, docNumber: e.target.value });
                                                        if (errors.docNumber) setErrors({ ...errors, docNumber: null });
                                                    }}
                                                />
                                                {errors.docNumber && <span className="text-[9px] text-red-500 absolute -bottom-4 left-1">{errors.docNumber}</span>}
                                            </div>
                                        </div>

                                        {/* City */}
                                        <div className="space-y-1.5 flex flex-col items-start text-left">
                                            <Label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-1">Ciudad de Operación</Label>
                                            <div className="flex flex-row gap-3 w-full items-center flex-wrap">
                                                <Select value={formData.city} onValueChange={(val) => setFormData({ ...formData, city: val })} required>
                                                    <SelectTrigger className="bg-[#151515] border-white/5 h-10 text-xs rounded-lg focus:border-[#FFD700] text-gray-300 w-full sm:w-[240px]">
                                                        <SelectValue placeholder="Seleccionar..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#1A1A1A] border-[#2D2D44] text-white max-h-40">
                                                        {['Asunción', 'Gran Asunción', 'CDE', 'Encarnación', 'San Lorenzo', 'Luque', 'Lambaré', 'Capiatá', 'Otros'].map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>

                                                {/* Custom City Input */}
                                                {formData.city === 'Otros' && (
                                                    <div className="animate-in fade-in slide-in-from-left-2 duration-300 flex-1 min-w-[200px]">
                                                        <Input
                                                            placeholder="Especifique su ciudad"
                                                            className="bg-[#151515] border-white/5 h-10 text-xs rounded-lg focus:border-[#FFD700] placeholder:text-gray-600 transition-all font-medium w-full"
                                                            value={formData.customCity}
                                                            onChange={(e) => setFormData({ ...formData, customCity: e.target.value })}
                                                            required
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Vehicle Section */}
                                        <div className="pt-2 space-y-3">
                                            <Label className="text-[10px] text-[#FFD700] uppercase tracking-widest font-extrabold ml-1 block">Vehículo</Label>

                                            <Tabs value={vehicleTypeTab} onValueChange={setVehicleTypeTab} className="w-full">
                                                <TabsList className="grid w-full grid-cols-2 bg-[#151515] h-12 p-1 rounded-xl border border-white/5">
                                                    <TabsTrigger value="car" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black text-xs font-extrabold h-full rounded-lg transition-all flex items-center justify-center gap-2">
                                                        <Car size={16} strokeWidth={2.5} /> Automóvil
                                                    </TabsTrigger>
                                                    <TabsTrigger value="moto" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black text-xs font-extrabold h-full rounded-lg transition-all flex items-center justify-center gap-2">
                                                        <Bike size={16} strokeWidth={2.5} /> Motocicleta
                                                    </TabsTrigger>
                                                </TabsList>

                                                {/* Car Content */}
                                                <TabsContent value="car" className="space-y-3 mt-4 bg-[#151515]/50 p-4 rounded-xl border border-white/5">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1.5 relative">
                                                            <Label className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">Marca Auto</Label>
                                                            <Select value={formData.vehicleBrand} onValueChange={(val) => {
                                                                setFormData({ ...formData, vehicleBrand: val });
                                                                if (errors.vehicleBrand) setErrors({ ...errors, vehicleBrand: null });
                                                            }}>
                                                                <SelectTrigger className={`bg-[#0A0A0A] h-9 text-xs ${errors.vehicleBrand ? 'border-red-500' : 'border-white/5'}`}><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                                                <SelectContent className="bg-[#1A1A1A] border-[#2D2D44] text-white max-h-40">{Object.keys(vehicleBrands).map(b => <SelectItem key={b} value={b} className="text-xs">{b}</SelectItem>)}</SelectContent>
                                                            </Select>
                                                            {errors.vehicleBrand && <span className="text-[9px] text-red-500 absolute -bottom-4 left-0">{errors.vehicleBrand}</span>}
                                                        </div>
                                                        <div className="space-y-1.5 relative">
                                                            <Label className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">Modelo</Label>
                                                            {formData.vehicleBrand === 'Otros' ? (
                                                                <Input
                                                                    placeholder="Especifique"
                                                                    className={`bg-[#0A0A0A] h-9 text-xs ${errors.vehicleModel ? 'border-red-500' : 'border-white/5'}`}
                                                                    onChange={(e) => {
                                                                        setFormData({ ...formData, vehicleModel: e.target.value });
                                                                        if (errors.vehicleModel) setErrors({ ...errors, vehicleModel: null });
                                                                    }}
                                                                />
                                                            ) : (
                                                                <Select value={formData.vehicleModel} onValueChange={(val) => {
                                                                    setFormData({ ...formData, vehicleModel: val });
                                                                    if (errors.vehicleModel) setErrors({ ...errors, vehicleModel: null });
                                                                }} disabled={!availableModels.length}>
                                                                    <SelectTrigger className={`bg-[#0A0A0A] h-9 text-xs ${errors.vehicleModel ? 'border-red-500' : 'border-white/5'}`}><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                                                    <SelectContent className="bg-[#1A1A1A] border-[#2D2D44] text-white max-h-40">{availableModels.map(m => <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>)}</SelectContent>
                                                                </Select>
                                                            )}
                                                            {errors.vehicleModel && <span className="text-[9px] text-red-500 absolute -bottom-4 left-0">{errors.vehicleModel}</span>}
                                                        </div>
                                                    </div>
                                                </TabsContent>

                                                {/* Moto Content */}
                                                <TabsContent value="moto" className="space-y-3 mt-4 bg-[#151515]/50 p-4 rounded-xl border border-white/5">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1.5">
                                                            <Label className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">Marca Moto</Label>
                                                            <Select value={formData.vehicleBrand} onValueChange={(val) => setFormData({ ...formData, vehicleBrand: val })}>
                                                                <SelectTrigger className="bg-[#0A0A0A] border-white/5 h-9 text-xs"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                                                <SelectContent className="bg-[#1A1A1A] border-[#2D2D44] text-white max-h-40">{motoBrands.map(b => <SelectItem key={b} value={b} className="text-xs">{b}</SelectItem>)}</SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <Label className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">Modelo</Label>
                                                            <Input placeholder="Ej: GTR 150" className="bg-[#0A0A0A] border-white/5 h-9 text-xs" value={formData.vehicleModel} onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })} />
                                                        </div>
                                                    </div>
                                                </TabsContent>
                                            </Tabs>
                                        </div>

                                        {/* Bottom Grid: Availability & Suggestions */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                            <div className="bg-[#151515] p-4 rounded-xl border border-white/5 h-full">
                                                <Label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3 block">Disponibilidad</Label>
                                                <RadioGroup value={formData.availability} onValueChange={(val) => setFormData({ ...formData, availability: val })} className="space-y-2">
                                                    <div className="flex items-center space-x-2"><RadioGroupItem value="full" id="r1" className="w-3.5 h-3.5 text-[#FFD700] border-white/20" /><Label htmlFor="r1" className="text-[11px] text-white cursor-pointer font-medium">Full Time (+8h)</Label></div>
                                                    <div className="flex items-center space-x-2"><RadioGroupItem value="part" id="r2" className="w-3.5 h-3.5 text-[#FFD700] border-white/20" /><Label htmlFor="r2" className="text-[11px] text-white cursor-pointer font-medium">Part Time (4-8h)</Label></div>
                                                    <div className="flex items-center space-x-2"><RadioGroupItem value="casual" id="r3" className="w-3.5 h-3.5 text-[#FFD700] border-white/20" /><Label htmlFor="r3" className="text-[11px] text-white cursor-pointer font-medium">Ocasional (-4h)</Label></div>
                                                </RadioGroup>
                                            </div>
                                            <div className="bg-[#151515] p-4 rounded-xl border border-white/5 h-full flex flex-col">
                                                <Label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3 block">Sugerencias</Label>
                                                <Textarea
                                                    className="bg-[#0A0A0A] border-white/5 text-xs resize-none focus:border-[#FFD700] flex-1 min-h-[60px] rounded-lg p-3"
                                                    placeholder="Escribe aquí..."
                                                    value={formData.suggestions}
                                                    onChange={(e) => setFormData({ ...formData, suggestions: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full h-12 rounded-xl bg-[#FFD700] text-black font-extrabold text-sm uppercase tracking-widest hover:bg-[#F0C000] shadow-[0_0_20px_rgba(255,215,0,0.15)] mt-4 transition-all"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Procesando...' : 'Finalizar Registro'}
                                        </Button>

                                        <p className="text-[9px] text-gray-600 text-center pt-2">
                                            Al continuar aceptas nuestros
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <span className="underline decoration-gray-600 hover:text-gray-400 cursor-pointer ml-1">Términos de Servicio</span>
                                                </DialogTrigger>
                                                <DialogContent className="bg-[#111] border border-white/10 text-white max-w-sm md:max-w-md max-h-[80vh] overflow-y-auto">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-[#FFD700]">Términos y Condiciones</DialogTitle>
                                                        <DialogDescription className="text-gray-400 text-xs mt-2 space-y-2">
                                                            <p>Bienvenido a Go. Al registrarte como conductor, aceptas:</p>
                                                            <ul className="list-disc pl-4 space-y-1">
                                                                <li>Proporcionar información verídica y actualizada.</li>
                                                                <li>Cumplir con las normativas de tránsito locales.</li>
                                                                <li>Mantener tu vehículo en condiciones óptimas de seguridad.</li>
                                                                <li>Tratar con respeto a los usuarios de la plataforma.</li>
                                                            </ul>
                                                            <p>Go se reserva el derecho de admisión y permanencia en la plataforma basado en la calidad del servicio y el cumplimiento de estas normas.</p>
                                                            <p className="font-bold pt-2">Privacidad de Datos</p>
                                                            <p>Tus datos son 100% confidenciales y se utilizan exclusivamente para los fines de la operación de la plataforma y seguridad del servicio.</p>
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                </DialogContent>
                                            </Dialog>.
                                        </p>
                                    </fieldset>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Benefits Carousel (Real/Clean Style) */}
            <section id="benefits-grid" className="snap-start min-h-screen py-20 bg-black flex flex-col justify-center">
                <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                        ¿Por qué elegir GO?
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Diseñamos un ecosistema pensando en tu rentabilidad.
                    </p>
                </div>

                {/* Carousel Container */}
                <CarouselContainer>
                    {/* Card 1: Vivienda */}
                    <BenefitCardOverlay
                        title="Vivienda Propia"
                        description="Accede a tu casa soñada con créditos exclusivos."
                        image="/assets/benefits/benefit_housing.png" // Updated image path
                        cta="Ver Planes"
                    />
                    {/* Card 2: Flota */}
                    <BenefitCardOverlay
                        title="Renueva tu Auto"
                        description="Facilidades para 0km y seminuevos."
                        image="/assets/benefits/benefit_fleet.png" // Updated image path
                        cta="Cotizar"
                    />
                    {/* Card 3: Combustible */}
                    <BenefitCardOverlay
                        title="Combustible"
                        description="Ahorra con descuentos en surtidor."
                        image="/assets/benefits/benefit_fuel.png" // Updated image path
                        cta="Ver Descuentos"
                    />
                    {/* Card 4: Taller */}
                    <BenefitCardOverlay
                        title="Taller & Servicios"
                        description="Mantenimiento a precios preferenciales."
                        image="/assets/benefits/benefit_mechanic.png" // Updated image path
                        cta="Ver Talleres"
                    />
                    {/* Card 5: Finanzas */}
                    <BenefitCardOverlay
                        title="Finanzas Digitales"
                        description="Tus ganancias seguras y al instante."
                        image="/assets/benefits/benefit_finance.png" // Updated image path
                        cta="Ver Más"
                        isPlaceholder={true}
                    />
                </CarouselContainer>
            </section>


        </div>
    );
}

// Internal Components

function CarouselContainer({ children }) {
    const scrollRef = React.useRef(null);
    const [isPaused, setIsPaused] = React.useState(false);
    const [activeIndex, setActiveIndex] = React.useState(0);
    const childCount = React.Children.count(children);

    // Auto-scroll logic
    React.useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        const scroll = () => {
            if (isPaused) return;

            const cardWidth = scrollContainer.children[0]?.children[0]?.clientWidth || 0;
            const gap = 24;
            const scrollAmount = cardWidth + gap;

            const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
            const currentScroll = scrollContainer.scrollLeft;

            if (currentScroll >= maxScroll - 10) {
                scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        };

        const intervalId = setInterval(scroll, 3000);
        return () => clearInterval(intervalId);
    }, [isPaused]);

    // Update active index on scroll
    const handleScroll = () => {
        const container = scrollRef.current;
        if (!container) return;

        const cardWidth = container.children[0]?.children[0]?.clientWidth || 0;
        const gap = 24;
        const itemSize = cardWidth + gap;
        const scrollPos = container.scrollLeft;

        const index = Math.round(scrollPos / itemSize);
        setActiveIndex(index);
    };

    // Scroll to specific index
    const scrollTo = (index) => {
        const container = scrollRef.current;
        if (!container) return;

        const cardWidth = container.children[0]?.children[0]?.clientWidth || 0;
        const gap = 24;
        const itemSize = cardWidth + gap;

        container.scrollTo({ left: index * itemSize, behavior: 'smooth' });
    };

    return (
        <div className="relative w-full">
            <div
                className="w-full overflow-x-auto pb-12 px-6 scrollbar-hide snap-x snap-mandatory"
                ref={scrollRef}
                onScroll={handleScroll}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
            >
                <div className="flex gap-6 w-max mx-auto md:mx-0 min-w-full lg:min-w-0">
                    {children}
                </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-3 mt-4">
                {Array.from({ length: childCount }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => scrollTo(i)}
                        className={`transition-all duration-300 rounded-full ${activeIndex === i ? 'w-8 h-2 bg-[#FFD700]' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}



function BenefitCardOverlay({ title, description, image, isPlaceholder }) {
    return (
        <div className="snap-start shrink-0 w-[calc(50vw-24px)] md:w-[calc(50vw-24px)] h-[300px] md:h-[400px] rounded-3xl overflow-hidden relative group bg-[#111]">
            {/* Background Image */}
            <img
                src={image}
                alt={title}
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isPlaceholder ? 'grayscale opacity-50' : ''}`}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />

            {/* Content Content - Bottom */}
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 flex flex-col items-start gap-2 h-full justify-end">

                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-xl md:text-3xl font-bold text-white mb-2 leading-tight">
                        {title}
                    </h3>
                    <p className="text-gray-300 font-medium text-sm md:text-base line-clamp-3 text-balance opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}
