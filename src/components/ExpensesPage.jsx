import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ShoppingCart, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const ExpensesPage = ({ onViewChange }) => {
    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold">Yeni Harcama</h1>
                <p className="text-muted-foreground mt-1">Oluşturmak istediğiniz harcama türünü seçin.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                    <Card 
                        className="h-full hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                        onClick={() => onViewChange('add-expense', { type: 'general' })}
                    >
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Genel Harcama</CardTitle>
                            <FileText className="w-6 h-6 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Kliniğin kira, elektrik, su, maaş gibi genel işletme giderlerini kaydedin.
                            </CardDescription>
                            <div className="mt-4 text-primary font-semibold flex items-center gap-2">
                                Kayıt Oluştur <ArrowRight className="w-4 h-4" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <Card 
                        className="h-full hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                        onClick={() => onViewChange('add-expense', { type: 'product_purchase' })}
                    >
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Ürün Satın Alımı</CardTitle>
                            <ShoppingCart className="w-6 h-6 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Envantere eklenecek ilaç, mama, medikal malzeme gibi ürün alımlarını kaydedin.
                            </CardDescription>
                             <div className="mt-4 text-primary font-semibold flex items-center gap-2">
                                Kayıt Oluştur <ArrowRight className="w-4 h-4" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default ExpensesPage;