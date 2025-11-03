import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getCustomersWithBalance } from '@/lib/storage';
import { toast } from '@/components/ui/use-toast';
import { generateAvatar } from '@/lib/utils';

const CustomerManagement = ({ onViewChange }) => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
        const data = await getCustomersWithBalance();
        setCustomers(data);
    } catch (error) {
        toast({ title: "Veri Yükleme Hatası!", description: error.message, variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer =>
      customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ').filter(Boolean);
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Müşteri Yönetimi</h1>
          <p className="text-muted-foreground mt-1">{filteredCustomers.length} kayıtlı müşteri bulundu.</p>
        </div>
        <Button className="gap-2" onClick={() => onViewChange('add-customer')}>
          <Plus className="w-4 h-4" /> Yeni Müşteri
        </Button>
      </motion.div>

      <Card className="p-4"><div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input placeholder="İsim veya e-posta ile müşteri ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div></Card>

      {loading ? (
        <div className="text-center py-16 flex justify-center items-center gap-3 text-muted-foreground"><Loader2 className="w-8 h-8 animate-spin text-primary"/> Müşteriler yükleniyor...</div>
      ) : (
        <div className="space-y-3">
          {filteredCustomers.map((customer, index) => (
            <motion.div key={customer.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} layout>
              <Card className="p-4 flex items-center justify-between hover:shadow-md cursor-pointer transition-shadow" onClick={() => onViewChange('customer-profile', customer.id)}>
                <div className="flex items-center gap-4">
                   <div 
                        className="w-11 h-11 rounded-full gradient-avatar flex-shrink-0 text-sm"
                        style={generateAvatar(customer.full_name)}
                    >
                    {getInitials(customer.full_name)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{customer.full_name}</p>
                    <p className="text-sm text-muted-foreground">{customer.email || 'E-posta yok'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-muted-foreground">Güncel Bakiye</p>
                    <p className={`font-bold text-lg ${customer.balance >= 0 ? 'text-success' : 'text-destructive'}`}>{customer.balance.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground"/>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {filteredCustomers.length === 0 && !loading && (
        <div className="text-center py-16"><p className="text-xl font-semibold text-foreground">Müşteri Bulunamadı</p><p className="text-muted-foreground mt-2">Aradığınız kriterlere uygun müşteri yok.</p></div>
      )}
    </div>
  );
};

export default CustomerManagement;