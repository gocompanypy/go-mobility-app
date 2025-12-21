import React, { useState } from 'react';
import { X, CheckCircle, XCircle, RotateCw, ZoomIn, Eye, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function DocumentVerifier({ driver, isOpen, onClose, onApprove, onReject }) {
    if (!driver) return null;

    const [activeDoc, setActiveDoc] = useState('license_front');
    const [rotation, setRotation] = useState(0);
    const [viewedDocs, setViewedDocs] = useState(new Set());
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false);

    const documents = [
        {
            id: 'license_front',
            label: 'Licencia (Frente)',
            src: driver.documents?.license_front,
            contextData: { label: 'Nro. Licencia', value: driver.license_number }
        },
        {
            id: 'license_back',
            label: 'Licencia (Dorso)',
            src: driver.documents?.license_back,
            contextData: { label: 'Vencimiento', value: driver.license_expiry }
        },
        {
            id: 'id_card_front',
            label: 'Cédula de Identidad',
            src: driver.documents?.id_card_front,
            contextData: { label: 'Nombre', value: `${driver.first_name} ${driver.last_name}` }
        },
        {
            id: 'insurance',
            label: 'Seguro del Vehículo',
            src: driver.documents?.insurance,
            contextData: { label: 'Vehículo', value: `${driver.vehicle_make} ${driver.vehicle_model} (${driver.vehicle_plate})` }
        },
    ];

    const currentDoc = documents.find(d => d.id === activeDoc);

    const handleDocView = (docId) => {
        setActiveDoc(docId);
        setRotation(0);
        setViewedDocs(prev => new Set(prev).add(docId));
    };

    const rotateImage = () => setRotation(prev => (prev + 90) % 360);

    const handleReject = () => {
        onReject(driver.id, rejectionReason);
        setShowRejectDialog(false);
        setRejectionReason('');
    };

    const allDocsViewed = documents.every(d => viewedDocs.has(d.id));

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl bg-[#0F0F1A] border-[#2D2D44] text-white h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b border-[#2D2D44] bg-[#1A1A2E]">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                Verificación de Documentos
                                {!allDocsViewed && (
                                    <Badge variant="outline" className="text-yellow-500 border-yellow-500/50 text-xs">
                                        <AlertTriangle size={12} className="mr-1" />
                                        Revisión incompleta
                                    </Badge>
                                )}
                            </DialogTitle>
                            <p className="text-gray-400 text-sm mt-1">
                                {driver.first_name} {driver.last_name} • {driver.vehicle_make} {driver.vehicle_model}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                                onClick={() => setShowRejectDialog(true)}
                            >
                                <XCircle size={18} className="mr-2" />
                                Rechazar
                            </Button>
                            <Button
                                className="bg-[#00D4B1] hover:bg-[#00B89C] text-black"
                                onClick={() => onApprove(driver.id)}
                                disabled={!allDocsViewed}
                                title={!allDocsViewed ? "Debes revisar todos los documentos primero" : ""}
                            >
                                <CheckCircle size={18} className="mr-2" />
                                Aprobar Todo
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar List */}
                    <div className="w-72 bg-[#1A1A2E] border-r border-[#2D2D44] overflow-y-auto p-4 space-y-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-3 px-2">Documentos Requeridos</p>
                        {documents.map((doc) => (
                            <button
                                key={doc.id}
                                onClick={() => handleDocView(doc.id)}
                                className={`w-full text-left p-3 rounded-lg border transition-all relative group ${activeDoc === doc.id
                                        ? 'bg-[#00D4B1]/10 border-[#00D4B1] text-[#00D4B1]'
                                        : 'border-transparent hover:bg-[#252538] text-gray-300'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <p className="font-medium text-sm">{doc.label}</p>
                                    {viewedDocs.has(doc.id) && (
                                        <Eye size={14} className="text-blue-400 opacity-70" title="Visto" />
                                    )}
                                </div>
                                {doc.src ? (
                                    <span className="text-xs text-green-500 flex items-center gap-1 mt-1">
                                        <CheckCircle size={10} /> Cargado
                                    </span>
                                ) : (
                                    <span className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                        <XCircle size={10} /> Pendiente
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Main Viewer */}
                    <div className="flex-1 bg-black relative flex flex-col items-center justify-center p-8 overflow-hidden">
                        {/* Context Data Bar */}
                        {currentDoc?.contextData && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black/80 backdrop-blur-md px-6 py-2 rounded-full border border-gray-800 flex items-center gap-3 shadow-xl">
                                <span className="text-gray-400 text-sm font-medium">{currentDoc.contextData.label}:</span>
                                <span className="text-[#00D4B1] font-mono font-bold text-lg">{currentDoc.contextData.value || 'N/A'}</span>
                            </div>
                        )}

                        {/* Toolbar */}
                        <div className="absolute bottom-6 flex gap-2 z-20">
                            <Button size="icon" variant="secondary" onClick={rotateImage} className="rounded-full bg-gray-800 hover:bg-gray-700 text-white shadow-lg">
                                <RotateCw size={20} />
                            </Button>
                            {/* Zoom placeholder - would require more complex state */}
                            <Button size="icon" variant="secondary" className="rounded-full bg-gray-800 hover:bg-gray-700 text-white shadow-lg">
                                <ZoomIn size={20} />
                            </Button>
                        </div>

                        {currentDoc?.src ? (
                            <img
                                src={currentDoc.src}
                                alt={currentDoc.label}
                                className="max-w-full max-h-full object-contain transition-transform duration-300 shadow-2xl"
                                style={{ transform: `rotate(${rotation}deg)` }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://placehold.co/600x400/1a1a2e/ffffff?text=Imagen+No+Disponible";
                                }}
                            />
                        ) : (
                            <div className="text-center text-gray-500">
                                <XCircle size={64} className="mx-auto mb-4 opacity-30" />
                                <p className="text-lg">No se ha subido este documento</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reject Dialog Overlay */}
                <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                    <DialogContent className="bg-[#1A1A2E] border-[#2D2D44] text-white max-w-md">
                        <DialogHeader>
                            <DialogTitle>Rechazar Documentación</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <p className="text-gray-400 text-sm">
                                Por favor, indica el motivo del rechazo. Este mensaje será enviado al conductor para que pueda corregir los documentos.
                            </p>
                            <Textarea
                                placeholder="Ej: La foto de la licencia está borrosa o vencida..."
                                className="bg-[#0F0F1A] border-[#2D2D44] min-h-[100px]"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setShowRejectDialog(false)} className="text-gray-400">
                                Cancelar
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleReject}
                                disabled={!rejectionReason.trim()}
                                className="bg-red-500 hover:bg-red-600"
                            >
                                Confirmar Rechazo
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </DialogContent>
        </Dialog>
    );
}
