import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Clock, User, Hotel as Hospital, Car, Loader2, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { getCustomers, getAnimalsByCustomer, saveAppointment, getAppointmentById } from '@/lib/storage';

const statusConfig = {
  'Onaylandı': { icon: CheckCircle, color: 'bg-green-100 text-green-700', label: 'Onaylandı' },
  'Bekliyor': { icon: Clock, color: 'bg-yellow-100 text-yellow-700', label: 'Bekliyor' },
  'İptal Edildi': { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'İptal Edildi' },
  'Tamamlandı': { icon: CheckCircle, color: 'bg-blue-100 text-blue-700', label: 'Tamamlandı' },
};

const AddAppointmentPage = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const preselectedCustomerId = location.state?.customerId;

    const [formData, setFormData] = useState({
        customer_id: preselectedCustomerId || '',
        animal_id: null,
        start_time: '',
        appointment_type: 'Klinik',
        address: 'Belirtilmemiş',
        notes: '',
        status: 'Bekliyor'
    });
    const [customers, setCustomers] = useState([]);
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    const handleCustomerChange = useCallback(async (customerId) => {
        setFormData(prev => ({ ...prev, customer_id: customerId, animal_id: null }));
        if (customerId) {
            const animalList = await getAnimalsByCustomer(customerId);
            setAnimals(animalList);
            if (animalList.length > 0) {
                 setFormData(prev => ({ ...prev, animal_id: animalList[0].id }));
            }
        } else {
            setAnimals([]);
        }
    }, []);

    const loadInitialData = useCallback(async () => {
        setLoading(true);
        try {
            const customerList = await getCustomers();
            setCustomers(customerList);

            if (appointmentId) {
                const appointment = await getAppointmentById(appointmentId);
                if (appointment) {
                    await handleCustomerChange(appointment.customer_id);
                    setFormData({
                        ...appointment,
                        start_time: new Date(appointment.start_time).toISOString().substring(0, 16),
                        animal_id: appointment.animal_id || null,
                        address: appointment.address || 'Belirtilmemiş',
                    });
                }
            } else if (preselectedCustomerId) {
                await handleCustomerChange(preselectedCustomerId);
                setFormData(prev => ({...prev, start_time: getMinDateTime()}));
            }
            else {
                 setFormData(prev => ({...prev, start_time: getMinDateTime()}));
            }
        } catch (error) {
            toast({ title: "Veri Yüklenemedi", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [appointmentId, preselectedCustomerId, handleCustomerChange]);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.customer_id || !formData.start_time) {
            toast({ title: "Zorunlu Alanlar Eksik", description: "Müşteri ve Randevu Zamanı zorunludur.", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            await saveAppointment(formData);
            toast({ title: "Başarılı!", description: `Randevu başarıyla ${appointmentId ? 'güncellendi' : 'oluşturuldu'}.` });
            navigate('/appointments');
        } catch (error) {
            toast({ title: "Kaydetme Başarısız!", description: error.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <header className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">{appointmentId ? 'Randevuyu Düzenle' : 'Yeni Randevu Oluştur'}</h1>
                    <p className="text-muted-foreground">Randevu detaylarını doldurun. * ile işaretli alanlar zorunludur.</p>
                </div>
            </header>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customer & Animal Selection */}
                        <div className="space-y-4">
                            <CardTitle className="text-lg">Müşteri ve Hayvan Bilgileri</CardTitle>
                             <div>
                                <Label htmlFor="customer">Müşteri *</Label>
                                <div className="flex gap-2">
                                <Select value={formData.customer_id} onValueChange={handleCustomerChange}>
                                    <SelectTrigger id="customer"><SelectValue placeholder="Müşteri seçin..." /></SelectTrigger>
                                    <SelectContent>
                                        {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Button type="button" variant="outline" size="icon" onClick={() => navigate('/add-customer', { state: { from: location.pathname } })}><UserPlus className="w-4 h-4"/></Button>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="animal">Hayvan</Label>
                                <Select value={formData.animal_id || ''} onValueChange={(val) => setFormData(p => ({...p, animal_id: val || null}))} disabled={!formData.customer_id}>
                                    <SelectTrigger id="animal"><SelectValue placeholder="Hayvan seçin (Belirtilmemiş)" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={null}>Belirtilmemiş</SelectItem>
                                        {animals.map(a => <SelectItem key={a.id} value={a.id}>{a.name} ({a.species})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div className="space-y-4">
                            <CardTitle className="text-lg">Tarih ve Saat</CardTitle>
                            <div>
                                <Label htmlFor="start_time">Randevu Zamanı *</Label>
                                <Input id="start_time" type="datetime-local" value={formData.start_time} onChange={e => setFormData(p => ({...p, start_time: e.target.value}))} required min={getMinDateTime()} />
                            </div>
                        </div>
                        
                        {/* Appointment Type & Address */}
                        <div className="space-y-4">
                           <CardTitle className="text-lg">Randevu Tipi</CardTitle>
                           <Select value={formData.appointment_type} onValueChange={val => setFormData(p => ({...p, appointment_type: val}))}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Klinik"><div className="flex items-center gap-2"><Hospital className="w-4 h-4"/>Klinik Randevusu</div></SelectItem>
                                    <SelectItem value="Yerinde"><div className="flex items-center gap-2"><Car className="w-4 h-4"/>Yerinde Muayene</div></SelectItem>
                                </SelectContent>
                           </Select>
                           {formData.appointment_type === 'Yerinde' && (
                               <div>
                                   <Label htmlFor="address">Adres</Label>
                                   <Textarea id="address" placeholder="Detaylı adres bilgisi..." value={formData.address || ''} onChange={e => setFormData(p => ({...p, address: e.target.value}))}/>
                               </div>
                           )}
                        </div>

                        {/* Notes */}
                        <div className="space-y-4">
                           <CardTitle className="text-lg">Notlar</CardTitle>
                           <div>
                                <Label htmlFor="notes">Randevu Notu</Label>
                                <Textarea id="notes" placeholder="Örn: Genel kontrol, aşı takibi..." value={formData.notes || ''} onChange={e => setFormData(p => ({...p, notes: e.target.value}))} />
                           </div>
                           <div>
                                <Label htmlFor="status">Durum</Label>
                                <Select value={formData.status} onValueChange={val => setFormData(p => ({...p, status: val}))}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(statusConfig).map(([key, config]) => (
                                             <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                           </div>
                        </div>

                    </CardContent>
                    <div className="p-6 pt-0 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => navigate(-1)} disabled={isSaving}>İptal</Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                            Kaydet
                        </Button>
                    </div>
                </Card>
            </form>
        </motion.div>
    );
};

export default AddAppointmentPage;