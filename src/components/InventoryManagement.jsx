import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getProducts } from '@/lib/storage';
import { toast } from '@/components/ui/use-toast';

const InventoryManagement = ({ onViewChange }) => {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
        const data = await getProducts();
        setInventory(data);
    } catch(e) {
        toast({ title: "Envanter yüklenemedi", description: e.message, variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredInventory = useMemo(() => {
    if (!Array.isArray(inventory)) return [];
    return inventory.filter(item =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventory, searchTerm]);

  const isLowStock = (item) => item.track_stock && item.quantity < item.critical_stock_limit;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Envanter Yönetimi</h1>
          <p className="text-muted-foreground mt-1">{filteredInventory.length} ürün bulundu.</p>
        </div>
        <Button className="gap-2" onClick={() => onViewChange('add-product')}>
          <Plus className="w-4 h-4" />
          Yeni Ürün
        </Button>
      </motion.div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Ürün adı veya kodu ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-12 flex justify-center items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin w-6 h-6 text-primary"/> Envanter yükleniyor...</div>
      ) : (
        <>
          {filteredInventory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInventory.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`p-5 hover:shadow-lg transition-all ${
                    isLowStock(item) ? 'border-l-4 border-yellow-500' : ''
                  }`}>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-foreground text-lg">{item.name}</h3>
                      {isLowStock(item) && (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" title={`Kritik stok seviyesi (${item.critical_stock_limit}) altında`}/>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Kategori:</span>
                        <span className="font-medium text-foreground">{item.category || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Miktar:</span>
                        <span className={`font-medium ${isLowStock(item) ? 'text-yellow-600' : 'text-foreground'}`}>
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                      {item.expiry_date && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">SKT:</span>
                          <span className="font-medium text-foreground">
                            {new Date(item.expiry_date).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Satış Fiyatı:</span>
                        <span className="font-medium text-foreground">{item.sale_price ? `${item.sale_price} TL` : '-'}</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl font-semibold">Kayıt Bulunamadı</p>
              <p className="text-muted-foreground mt-2">Aradığınız kriterlere uygun ürün yok veya henüz ürün eklenmemiş.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InventoryManagement;