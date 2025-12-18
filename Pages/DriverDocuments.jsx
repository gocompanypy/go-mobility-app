import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    Upload,
    FileText,
    CreditCard,
    Shield,
    Car,
    Camera,
    CheckCircle,
    Loader2
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function DriverDocuments() {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false);

    // State to track status of each document: 'pending', 'uploading', 'uploaded'
    const [docStatus, setDocStatus] = useState({
        dni: 'pending',
        license: 'pending',
        insurance: 'pending',
        registration: 'pending',
        photo: 'pending'
    });

    const requiredDocs = [
        {
            id: 'dni',
            title: 'DNI / Pasaporte',
            subtitle: 'Frente y Reverso',
            icon: <CreditCard size={24} />,
            color: 'bg-blue-500/20 text-blue-400'
        },
        {
            id: 'license',
            title: 'Licencia de conducir',
            subtitle: 'Vigente y legible',
            icon: <FileText size={24} />,
            color: 'bg-purple-500/20 text-purple-400'
        },
        {
            id: 'insurance',
            title: 'Seguro del vehículo',
            subtitle: 'Póliza al día',
            icon: <Shield size={24} />,
            color: 'bg-green-500/20 text-green-400'
        },
        {
            id: 'registration',
            title: 'Registro del vehículo',
            subtitle: 'Cédula verde',
            icon: <Car size={24} />,
            color: 'bg-orange-500/20 text-orange-400'
        },
        {
            id: 'photo',
            title: 'Foto de perfil',
            subtitle: 'Rostro claro sin accesorios',
            icon: <Camera size={24} />,
            color: 'bg-pink-500/20 text-pink-400'
        },
    ];

    const handleUpload = (id) => {
        // Simulate upload process
        setDocStatus(prev => ({ ...prev, [id]: 'uploading' }));
        setTimeout(() => {
            setDocStatus(prev => ({ ...prev, [id]: 'uploaded' }));
        }, 1500);
    };

    const handleContinue = () => {
        setSubmitting(true);
        // Simulate API submission
        setTimeout(() => {
            setSubmitting(false);
            setSuccessModalOpen(true);
        }, 2000);
    };

    const handleCloseSuccess = () => {
        setSuccessModalOpen(false);
        navigate(createPageUrl('DriverLogin')); // Redirect to login after submission
    };

    const allUploaded = Object.values(docStatus).every(status => status === 'uploaded');

    return (
        <div className="min-h-screen bg-black text-white p-4 relative overflow-hidden flex flex-col items-center">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none fixed">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFD700]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FFA500]/5 rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <div className="w-full max-w-2xl flex items-center mb-8 relative z-10 pt-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 rounded-full bg-black/40 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-sm mr-4 group"
                >
                    <ArrowLeft size={24} className="text-gray-400 group-hover:text-white" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">
                        Documentación
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Sube los documentos requeridos para verificar tu cuenta</p>
                </div>
            </div>

            {/* Documents List */}
            <div className="w-full max-w-2xl space-y-4 relative z-10 pb-24">
                {requiredDocs.map((doc, index) => (
                    <div
                        key={doc.id}
                        className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between group hover:border-[#FFD700]/30 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${doc.color} border border-white/5`}>
                                {doc.icon}
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{doc.title}</h3>
                                <p className="text-sm text-gray-400 flex items-center gap-2">
                                    {docStatus[doc.id] === 'uploaded' ? (
                                        <span className="text-green-400 flex items-center gap-1">
                                            <CheckCircle size={12} /> Completado
                                        </span>
                                    ) : docStatus[doc.id] === 'uploading' ? (
                                        <span className="text-[#FFD700] flex items-center gap-1">
                                            <Loader2 size={12} className="animate-spin" /> Subiendo...
                                        </span>
                                    ) : (
                                        doc.subtitle
                                    )}
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={() => handleUpload(doc.id)}
                            disabled={docStatus[doc.id] === 'uploading' || docStatus[doc.id] === 'uploaded'}
                            variant="ghost"
                            className={`
                                rounded-xl px-4 py-6 border transition-all duration-300
                                ${docStatus[doc.id] === 'uploaded'
                                    ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                                    : 'bg-white/5 border-white/10 hover:bg-[#FFD700]/10 hover:border-[#FFD700]/50 hover:text-[#FFD700]'
                                }
                            `}
                        >
                            {docStatus[doc.id] === 'uploaded' ? (
                                <CheckCircle size={24} />
                            ) : (
                                <Upload size={24} />
                            )}
                        </Button>
                    </div>
                ))}
            </div>

            {/* Sticky Bottom Action */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-20 flex justify-center">
                <Button
                    onClick={handleContinue}
                    disabled={!allUploaded || submitting}
                    className="w-full max-w-2xl py-7 text-black font-bold text-lg rounded-xl relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        background: allUploaded ? 'linear-gradient(135deg, #FFD700, #FFA500)' : '#333',
                        boxShadow: allUploaded ? '0 8px 32px rgba(255, 215, 0, 0.3)' : 'none',
                        color: allUploaded ? 'black' : '#888'
                    }}
                >
                    {submitting ? (
                        <span className="flex items-center gap-2">
                            <Loader2 size={24} className="animate-spin" /> Procesando...
                        </span>
                    ) : (
                        "Enviar documentos"
                    )}
                </Button>
            </div>

            {/* Success Modal */}
            <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
                <DialogContent className="bg-[#1A1A1A] border-[#FFD700]/20 text-white sm:rounded-3xl p-0 overflow-hidden">
                    <div className="bg-gradient-to-b from-[#FFD700]/10 to-transparent p-8 flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-full bg-[#FFD700]/20 flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                            <div className="w-14 h-14 rounded-full bg-[#FFD700] flex items-center justify-center shadow-lg shadow-[#FFD700]/30">
                                <CheckCircle size={32} className="text-black" />
                            </div>
                        </div>

                        <DialogTitle className="text-2xl font-bold mb-2">¡Documentos Enviados!</DialogTitle>
                        <DialogDescription className="text-gray-400 text-base max-w-xs mx-auto mb-8">
                            Hemos recibido tu información correctamente. Nuestro equipo revisará tu solicitud para aprobar tu cuenta.
                        </DialogDescription>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 w-full mb-8 flex items-start gap-3 text-left">
                            <Shield className="text-blue-400 shrink-0 mt-0.5" size={20} />
                            <div>
                                <p className="text-blue-200 font-semibold text-sm">Verificación Segura</p>
                                <p className="text-blue-300/70 text-xs">El proceso de revisión suele tomar entre 24 y 48 horas hábiles.</p>
                            </div>
                        </div>

                        <Button
                            onClick={handleCloseSuccess}
                            className="w-full py-6 bg-white text-black font-bold hover:bg-gray-200 rounded-xl"
                        >
                            Entendido, ir al inicio
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
