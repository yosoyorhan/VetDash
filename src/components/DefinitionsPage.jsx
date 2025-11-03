import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Package, Stethoscope, Calendar, MessageSquare, Plus, Search, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DefinitionsPage = () => {
    const menuItems = [
        { id: 'tags', label: 'Etiketler', icon: Tag },
        { id: 'product-categories', label: 'Ürün Kategorileri', icon: Package },
        { id: 'diagnoses', label: 'Teşhisler', icon: Stethoscope },
        { id: 'appointment-types', label: 'Randevu Tipleri', icon: Calendar },
        { id: 'exam-templates', label: 'Muayene Sonuç Şablonları', icon: MessageSquare, active: true },
    ];
    
    const [activeMenu, setActiveMenu] = useState('exam-templates');

    const renderContent = () => {
        switch(activeMenu) {
            case 'exam-templates':
                return <ExamTemplatesContent />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="p-4 bg-primary/10 rounded-full mb-4">
                           {React.createElement(menuItems.find(m => m.id === activeMenu)?.icon || Tag, {className: "w-8 h-8 text-primary"})}
                        </div>
                        <h2 className="text-xl font-bold">Burası Geliştirme Aşamasında</h2>
                        <p className="text-muted-foreground mt-2">Bu bölüm yakında hazır olacak!</p>
                    </div>
                );
        }
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3">
                <h1 className="text-3xl font-bold mb-6">Tanımlamalar</h1>
                 <Card>
                    <CardContent className="p-2">
                        <nav className="space-y-1">
                            {menuItems.map(item => (
                                <button key={item.id} onClick={() => setActiveMenu(item.id)} className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-colors ${item.active ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}>
                                    <div className="flex items-center gap-3">
                                        <item.icon className="w-5 h-5" />
                                        <span>{item.label}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            ))}
                        </nav>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-9">
                {renderContent()}
            </div>
        </div>
    );
};

const ExamTemplatesContent = () => {
    return (
         <div className="space-y-6">
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Muayene Sonuç Şablonları</h2>
                    <p className="text-muted-foreground mt-1">Tekrarlayan muayeneler için zaman kazanın.</p>
                </div>
                <Button onClick={() => toast({title: "Yakında!"})}><Plus className="w-4 h-4 mr-2"/>Yeni Şablon Oluştur</Button>
            </header>
            <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input placeholder="Şablon adı ile arama yapın..." className="pl-10" />
                    </div>
                    <Select>
                        <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Hayvan Türü"/></SelectTrigger>
                        <SelectContent><SelectItem value="kedi">Kedi</SelectItem><SelectItem value="köpek">Köpek</SelectItem></SelectContent>
                    </Select>
                </div>
            </Card>
            <div className="text-center py-16">
                <p className="text-xl font-semibold">Kayıt Yok</p>
                <p className="text-muted-foreground mt-2">Henüz muayene sonuç şablonu oluşturulmadı.</p>
            </div>
         </div>
    );
}

export default DefinitionsPage;