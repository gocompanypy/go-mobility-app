import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { goApp } from '@/api/goAppClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, ArrowRight, Info, Car, Bike } from 'lucide-react';
import Logo from '@/components/go/Logo';

// Vehicle Dictionary
const vehicleBrands = {
    'Toyota': ['Vitz', 'Corolla', 'Allion', 'Premio', 'Yaris', 'Hilux', 'Fortuner', 'Rush', 'Otros'],
    'Kia': ['Picanto', 'Rio', 'Cerato', 'Sportage', 'Sorento', 'Soluto', 'Otros'],
    'Hyundai': ['HB20', 'Accent', 'Elantra', 'Tucson', 'Santa Fe', 'Creta', 'i10', 'Otros'],
    'Nissan': ['Tiida', 'Versa', 'Sentra', 'Kicks', 'Frontier', 'Sunny', 'March', 'Otros'],
    'Chevrolet': ['Onix', 'Prisma', 'Cruze', 'Tracker', 'S10', 'Sail', 'Spark', 'Otros'],
    'Volkswagen': ['Gol', 'Polo', 'Virtus', 'Saveiro', 'Amarok', 'T-Cross', 'Nivus', 'Otros'],
    'Honda': ['Fit', 'Civic', 'HR-V', 'CR-V', 'City', 'WR-V', 'Otros'],
    'Otros': [], // Allow selecting "Otros" as a brand
    // Moto brands are handled separately or via tabs logic
};

const motoBrands = ['Honda', 'Kenton', 'Taiga', 'Leopard', 'Star', 'Yamaha', 'Suzuki', 'Otra'];

export default function DriverPreSignup() {
    const navigate = useNavigate();
    const [vehicleTypeTab, setVehicleTypeTab] = useState('car'); // 'car' | 'moto'

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        city: '',
        docType: 'ci',
        docNumber: '',
        vehicleBrand: '',
        vehicleModel: '',
        services: [],
        availability: '',
        suggestions: ''
    });

    const [availableModels, setAvailableModels] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Update models/brands based on Tab change
    useEffect(() => {
        setFormData(prev => ({ ...prev, vehicleBrand: '', vehicleModel: '' })); // Reset selection on tab change
    }, [vehicleTypeTab]);

    // Update models when brand changes (Car only)
    useEffect(() => {
        if (vehicleTypeTab === 'car' && formData.vehicleBrand && vehicleBrands[formData.vehicleBrand]) {
            setAvailableModels(vehicleBrands[formData.vehicleBrand]);
        } else {
            setAvailableModels([]);
        }
    }, [formData.vehicleBrand, vehicleTypeTab]);

    const handleServiceChange = (service, checked) => {
        setFormData(prev => {
            const currentServices = prev.services;
            if (checked) {
                return { ...prev, services: [...currentServices, service] };
            } else {
                return { ...prev, services: currentServices.filter(s => s !== service) };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const finalData = { ...formData, vehicleType: vehicleTypeTab };
        console.log("Submitting Form Data:", finalData);
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

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 0 30px rgba(255, 215, 0, 0.4)' }}>
                    <CheckCircle className="text-black" size={48} />
                </div>
                <h1 className="text-3xl font-black mb-2 tracking-tight">¡Registro Recibido!</h1>
                <p className="text-gray-400 max-w-sm mb-6 text-sm">
                    Estás un paso más cerca de conducir con <span className="text-[#FFD700] font-bold">GO</span>.
                </p>
                <Button
                    className="w-full max-w-xs font-bold text-black h-10 shadow-lg"
                    style={{ background: 'linear-gradient(to right, #FFD700, #FFA500)' }}
                    onClick={() => navigate('/')}
                >
                    Volver al Inicio
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-x-hidden py-8 px-4">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFD700]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="w-full max-w-2xl bg-[#0A0A0A] rounded-2xl border border-white/10 shadow-2xl p-6 relative z-10">

                {/* Compact Header */}
                <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                        <Logo size="sm" />
                        <div>
                            <h1 className="text-xl font-bold leading-none">Pre-Registro</h1>
                            <p className="text-xs text-gray-500">Únete a la nueva era</p>
                        </div>
                    </div>
                    <div className="px-2 py-1 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded text-xs font-bold text-[#FFD700]">
                        BETA
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Compact Grid: Personal Info */}
                    <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-12 md:col-span-6 space-y-1">
                            <Label className="text-xs text-gray-400 uppercase tracking-wider">Nombre Completo</Label>
                            <Input
                                placeholder="Tu nombre aquí"
                                className="bg-[#151515] border-white/10 h-9 text-sm focus:border-[#FFD700]"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-span-12 md:col-span-6 space-y-1">
                            <Label className="text-xs text-gray-400 uppercase tracking-wider">WhatsApp</Label>
                            <Input
                                type="tel"
                                placeholder="0981 112 223"
                                className="bg-[#151515] border-white/10 h-9 text-sm focus:border-[#FFD700]"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Compact Grid: Document & City */}
                    <div className="grid grid-cols-12 gap-3">
                        {/* Doc Type as Tabs for better UX */}
                        <div className="col-span-12 md:col-span-5 space-y-1">
                            <Label className="text-xs text-gray-400 uppercase tracking-wider">Tipo Doc</Label>
                            <Tabs
                                value={formData.docType}
                                onValueChange={(val) => setFormData({ ...formData, docType: val })}
                                className="w-full"
                            >
                                <TabsList className="grid w-full grid-cols-3 bg-[#151515] h-9 p-0.5">
                                    <TabsTrigger value="ci" className="text-[10px] h-full data-[state=active]:bg-[#FFD700] data-[state=active]:text-black">C.I.</TabsTrigger>
                                    <TabsTrigger value="ruc" className="text-[10px] h-full data-[state=active]:bg-[#FFD700] data-[state=active]:text-black">RUC</TabsTrigger>
                                    <TabsTrigger value="pasaporte" className="text-[10px] h-full data-[state=active]:bg-[#FFD700] data-[state=active]:text-black">PAS</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        <div className="col-span-12 md:col-span-7 space-y-1">
                            <Label className="text-xs text-gray-400 uppercase tracking-wider">N° Documento</Label>
                            <Input
                                placeholder={
                                    formData.docType === 'ruc' ? '80012345-6' :
                                        formData.docType === 'pasaporte' ? 'A1234567' :
                                            '3.123.456'
                                }
                                className="bg-[#151515] border-white/10 h-9 text-sm font-mono tracking-wide focus:border-[#FFD700]"
                                maxLength={15}
                                value={formData.docNumber}
                                onChange={(e) => setFormData({ ...formData, docNumber: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs text-gray-400 uppercase tracking-wider">Ciudad de Operación</Label>
                        <div className={formData.city === 'Otros' ? "grid grid-cols-[220px_1fr] gap-3" : "w-[220px]"}>
                            <Select
                                value={formData.city}
                                onValueChange={(val) => setFormData({ ...formData, city: val })}
                                required
                            >
                                <SelectTrigger className="bg-[#151515] border-white/10 h-8 text-xs">
                                    <SelectValue placeholder="Seleccionar Ciudad..." />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1A] border-[#2D2D44] text-white max-h-60">
                                    <SelectItem value="Asunción">Asunción</SelectItem>
                                    <SelectItem value="Capiatá">Capiatá</SelectItem>
                                    <SelectItem value="Ciudad del Este">Ciudad del Este</SelectItem>
                                    <SelectItem value="Fernando de la Mora">Fernando de la Mora</SelectItem>
                                    <SelectItem value="Itauguá">Itauguá</SelectItem>
                                    <SelectItem value="Lambaré">Lambaré</SelectItem>
                                    <SelectItem value="Limpio">Limpio</SelectItem>
                                    <SelectItem value="Luque">Luque</SelectItem>
                                    <SelectItem value="Mariano Roque Alonso">Mariano Roque Alonso</SelectItem>
                                    <SelectItem value="San Lorenzo">San Lorenzo</SelectItem>
                                    <SelectItem value="Otros">Otros</SelectItem>
                                </SelectContent>
                            </Select>

                            {formData.city === 'Otros' && (
                                <Input
                                    placeholder="Especificar ciudad..."
                                    className="bg-[#151515] border-white/10 h-9 text-xs focus:border-[#FFD700] animate-in fade-in slide-in-from-left-2"
                                    required
                                    onChange={(e) => setFormData({ ...formData, otherCity: e.target.value })}
                                />
                            )}
                        </div>
                    </div>

                    {/* TABS: Vehicle Category */}
                    <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs text-[#FFD700] uppercase tracking-wider font-bold">Vehículo</Label>
                        </div>

                        <Tabs
                            value={vehicleTypeTab}
                            onValueChange={setVehicleTypeTab}
                            className="w-full"
                        >
                            <TabsList className="grid w-full grid-cols-2 bg-[#151515] h-11 p-1">
                                <TabsTrigger value="car" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black font-bold">
                                    <Car size={16} className="mr-2" /> Automóvil
                                </TabsTrigger>
                                <TabsTrigger value="moto" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black font-bold">
                                    <Bike size={16} className="mr-2" /> Motocicleta
                                </TabsTrigger>
                            </TabsList>

                            {/* Content for Car */}
                            <TabsContent value="car" className="bg-[#111] border border-white/5 rounded-md p-4 mt-2 space-y-4 animate-in fade-in-50">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-gray-500 uppercase">Marca Auto</Label>
                                        <div className={formData.vehicleBrand === 'Otros' ? "grid grid-cols-[130px_1fr] gap-2" : "w-full"}>
                                            <Select value={formData.vehicleBrand} onValueChange={(val) => setFormData({ ...formData, vehicleBrand: val })}>
                                                <SelectTrigger className="bg-black/50 border-white/10 h-9 text-xs"><SelectValue placeholder="Marca" /></SelectTrigger>
                                                <SelectContent className="bg-[#1A1A1A] border-[#2D2D44] text-white max-h-48 overflow-y-auto">
                                                    {Object.keys(vehicleBrands).map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                                </SelectContent>
                                            </Select>

                                            {formData.vehicleBrand === 'Otros' && (
                                                <Input
                                                    placeholder="Especificar..."
                                                    className="bg-black/50 border-white/10 h-9 text-xs focus:border-[#FFD700] animate-in fade-in slide-in-from-left-2"
                                                    onChange={(e) => setFormData({ ...formData, otherBrand: e.target.value })}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-gray-500 uppercase">Modelo</Label>
                                        {formData.vehicleBrand === 'Otros' ? (
                                            <Input
                                                placeholder="Especificar Modelo"
                                                className="bg-black/50 border-white/10 h-9 text-xs"
                                                onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                                            />
                                        ) : (
                                            <Select value={formData.vehicleModel} onValueChange={(val) => setFormData({ ...formData, vehicleModel: val })} disabled={!availableModels.length}>
                                                <SelectTrigger className="bg-black/50 border-white/10 h-9 text-xs"><SelectValue placeholder="Modelo" /></SelectTrigger>
                                                <SelectContent className="bg-[#1A1A1A] border-[#2D2D44] text-white max-h-48">
                                                    {availableModels.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Content for Moto */}
                            <TabsContent value="moto" className="bg-[#111] border border-white/5 rounded-md p-4 mt-2 space-y-4 animate-in fade-in-50">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-gray-500 uppercase">Marca Moto</Label>
                                        <Select value={formData.vehicleBrand} onValueChange={(val) => setFormData({ ...formData, vehicleBrand: val })}>
                                            <SelectTrigger className="bg-black/50 border-white/10 h-9 text-xs"><SelectValue placeholder="Marca" /></SelectTrigger>
                                            <SelectContent className="bg-[#1A1A1A] border-[#2D2D44] text-white max-h-48">
                                                {motoBrands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-gray-500 uppercase">Modelo</Label>
                                        <Input
                                            placeholder="Ej: GTR 150"
                                            className="bg-black/50 border-white/10 h-9 text-xs"
                                            value={formData.vehicleModel}
                                            onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Compact Availability & Suggestions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="bg-[#111] p-3 rounded-lg border border-white/5">
                            <Label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Disponibilidad</Label>
                            <RadioGroup value={formData.availability} onValueChange={(val) => setFormData({ ...formData, availability: val })} className="space-y-1">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="full" id="r1" className="w-3 h-3 text-[#FFD700]" /><Label htmlFor="r1" className="text-xs">Full Time (+8h)</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="part" id="r2" className="w-3 h-3 text-[#FFD700]" /><Label htmlFor="r2" className="text-xs">Part Time (4-8h)</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="casual" id="r3" className="w-3 h-3 text-[#FFD700]" /><Label htmlFor="r3" className="text-xs">Ocasional (-4h)</Label></div>
                            </RadioGroup>
                        </div>
                        <div className="bg-[#111] p-3 rounded-lg border border-white/5">
                            <Label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Sugerencias</Label>
                            <Textarea
                                className="bg-black/30 border-white/10 h-[70px] text-xs resize-none focus:border-[#FFD700]"
                                placeholder="Escribe aquí..."
                                value={formData.suggestions}
                                onChange={(e) => setFormData({ ...formData, suggestions: e.target.value })}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full text-black font-extrabold h-11 text-sm uppercase tracking-widest shadow-[0_0_15px_rgba(255,215,0,0.2)] hover:shadow-[0_0_25px_rgba(255,215,0,0.4)] transition-all"
                        style={{ background: 'linear-gradient(to right, #FFD700, #FFA500)' }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Procesando...' : 'Finalizar Registro'}
                    </Button>

                </form>
            </div>

            <p className="mt-4 text-[10px] text-gray-600">
                Al registrarte aceptas los <span className="underline cursor-pointer hover:text-gray-400">Términos y Condiciones</span> de GO Mobility.
            </p>
        </div>
    );
}
