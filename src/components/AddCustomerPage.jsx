import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { getCustomerById, saveCustomer } from '@/lib/storage';

const AddCustomerPage = ({ customerId, onBack, onSaveSuccess }) => {
    const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', address: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const isEditMode = !!customerId;

    useEffect(() => {
        const loadCustomer = async () => {
            if (isEditMode) {
                try {
                    const customer = await getCustomerById(customerId);
                    if (customer) {
                        setFormData(customer);
                    } else {
                        toast({ title: "Hata", description: "Müşteri bulunamadı.", variant: "destructive" });
                        onBack();
                    }
                } catch (error) {
                    toast({ title: "Hata", description: "Müşteri bilgileri yüklenemedi.", variant: "destructive" });
                }
            }
            setLoading(false);
        };
        loadCustomer();
    }, [customerId, isEditMode, onBack]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const savedData = await saveCustomer(formData);
            toast({ title: "Başarılı!", description: `Müşteri başarıyla ${isEditMode ? 'güncellendi' : 'kaydedildi'}.` });
            onSaveSuccess(savedData.id);
        } catch (error) {
            toast({ title: "Hata!", description: error.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin w-8 h-8" /></div>;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <header className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
                <div>
                    <h1 className="text-3xl font-bold">{isEditMode ? 'Müşteriyi Düzenle' : 'Yeni Müşteri Ekle'}</h1>
                    <p className="text-muted-foreground">{isEditMode ? 'Müşteri bilgilerini güncelleyin.' : 'Sisteme yeni bir müşteri ekleyin.'}</p>
                </div>
            </header>
            <Card>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-6">
                        <div>
                            <Label htmlFor="fullName">Tam Adı *</Label>
                            <Input id="fullName" value={formData.full_name || ''} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
                        </div>
                        <div>
                            <Label htmlFor="email">E-posta</Label>
                            <Input id="email" type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div>
                            <Label htmlFor="phone">Telefon</Label>
                            <Input id="phone" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                        <div>
                            <Label htmlFor="address">Adres</Label>
                            <Input id="address" value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="ghost" onClick={onBack} disabled={isSaving}>İptal</Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                {isEditMode ? 'Güncelle' : 'Kaydet'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default AddCustomerPage;