import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, DollarSign, CreditCard, Banknote, Loader2, User, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { getCustomers, savePayment, getPayments } from '@/lib/storage';

const AddPaymentDialog = ({ open, onOpenChange, onSaveSuccess }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [formData, setFormData] = useState({
        customer_id: null,
        payment_date: new Date().toISOString().substring(0, 16),
        amount: '',
        payment_method: 'Nakit',
        notes: ''
    });

    useEffect(() => {
        if(open) {
            getCustomers().then(setCustomers);
        }
    }, [open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount) {
            toast({ title: "Tutar girilmedi", description: "Lütfen bir ödeme tutarı girin.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            await savePayment(formData);
            onSaveSuccess();
            toast({ title: "Başarılı!", description: "Ödeme kaydedildi." });
        } catch (error) {
            toast({ title: "Hata!", description: error.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Ödeme Detayları</DialogTitle>
                    <DialogDescription>
                        Müşteriden alınan yeni bir ödemeyi kaydedin.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div>
                        <Label>Müşteri</Label>
                        <Select value={formData.customer_id || ''} onValueChange={val => setFormData(p => ({ ...p, customer_id: val || null }))}>
                            <SelectTrigger><SelectValue placeholder="Müşteri Seçin (Belirtilmemiş)"/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value={null}>Belirtilmemiş</SelectItem>
                                {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Tarih</Label>
                        <Input type="datetime-local" value={formData.payment_date} onChange={e => setFormData(p => ({ ...p, payment_date: e.target.value }))} />
                    </div>
                     <div>
                        <Label>Tutar *</Label>
                        <Input type="number" placeholder="0.00" value={formData.amount} onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))} required />
                    </div>
                    <div>
                        <Label>Ödeme Yöntemi</Label>
                        <Select value={formData.payment_method} onValueChange={val => setFormData(p => ({ ...p, payment_method: val }))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>
                            <SelectItem value="Belirtilmemiş">Belirtilmemiş</SelectItem>
                            <SelectItem value="Nakit"><div className="flex items-center gap-2"><Banknote className="w-4 h-4"/>Nakit</div></SelectItem>
                            <SelectItem value="Kredi Kartı"><div className="flex items-center gap-2"><CreditCard className="w-4 h-4"/>Kredi Kartı</div></SelectItem>
                            <SelectItem value="Havale/EFT">Havale/EFT</SelectItem>
                        </SelectContent></Select>
                    </div>
                     <div>
                        <Label>Not</Label>
                        <Input placeholder="Ödeme ile ilgili ek notlar" value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving}>İptal</Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DollarSign className="mr-2 h-4 w-4" />}
                            Kaydet
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const PaymentsPage = ({ onViewChange }) => {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadPayments = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getPayments();
            setPayments(data);
        } catch(e) {
            toast({ title: "Ödemeler yüklenemedi", description: e.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPayments();
    }, [loadPayments]);

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Ödemeler</h1>
                    <p className="text-muted-foreground mt-1">Toplam {payments.length} kayıt bulundu.</p>
                </div>
                <Button className="gap-2 bg-green-600 hover:bg-green-700" onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="w-4 h-4" /> Yeni Ödeme
                </Button>
            </motion.div>

            <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input placeholder="Müşteri bilgileriyle arama yapın..." className="pl-10" />
                    </div>
                     <Select>
                        <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Yöntem"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Nakit">Nakit</SelectItem>
                            <SelectItem value="Kredi Kartı">Kredi Kartı</SelectItem>
                            <SelectItem value="Havale/EFT">Havale/EFT</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {loading ? (
                <div className="text-center py-12"><Loader2 className="animate-spin text-primary mx-auto w-8 h-8" /></div>
            ) : payments.length === 0 ? (
                 <div className="text-center py-16">
                    <p className="text-xl font-semibold">Kayıt Yok</p>
                    <p className="text-muted-foreground mt-2">Henüz bir ödeme kaydı oluşturulmadı.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {payments.map(payment => (
                        <Card key={payment.id} className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                             <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${payment.payment_method === 'Nakit' ? 'bg-green-100' : 'bg-blue-100'}`}>
                                    {payment.payment_method === 'Nakit' ? <Banknote className="w-5 h-5 text-green-600"/> : <CreditCard className="w-5 h-5 text-blue-600"/>}
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">{payment.customers?.full_name || 'Belirtilmemiş Müşteri'}</p>
                                    <p className="text-sm text-muted-foreground">{new Date(payment.payment_date).toLocaleString('tr-TR')}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg text-green-600">+{payment.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
                                <p className="text-xs text-muted-foreground">{payment.payment_method}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
            
            <AddPaymentDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSaveSuccess={loadPayments} />
        </div>
    );
};

export default PaymentsPage;