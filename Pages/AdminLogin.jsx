import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // Mock Login - in real app use Supabase Auth
        if (email && password) {
            localStorage.setItem('go_user', JSON.stringify({ email, role: 'admin' }));
            navigate('/admin/dashboard');
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
                            className="w-full bg-[#00D4B1] hover:bg-[#00B89C] text-black font-bold"
                        >
                            Iniciar Sesión
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
