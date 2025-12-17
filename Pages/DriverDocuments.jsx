import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, FileText, CheckCircle } from 'lucide-react';

export default function DriverDocuments() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0F0F1A] text-white">
            <header className="p-4 border-b border-[#2D2D44] flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(createPageUrl('DriverHome'))}
                    className="text-white"
                >
                    <ArrowLeft size={24} />
                </Button>
                <h1 className="text-xl font-bold">Documentos</h1>
            </header>
            <main className="p-6 space-y-4">
                <Card className="bg-[#1A1A2E] border-[#2D2D44]">
                    <CardHeader>
                        <CardTitle className="text-white">Licencia de Conducir</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 bg-[#252538] rounded-lg">
                            <div className="flex items-center gap-3">
                                <FileText className="text-gray-400" />
                                <div>
                                    <p className="font-medium text-white">Frente y Reverso</p>
                                    <p className="text-sm text-gray-400">Pendiente de subida</p>
                                </div>
                            </div>
                            <Button variant="outline" className="border-[#FFD700] text-[#FFD700]">
                                <Upload size={16} className="mr-2" />
                                Subir
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
