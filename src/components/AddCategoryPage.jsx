import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { saveProductCategory } from '@/lib/storage';

const AddCategoryPage = ({ onBack, onSaveSuccess }) => {
    const [categoryName, setCategoryName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!categoryName) {
            toast({ title: "Hata", description: "Kategori adı boş olamaz.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        try {
            await saveProductCategory(categoryName);
            toast({ title: "Başarılı!", description: "Yeni kategori eklendi." });
            onSaveSuccess();
        } catch (error) {
            toast({ title: "Hata!", description: error.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <header className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
                <div>
                    <h1 className="text-3xl font-bold">Yeni Ürün Kategorisi</h1>
                    <p className="text-muted-foreground">Ürünleri gruplamak için yeni bir kategori oluşturun.</p>
                </div>
            </header>
            <Card>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-6">
                        <div>
                            <Label htmlFor="categoryName">Kategori Adı *</Label>
                            <Input id="categoryName" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="ghost" onClick={onBack} disabled={isSaving}>İptal</Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Kaydet
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default AddCategoryPage;