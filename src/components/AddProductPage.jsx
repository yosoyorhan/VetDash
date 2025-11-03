import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { saveProduct, getProductCategories } from '@/lib/storage';

const AddProductPage = ({ productId, onBack, onSaveSuccess, onViewChange }) => {
    const [formData, setFormData] = useState({
        product_type: 'Ürün',
        category: '',
        name: '',
        barcode: '',
        product_code: '',
        serial_number: '',
        supplier: '',
        sale_price: '',
        purchase_price: '',
        tax_rate: '18',
        is_tax_included: true,
        quantity: '',
        unit: 'Adet',
        track_stock: true,
        critical_stock_limit: '',
        expiry_date: '',
        is_medical_record_usable: false,
        notes: ''
    });
    const [categories, setCategories] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

     useEffect(() => {
        const fetchCategories = async () => {
            const cats = await getProductCategories();
            setCategories(cats);
        };
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await saveProduct(formData);
            toast({ title: 'Başarılı!', description: 'Ürün başarıyla kaydedildi.' });
            onSaveSuccess();
        } catch (error) {
            toast({ title: "Kaydetme Başarısız!", description: error.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <header className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-10 w-10" onClick={onBack}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">{productId ? 'Ürünü Düzenle' : 'Yeni Ürün'}</h1>
                    <p className="text-muted-foreground">Envanter için yeni bir ürün ekleyin.</p>
                </div>
            </header>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                        <div className="lg:col-span-3">
                            <Label htmlFor="name">Ad *</Label>
                            <Input id="name" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} required />
                        </div>

                        <div>
                            <Label htmlFor="product_type">Ürün Tipi</Label>
                            <Select value={formData.product_type} onValueChange={val => setFormData(p => ({...p, product_type: val}))}><SelectTrigger id="product_type"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Ürün">Ürün</SelectItem><SelectItem value="Hizmet">Hizmet</SelectItem><SelectItem value="Aşı">Aşı</SelectItem></SelectContent></Select>
                        </div>
                        
                        <div>
                            <Label htmlFor="category">Kategori</Label>
                             <div className="flex gap-2">
                                <Select value={formData.category} onValueChange={val => setFormData(p => ({...p, category: val}))}><SelectTrigger id="category"><SelectValue placeholder="Kategori Seçin"/></SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                                <Button type="button" variant="outline" size="icon" onClick={() => onViewChange('add-category')}>
                                    <Plus className="w-4 h-4"/>
                                </Button>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="supplier">Sağlayıcı / Depo</Label>
                            <Input id="supplier" value={formData.supplier} onChange={e => setFormData(p => ({...p, supplier: e.target.value}))} />
                        </div>
                        
                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                            <div><Label htmlFor="barcode">Barkod</Label><Input id="barcode" value={formData.barcode} onChange={e => setFormData(p => ({...p, barcode: e.target.value}))} /></div>
                            <div><Label htmlFor="product_code">Ürün Kodu</Label><Input id="product_code" value={formData.product_code} onChange={e => setFormData(p => ({...p, product_code: e.target.value}))} /></div>
                            <div><Label htmlFor="serial_number">Seri Numarası</Label><Input id="serial_number" value={formData.serial_number} onChange={e => setFormData(p => ({...p, serial_number: e.target.value}))} /></div>
                        </div>
                        
                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                            <div><Label htmlFor="sale_price">Satış Fiyatı</Label><Input id="sale_price" type="number" value={formData.sale_price} onChange={e => setFormData(p => ({...p, sale_price: e.target.value}))} /></div>
                            <div><Label htmlFor="purchase_price">Alış Fiyatı</Label><Input id="purchase_price" type="number" value={formData.purchase_price} onChange={e => setFormData(p => ({...p, purchase_price: e.target.value}))} /></div>
                            <div><Label htmlFor="tax_rate">Vergi (%)</Label><Input id="tax_rate" type="number" value={formData.tax_rate} onChange={e => setFormData(p => ({...p, tax_rate: e.target.value}))} /></div>
                        </div>

                         <div className="flex items-center space-x-2">
                            <Checkbox id="is_tax_included" checked={formData.is_tax_included} onCheckedChange={val => setFormData(p => ({...p, is_tax_included: val}))} />
                            <label htmlFor="is_tax_included" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Satış fiyatına vergi dahil</label>
                        </div>

                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                             <div>
                                <Label htmlFor="quantity">Miktar</Label>
                                <Input id="quantity" type="number" value={formData.quantity} onChange={e => setFormData(p => ({...p, quantity: e.target.value}))} />
                             </div>
                             <div>
                                <Label htmlFor="unit">Birim</Label>
                                <Select value={formData.unit} onValueChange={val => setFormData(p => ({...p, unit: val}))}><SelectTrigger id="unit"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Adet">Adet</SelectItem><SelectItem value="Kutu">Kutu</SelectItem><SelectItem value="Litre">Litre</SelectItem><SelectItem value="kg">kg</SelectItem></SelectContent></Select>
                             </div>
                             <div>
                                <Label htmlFor="expiry_date">Miad (Son Kullanma)</Label>
                                <Input id="expiry_date" type="date" value={formData.expiry_date} onChange={e => setFormData(p => ({...p, expiry_date: e.target.value}))} />
                             </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                             <Switch id="track_stock" checked={formData.track_stock} onCheckedChange={val => setFormData(p => ({...p, track_stock: val}))} />
                             <Label htmlFor="track_stock">Stok Takibi</Label>
                        </div>
                        
                        {formData.track_stock && (
                             <div>
                                <Label htmlFor="critical_stock_limit">Kritik Stok Limiti</Label>
                                <Input id="critical_stock_limit" type="number" value={formData.critical_stock_limit} onChange={e => setFormData(p => ({...p, critical_stock_limit: e.target.value}))} />
                             </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                             <Switch id="is_medical_record_usable" checked={formData.is_medical_record_usable} onCheckedChange={val => setFormData(p => ({...p, is_medical_record_usable: val}))} />
                             <Label htmlFor="is_medical_record_usable">Medikal Kayıtlarda Kullanılabilir</Label>
                        </div>

                        <div className="lg:col-span-3">
                             <Label htmlFor="notes">Not</Label>
                             <Textarea id="notes" value={formData.notes} onChange={e => setFormData(p => ({...p, notes: e.target.value}))} />
                        </div>

                    </CardContent>
                    <div className="p-6 pt-0 flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={onBack} disabled={isSaving}>İptal</Button>
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

export default AddProductPage;