import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

import { supabase } from '@/api/goAppClient';
import { toast } from 'sonner';

export default function AdminLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            if (data.user) {
                // Determine if user is admin. For now, we assume anyone who can login here 
                // and probably has specific email domain or metadata is admin. 
                // For this demo, we just allow the login if Auth succeeds.
                localStorage.setItem('go_user', JSON.stringify({ email: data.user.email, role: 'admin', id: data.user.id }));
                toast.success("Sesión iniciada correctamente");
                navigate('/admin/dashboard');
            }
        } catch (error) {
            console.error("Login Error:", error);
            toast.error("Error al iniciar sesión", {
                description: error.message === "Invalid login credentials"
                    ? "Credenciales inválidas"
                    : error.message
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-[#1A1A2E] border-[#2D2D44]">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-[#00D4B1]/20 rounded-full flex items-center justify-center mb-4">
                        <Lock className="text-[#00D4B1]" size={24} />
                    </div>
                    <CardTitle className="text-white text-2xl">Admin Panel</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="admin@goapp.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-[#0F0F1A] border-[#2D2D44] text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-[#0F0F1A] border-[#2D2D44] text-white"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#00D4B1] hover:bg-[#00B89C] text-black font-bold"
                        >
                            {isLoading ? "Cargando..." : "Iniciar Sesión"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
