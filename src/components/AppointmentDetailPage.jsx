import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, CheckCircle, Clock, XCircle, User, PawPrint, Calendar, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { getAppointmentById, updateAppointmentStatus } from '@/lib/storage';
import { Loader2 } from 'lucide-react';

const statusConfig = {
    'Onaylandı': { icon: CheckCircle, color: 'bg-green-100 text-green-700', label: 'Onaylandı' },
    'Bekliyor': { icon: Clock, color: 'bg-yellow-100 text-yellow-700', label: 'Bekliyor' },
    'İptal Edildi': { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'İptal Edildi' },
    'Tamamlandı': { icon: CheckCircle, color: 'bg-blue-100 text-blue-700', label: 'Tamamlandı' },
};

const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-start gap-4 py-3">
        <div className="text-muted-foreground">{icon}</div>
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-semibold">{value || 'Belirtilmemiş'}</p>
        </div>
    </div>
);

const AppointmentDetailPage = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadAppointment = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAppointmentById(appointmentId);
            setAppointment(data);
        } catch (error) {
            toast({ title: "Randevu Yüklenemedi", description: error.message, variant: "destructive" });
            navigate('/appointments');
        } finally {
            setLoading(false);
        }
    }, [appointmentId, navigate]);

    useEffect(() => {
        loadAppointment();
    }, [loadAppointment]);

    const handleStatusChange = async (newStatus) => {
        try {
            await updateAppointmentStatus(appointmentId, newStatus);
            toast({ title: "Durum Güncellendi", description: `Randevu durumu "${newStatus}" olarak değiştirildi.` });
            loadAppointment();
        } catch (error) {
            toast({ title: "Hata", description: "Durum güncellenemedi.", variant: "destructive" });
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    if (!appointment) {
        return <div className="text-center">Randevu bulunamadı.</div>;
    }

    const { customer, animal } = appointment;
    const currentStatus = statusConfig[appointment.status] || statusConfig['Bekliyor'];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <header className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => navigate('/appointments')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Randevu Detayları</h1>
                        <p className="text-muted-foreground">Randevu ID: {appointment.id}</p>
                    </div>
                </div>
                <Button onClick={() => navigate(`/appointment/${appointmentId}/edit`)}>
                    <Edit className="w-4 h-4 mr-2"/>
                    Düzenle
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Randevu Bilgileri</CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y">
                            <InfoRow icon={<Calendar className="w-5 h-5"/>} label="Tarih ve Saat" value={new Date(appointment.start_time).toLocaleString('tr-TR')} />
                            <InfoRow icon={<Clock className="w-5 h-5"/>} label="Durum" value={<Badge className={`${currentStatus.color} border-none`}>{currentStatus.label}</Badge>} />
                            <InfoRow icon={<User className="w-5 h-5"/>} label="Müşteri" value={customer?.full_name} />
                            <InfoRow icon={<PawPrint className="w-5 h-5"/>} label="Hayvan" value={`${animal?.name || ''} (${animal?.species || ''})`} />
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Müşteri İletişim</CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y">
                             <InfoRow icon={<Phone className="w-5 h-5"/>} label="Telefon" value={customer?.phone} />
                             <InfoRow icon={<Mail className="w-5 h-5"/>} label="E-posta" value={customer?.email} />
                        </CardContent>
                    </Card>
                    <Card>
                         <CardHeader>
                            <CardTitle>Durumu Değiştir</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            {Object.keys(statusConfig).map(status => (
                                <Button key={status} variant={appointment.status === status ? "default" : "outline"} onClick={() => handleStatusChange(status)}>
                                    {statusConfig[status].label}
                                </Button>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
};

export default AppointmentDetailPage;
