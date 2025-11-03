import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, PawPrint, Coins, Plus, Edit, Printer, Home, Calendar, Briefcase, TrendingUp, DollarSign, ShoppingBag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getCustomerById, getAnimalsByCustomer, getTransactionsByCustomer, getAppointmentsByCustomer, saveTransaction } from '@/lib/storage';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { generateAvatar } from '@/lib/utils';

const CustomerProfile = ({ customerId, onBack, onViewChange }) => {
    const [customer, setCustomer] = useState(null);
    const [animals, setAnimals] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [customerData, animalsData, transactionsData, appointmentsData] = await Promise.all([
                getCustomerById(customerId),
                getAnimalsByCustomer(customerId),
                getTransactionsByCustomer(customerId),
                getAppointmentsByCustomer(customerId),
            ]);
            setCustomer(customerData);
            setAnimals(animalsData);
            setTransactions(transactionsData);
            setAppointments(appointmentsData);
        } catch (error) {
            toast({ title: "Veri Yükleme Hatası", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    useEffect(() => { loadData(); }, [loadData]);
    
    const financialSummary = useMemo(() => {
        const totalIncome = transactions.filter(tx => tx.transaction_type === 'gelir').reduce((sum, tx) => sum + tx.amount, 0);
        const totalExpense = transactions.filter(tx => tx.transaction_type === 'gider').reduce((sum, tx) => sum + tx.amount, 0);
        const balance = totalIncome - totalExpense;
        return { totalIncome, totalExpense, balance };
    }, [transactions]);
    
    const getInitials = (name) => {
        if (!name) return '?';
        const names = name.split(' ').filter(Boolean);
        if (names.length > 1) { return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase(); }
        return name.substring(0, 2).toUpperCase();
    };

    const handleNewTransaction = async (formData) => {
        try {
            await saveTransaction({ ...formData, customer_id: customerId });
            toast({ title: "Başarılı!", description: "Finansal hareket başarıyla kaydedildi." });
            loadData();
            return true;
        } catch (error) {
            toast({ title: "Hata!", description: error.message, variant: "destructive" });
            return false;
        }
    };

    if (loading) return <div className="flex items-center justify-center h-full min-h-[500px]"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>;
    if (!customer) return <div className="text-center py-12 text-muted-foreground">Müşteri bulunamadı. <Button onClick={onBack} variant="link">Geri Dön</Button></div>;

    const ProfileMenuLink = ({ icon: Icon, label, tabName }) => (
        <button onClick={() => setActiveTab(tabName)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tabName ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'}`}>
            <Icon className="w-4 h-4" />
            <span>{label}</span>
        </button>
    );

    const tabs = {
        overview: <OverviewTab summary={financialSummary} animals={animals} getInitials={getInitials} onViewChange={onViewChange} />,
        visits: <VisitsTab appointments={appointments.filter(a => new Date(a.start_time) < new Date())} customerId={customerId} onViewChange={onViewChange} />,
        appointments: <AppointmentsTab appointments={appointments.filter(a => new Date(a.start_time) >= new Date())} customerId={customerId} onViewChange={onViewChange} />,
        billing: <BillingTab transactions={transactions} onAddTransaction={() => setIsTransactionModalOpen(true)} />,
    };

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" />Geri</Button>
                    <h1 className="text-2xl font-bold">Müşteri Detayları</h1>
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Yeni Kayıt</Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewChange('add-animal', { customerId: customer.id, backTo: 'customer-profile', payload: customerId })}><PawPrint className="w-4 h-4 mr-2" />Hayvan Ekle</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onViewChange('add-appointment', { customerId: customer.id, backTo: 'customer-profile', payload: customerId })}><Calendar className="w-4 h-4 mr-2" />Randevu Oluştur</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsTransactionModalOpen(true)}><ShoppingBag className="w-4 h-4 mr-2" />Hizmet/Ürün Satışı</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3 space-y-6">
                    <Card className="p-6 text-center shadow-md">
                        <div 
                            className="w-16 h-16 rounded-full gradient-avatar mx-auto mb-4 text-2xl"
                            style={generateAvatar(customer.full_name)}
                        >
                            {getInitials(customer.full_name)}
                        </div>
                        <h2 className="text-lg font-bold">{customer.full_name}</h2>
                        <p className="text-sm text-muted-foreground">{customer.phone}</p>
                        <div className="flex justify-center gap-2 mt-4">
                            <Button variant="outline" size="sm" className="hover:shadow-md" onClick={() => onViewChange('edit-customer', customer.id)}><Edit className="w-4 h-4 mr-1"/> Düzenle</Button>
                            <Button variant="ghost" size="icon" className="hover:bg-accent"><Printer className="w-4 h-4 text-muted-foreground"/></Button>
                        </div>
                    </Card>
                    <Card className="p-4 shadow-md">
                        <nav className="space-y-1">
                            <ProfileMenuLink icon={Home} label="Genel Bakış" tabName="overview" />
                            <ProfileMenuLink icon={Briefcase} label="Ziyaretler" tabName="visits" />
                            <ProfileMenuLink icon={Calendar} label="Randevular" tabName="appointments" />
                            <ProfileMenuLink icon={Coins} label="Finansal Hareketler" tabName="billing" />
                        </nav>
                    </Card>
                </motion.div>
                <div className="lg:col-span-9">{tabs[activeTab]}</div>
            </div>
            
            <TransactionModal open={isTransactionModalOpen} onOpenChange={setIsTransactionModalOpen} onSave={handleNewTransaction} />
        </div>
    );
};

const KpiCard = ({ title, value, icon: Icon, ...props }) => (
    <Card className="hover:shadow-lg transition-shadow duration-300" {...props}>
        <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle><Icon className="w-4 h-4 text-muted-foreground" /></CardHeader>
        <CardContent><div className={`text-2xl font-bold ${value < 0 ? 'text-destructive' : 'text-foreground'}`}>{value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</div></CardContent>
    </Card>
);

const OverviewTab = ({ summary, animals, getInitials, onViewChange }) => (
     <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <KpiCard title="Güncel Bakiye" value={summary.balance} icon={DollarSign} />
            <KpiCard title="Toplam Harcama" value={summary.totalExpense} icon={TrendingUp} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
           <Card className="shadow-md">
               <CardHeader><CardTitle>Evcil Hayvanlar ({animals.length})</CardTitle></CardHeader>
               <CardContent>
                   {animals.length > 0 ? (
                       <div className="space-y-3">
                           {animals.map(animal => (
                               <div key={animal.id} className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-accent transition-colors cursor-pointer" onClick={() => onViewChange('animal-profile', animal.id)}>
                                   <div className="flex items-center gap-3">
                                       <div 
                                            className="w-10 h-10 rounded-full gradient-avatar text-sm flex-shrink-0"
                                            style={generateAvatar(animal.name)}
                                       >{getInitials(animal.name)}</div>
                                       <div>
                                           <div className="font-semibold">{animal.name}</div>
                                           <div className="text-xs text-muted-foreground capitalize">{animal.species}</div>
                                       </div>
                                   </div>
                                   <Button variant="ghost" size="sm">Detaylar</Button>
                               </div>
                           ))}
                       </div>
                   ) : (
                       <div className="h-36 flex items-center justify-center text-muted-foreground">Bu müşteriye ait hayvan kaydı bulunmuyor.</div>
                   )}
               </CardContent>
           </Card>
        </motion.div>
    </div>
);

const VisitsTab = ({ appointments, onViewChange, customerId }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle>Geçmiş Ziyaretler</CardTitle>
                    <CardDescription>Tamamlanmış veya geçmiş randevular listelenir.</CardDescription>
                </div>
                 <Button onClick={() => onViewChange('add-appointment', { customerId, backTo: 'customer-profile', payload: customerId })}><Plus className="w-4 h-4 mr-2" />Yeni Ziyaret Ekle</Button>
            </CardHeader>
            <CardContent>
                {appointments.length > 0 ? (
                    <div className="space-y-3">
                        {appointments.map(apt => (
                            <div key={apt.id} className="flex justify-between items-center p-3 -mx-3 rounded-lg hover:bg-accent">
                                <div>
                                    <p className="font-semibold">{new Date(apt.start_time).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                    <p className="text-sm text-muted-foreground">{apt.notes || "Not eklenmemiş"}</p>
                                </div>
                                <Badge variant={apt.status === 'Tamamlandı' ? 'success' : 'outline'}>{apt.status}</Badge>
                            </div>
                        ))}
                    </div>
                ) : <div className="h-36 flex flex-col items-center justify-center text-muted-foreground gap-4">
                        <p>Geçmiş ziyaret kaydı bulunmuyor.</p>
                        <Button variant="secondary" onClick={() => onViewChange('add-appointment', { customerId, backTo: 'customer-profile', payload: customerId })}><Plus className="w-4 h-4 mr-2" />İlk Ziyareti Ekle</Button>
                    </div>
                }
            </CardContent>
        </Card>
    </motion.div>
);

const AppointmentsTab = ({ appointments, customerId, onViewChange }) => (
     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
            <CardHeader><CardTitle>Gelecek Randevular</CardTitle><CardDescription>Müşterinin yaklaşan randevuları.</CardDescription></CardHeader>
            <CardContent>
                {appointments.length > 0 ? (
                     <div className="space-y-3">{appointments.map(apt => (
                        <div key={apt.id} className="flex justify-between items-center p-3 -mx-3 rounded-lg hover:bg-accent">
                            <div>
                                <p className="font-semibold">{new Date(apt.start_time).toLocaleString('tr-TR', { dateStyle: 'full', timeStyle: 'short' })}</p>
                                <p className="text-sm text-muted-foreground">{apt.notes || "Not eklenmemiş"}</p>
                            </div>
                            <Badge>{apt.status}</Badge>
                        </div>
                    ))}</div>
                ) : (
                    <div className="h-36 flex flex-col items-center justify-center text-center">
                        <p className="text-muted-foreground mb-4">Yaklaşan randevu bulunmuyor.</p>
                        <Button onClick={() => onViewChange('add-appointment', { customerId: customerId, backTo: 'customer-profile', payload: customerId })}><Plus className="w-4 h-4 mr-2" /> Yeni Randevu Oluştur</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    </motion.div>
);

const BillingTab = ({ transactions, onAddTransaction }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
            <CardHeader className="flex-row items-center justify-between"><CardTitle>Finansal Hareketler</CardTitle><Button onClick={onAddTransaction}><Plus className="w-4 h-4 mr-2" />Yeni İşlem</Button></CardHeader>
            <CardContent>
                 {transactions.length > 0 ? (
                     <div className="space-y-2">{transactions.map(tx => (
                        <div key={tx.id} className="flex justify-between items-center p-3 -mx-3 rounded-lg hover:bg-accent">
                           <div>
                               <p className="font-semibold capitalize">{tx.description || tx.category}</p>
                               <p className="text-sm text-muted-foreground">{new Date(tx.transaction_date).toLocaleDateString('tr-TR')}</p>
                           </div>
                           <p className={`font-bold ${tx.transaction_type === 'gelir' ? 'text-success' : 'text-destructive'}`}>
                               {tx.transaction_type === 'gelir' ? '+' : '-'}{Math.abs(tx.amount).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                           </p>
                        </div>
                    ))}</div>
                ) : <div className="h-36 flex items-center justify-center text-muted-foreground">Finansal hareket bulunmuyor.</div>}
            </CardContent>
        </Card>
    </motion.div>
);

const TransactionModal = ({ open, onOpenChange, onSave }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        transaction_type: 'gider',
        amount: '',
        description: '',
        category: 'Hizmet',
        transaction_date: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const success = await onSave(formData);
        if (success) {
            onOpenChange(false);
            setFormData({ transaction_type: 'gider', amount: '', description: '', category: 'Hizmet', transaction_date: new Date().toISOString().split('T')[0] });
        }
        setIsSaving(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader><DialogTitle>Yeni Finansal İşlem</DialogTitle><DialogDescription>Müşteri için bir gelir veya gider kaydı oluşturun.</DialogDescription></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <Select value={formData.transaction_type} onValueChange={v => setFormData(p => ({...p, transaction_type: v}))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>
                        <SelectItem value="gider">Gider/Borç (Satış)</SelectItem>
                        <SelectItem value="gelir">Gelir (Ödeme)</SelectItem>
                    </SelectContent></Select>
                    <div><Label>Tutar *</Label><Input type="number" placeholder="0.00" value={formData.amount} onChange={e => setFormData(p => ({...p, amount: e.target.value}))} required /></div>
                    <div><Label>Açıklama *</Label><Textarea placeholder="Örn: Muayene ücreti, aşı bedeli, nakit ödeme..." value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} required /></div>
                    <div><Label>Kategori</Label><Select value={formData.category} onValueChange={v => setFormData(p => ({...p, category: v}))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>
                        <SelectItem value="Hizmet">Hizmet</SelectItem>
                        <SelectItem value="Ürün Satışı">Ürün Satışı</SelectItem>
                        <SelectItem value="Ödeme">Ödeme</SelectItem>
                        <SelectItem value="Diğer">Diğer</SelectItem>
                    </SelectContent></Select></div>
                    <div><Label>İşlem Tarihi</Label><Input type="date" value={formData.transaction_date} onChange={e => setFormData(p => ({...p, transaction_date: e.target.value}))} /></div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>İptal</Button>
                        <Button type="submit" disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Kaydet</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CustomerProfile;