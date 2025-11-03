import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Loader2, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CustomerCard } from '@/components/CustomerCard';
import { CustomerDetailSlide } from '@/components/CustomerDetailSlide';
import { toast } from '@/components/ui/use-toast';

// Helper function to fetch customers from our mock API
const fetchCustomers = async () => {
  const response = await fetch('/api/customers');
  if (!response.ok) {
    throw new Error('Müşteri verileri yüklenirken bir hata oluştu.');
  }
  const data = await response.json();
  return data.customers;
};

const CustomerManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const {
    data: customers,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['customers'],
    queryFn: fetchCustomers,
  });

  if (isError) {
      toast({ title: "Veri Yükleme Hatası!", description: error.message, variant: "destructive" });
  }

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    return customers.filter(customer =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6">
      {/* Sticky Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-background/80 backdrop-blur-md pt-4 pb-2 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Müşteri Yönetimi</h1>
              <p className="text-muted-foreground mt-1">
                {isLoading ? 'Yükleniyor...' : `${filteredCustomers.length} kayıt bulundu.`}
              </p>
            </div>
            <div className="w-full sm:w-auto flex items-center gap-2">
                <div className="relative flex-grow sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        placeholder="İsim veya e-posta ile ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full"
                    />
                </div>
                <Button className="gap-2 bg-primary hover:bg-primary/90 text-white" onClick={() => navigate('/add-customer')}>
                  <Plus className="w-4 h-4" />
                  <span>Yeni Müşteri</span>
                </Button>
            </div>
        </div>
        <div className="flex justify-end mt-4">
            <div className="inline-flex items-center rounded-md bg-gray-200 p-1">
                <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="h-8 px-3 data-[state=active]:bg-white data-[state=active]:shadow">
                    <List className="w-4 h-4"/>
                </Button>
                <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className="h-8 px-3 data-[state=active]:bg-white data-[state=active]:shadow">
                    <LayoutGrid className="w-4 h-4"/>
                </Button>
            </div>
        </div>
      </motion.div>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary"/>
            <span className="text-muted-foreground">Müşteriler yükleniyor...</span>
        </div>
      ) : filteredCustomers.length > 0 ? (
        <motion.div
          key={viewMode}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={
            viewMode === 'list'
            ? 'space-y-3'
            : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
          }
        >
          {filteredCustomers.map((customer) => (
            <motion.div
              variants={itemVariants}
              key={customer.id}
              onClick={() => setSelectedCustomer(customer)}
              className="cursor-pointer"
            >
                 <CustomerCard customer={customer} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-20">
            <p className="text-xl font-semibold text-foreground">Müşteri Bulunamadı</p>
            <p className="text-muted-foreground mt-2">Aradığınız kriterlere uygun müşteri yok veya henüz müşteri eklemediniz.</p>
            <Button className="mt-6 gap-2 bg-primary hover:bg-primary/90 text-white" onClick={() => navigate('/add-customer')}>
              <Plus className="w-4 h-4" /> Yeni Müşteri Ekle
            </Button>
        </div>
      )}

      <CustomerDetailSlide customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
    </div>
  );
};

export default CustomerManagement;
