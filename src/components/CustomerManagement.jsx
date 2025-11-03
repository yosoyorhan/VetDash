import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate'i import et
import { motion } from 'framer-motion';
import { Plus, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCustomersWithBalance } from '@/lib/storage';
import { toast } from '@/components/ui/use-toast';
import CustomerCard from '@/components/CustomerCard';

const CustomerManagement = () => { // onViewChange prop'unu kaldır
  const navigate = useNavigate(); // navigate fonksiyonunu başlat
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
    if (!customers) return [];
    return customers.filter(customer =>
      customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm)
    );
  }, [customers, searchTerm]);

  // onViewChange'i navigate ile değiştiren bir wrapper fonksiyonu
  const handleViewChange = (view, id) => {
    if (view === 'add-customer') {
      navigate('/add-customer');
    } else if (view === 'customer-profile' && id) {
      navigate(`/customer/${id}`);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Müşteri Yönetimi</h1>
          <p className="text-muted-foreground mt-1">{filteredCustomers.length} kayıtlı müşteri bulundu.</p>
        </div>
        <div className="w-full sm:w-auto flex items-center gap-2">
            <div className="relative flex-grow sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                    placeholder="İsim veya e-posta ile müşteri ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                />
            </div>
            {/* onClick'i yeni handleViewChange fonksiyonunu kullanacak şekilde güncelle */}
            <Button className="gap-2" onClick={() => handleViewChange('add-customer')}>
              <Plus className="w-4 h-4" />
              <span>Yeni Müşteri</span>
            </Button>
        </div>
      </motion.div>

      {loading ? (
        <div className="text-center py-16 flex justify-center items-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary"/> Müşteriler yükleniyor...
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCustomers.map((customer, index) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              index={index}
            />
          ))}
        </div>
      )}

      {filteredCustomers.length === 0 && !loading && (
        <div className="text-center py-16">
            <p className="text-xl font-semibold text-foreground">Müşteri Bulunamadı</p>
            <p className="text-muted-foreground mt-2">Aradığınız kriterlere uygun müşteri yok veya henüz müşteri eklemediniz.</p>
            {/* onClick'i yeni handleViewChange fonksiyonunu kullanacak şekilde güncelle */}
            <Button className="mt-4 gap-2" onClick={() => handleViewChange('add-customer')}>
              <Plus className="w-4 h-4" /> Yeni Müşteri Ekle
            </Button>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;