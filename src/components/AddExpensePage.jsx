import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Calendar, Tags, User, FileText, ShoppingCart, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AddExpensePage = ({ expenseType, onBack, onSaveSuccess }) => {
    const isGeneralExpense = expenseType === 'general';
    const [formData, setFormData] = useState({
        description: '',
        expense_date: new Date().toISOString().substring(0, 16),
        due_date: '',
        tags: [],
        vendor: 'Belirtilmemiş',
        total_amount: '',
        tax_rate: '',
        tax_amount: '',
        paid_amount: '0',
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        toast({ title: 'Kaydediliyor...' });
        // Mock save
        setTimeout(() => {
            setIsSaving(false);
            toast({ title: 'Başarılı!', description: 'Harcama kaydedildi.' });
            onSaveSuccess();
        }, 1000);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <header className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-10 w-10" onClick={onBack}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Yeni Harcama Kaydı</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        {isGeneralExpense ? <FileText className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                        {isGeneralExpense ? 'Genel Harcama' : 'Ürün Satın Alımı'}
                    </p>
                </div>
            </header>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="md:col-span-2">
                            <Label htmlFor="description">Harcama Açıklaması</Label>
                            <Textarea id="description" placeholder="Örn: Aylık kira bedeli, elektrik faturası..." value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} />
                        </div>
                        
                        <div className="md:col-span-2">
                            <Label htmlFor="details">Harcama Detayı</Label>
                            <Input id="details" placeholder="Ek detaylar, fatura no vb." />
                        </div>

                        <div>
                            <Label htmlFor="expense_date">Tarih</Label>
                            <Input id="expense_date" type="datetime-local" value={formData.expense_date} onChange={e => setFormData(p => ({...p, expense_date: e.target.value}))} required />
                        </div>

                        <div>
                            <Label htmlFor="due_date">Son Ödeme Tarihi</Label>
                            <Input id="due_date" type="date" value={formData.due_date} onChange={e => setFormData(p => ({...p, due_date: e.target.value}))} />
                             <p className="text-xs text-muted-foreground mt-1">Ödeme tarihi geldiğinde bildirim alacaksınız.</p>
                        </div>
                        
                        <div>
                            <Label htmlFor="vendor">Satıcı/Tedarikçi</Label>
                            <Input id="vendor" placeholder="Firma veya kişi adı" value={formData.vendor} onChange={e => setFormData(p => ({...p, vendor: e.target.value}))} />
                        </div>

                         <div>
                            <Label htmlFor="tags">Etiketler</Label>
                            <Input id="tags" placeholder="Fatura, Maaş, Demirbaş (virgülle ayırın)" />
                        </div>

                        <div>
                            <Label htmlFor="total_amount">Toplam Tutar (Vergi Dahil)</Label>
                            <Input id="total_amount" type="number" step="0.01" value={formData.total_amount} onChange={e => setFormData(p => ({...p, total_amount: e.target.value}))} required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="tax_rate">Vergi (%)</Label>
                                <Input id="tax_rate" type="number" step="0.1" value={formData.tax_rate} onChange={e => setFormData(p => ({...p, tax_rate: e.target.value}))} />
                            </div>
                            <div>
                                <Label htmlFor="tax_amount">Toplam Vergi</Label>
                                <Input id="tax_amount" type="number" step="0.01" value={formData.tax_amount} onChange={e => setFormData(p => ({...p, tax_amount: e.target.value}))} />
                            </div>
                        </div>

                         <div className="md:col-span-2">
                            <Label htmlFor="paid_amount">Ödenen Tutar</Label>
                             <Select defaultValue="full">
                                <SelectTrigger id="paid_amount"><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="full">Tamamını Öde</SelectItem>
                                    <SelectItem value="partial">Kısmi Ödeme</SelectItem>
                                    <SelectItem value="none">Henüz Ödenmedi</SelectItem>
                                </SelectContent>
                           </Select>
                        </div>

                    </CardContent>
                    <div className="p-6 pt-0 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={onBack} disabled={isSaving}>İptal</Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                            Kaydı Tamamla
                        </Button>
                    </div>
                </Card>
            </form>
        </motion.div>
    );
};

export default AddExpensePage;