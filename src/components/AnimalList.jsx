import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Download, Loader2, MoreVertical, PawPrint, Hash, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAnimals, getCustomers } from '@/lib/storage';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const AnimalList = () => {
  const [animals, setAnimals] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
        const [animalsData, customersData] = await Promise.all([
            getAnimals(),
            getCustomers()
        ]);
        setAnimals(animalsData);
        setCustomers(customersData);
    } catch (error) {
        toast({ title: "Hata", description: "Veriler yüklenemedi.", variant: "destructive" });
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredAnimals = useMemo(() => {
    return animals
      .filter(animal => {
        if (filterType === 'all') return true;
        if (filterType === 'büyükbaş') return ['sığır (i̇nek)', 'at', 'koyun', 'keçi'].some(s => animal.species?.toLowerCase().includes(s));
        if (filterType === 'pet') return ['köpek', 'kedi', 'kuş', 'kemirgenler ve küçük memeliler', 'sürüngenler'].some(s => animal.species?.toLowerCase().includes(s));
        return animal.species?.toLowerCase() === filterType;
      })
      .filter(animal => {
        const term = searchTerm.toLowerCase();
        return (
          animal.ear_tag_number?.toLowerCase().includes(term) ||
          animal.name?.toLowerCase().includes(term) ||
          animal.microchip_id?.toLowerCase().includes(term)
        );
      });
  }, [searchTerm, animals, filterType]);
  
  const handleNotImplemented = () => {
    toast({
      title: "🚧 Bu özellik henüz uygulanmadı",
      description: "Endişelenmeyin! Bir sonraki isteminizde talep edebilirsiniz! 🚀",
    });
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Sağlıklı': return 'success';
      case 'Tedavide': return 'warning';
      case 'Kritik': return 'destructive';
      default: return 'secondary';
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
          <h1 className="text-3xl font-bold text-theme-text">Hayvan Kayıtları</h1>
          <p className="text-muted-foreground mt-1">{loading ? 'Veriler yükleniyor...' : `${filteredAnimals.length} hayvan listeleniyor`}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleNotImplemented}>
            <Download className="w-4 h-4" />
            Dışa Aktar
          </Button>
          <Button variant="action" className="gap-2" onClick={() => navigate('/add-animal')}>
            <Plus className="w-4 h-4" />
            Yeni Hayvan
          </Button>
        </div>
      </motion.div>

      <Card className="glass-effect p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Küpe, isim veya mikroçip ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['all', 'büyükbaş', 'pet'].map(type => (
               <Button
                  key={type}
                  variant={filterType === type ? 'default' : 'outline'}
                  onClick={() => setFilterType(type)}
                  size="sm"
                  className="capitalize whitespace-nowrap"
                >
                  {type === 'all' ? 'Tümü' : type}
                </Button>
            ))}
          </div>
        </div>
      </Card>

      {loading ? (
         <div className="text-center py-12 text-muted-foreground flex justify-center items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span>Yükleniyor...</span>
         </div>
      ) : (
        <Card className="glass-effect">
            <AnimatePresence>
              {filteredAnimals.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>İsim</TableHead>
                            <TableHead>Küpe No</TableHead>
                            <TableHead>Tür</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAnimals.map((animal) => (
                           <motion.tr
                                key={animal.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="border-b"
                            >
                                <TableCell 
                                    onClick={() => navigate(`/animal/${animal.id}`)}
                                    className="cursor-pointer hover:bg-accent"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-secondary rounded-full">
                                            <PawPrint className="w-5 h-5 text-primary"/>
                                        </div>
                                        <div>
                                            <div className="font-medium text-foreground">{animal.name}</div>
                                            <div className="text-sm text-muted-foreground">{animal.microchip_id && <div className="flex items-center gap-1"><Hash size={12}/> {animal.microchip_id}</div>}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{animal.ear_tag_number || '-'}</TableCell>
                                <TableCell className="capitalize text-muted-foreground">{animal.species || '-'}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusBadgeVariant(animal.status)}>
                                        {animal.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                   <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                         <Button variant="ghost" size="icon">
                                            <MoreVertical className="w-4 h-4" />
                                         </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                         <DropdownMenuItem onClick={() => navigate(`/animal/${animal.id}`)}>
                                            <PawPrint className="mr-2 h-4 w-4" />
                                            <span>Profili Görüntüle</span>
                                         </DropdownMenuItem>
                                         <DropdownMenuItem onClick={() => navigate(`/animal/${animal.id}/edit`)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>Düzenle</span>
                                         </DropdownMenuItem>
                                      </DropdownMenuContent>
                                   </DropdownMenu>
                                </TableCell>
                            </motion.tr>
                        ))}
                    </TableBody>
                </Table>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <p className="text-xl font-semibold text-foreground">Hayvan Kaydı Bulunamadı</p>
                  <p className="text-muted-foreground mt-2 mb-6">Aradığınız kriterlere uygun hayvan yok veya henüz kayıt eklemediniz.</p>
                  <Button 
                    variant="action"
                    onClick={() => navigate('/add-animal')}
                  >
                    <Plus className="w-4 h-4 mr-2"/>
                    İlk Hayvanı Ekle
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
        </Card>
      )}
    </div>
  );
};

export default AnimalList;