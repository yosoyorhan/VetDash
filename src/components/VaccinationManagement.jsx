import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getVaccinations, getAnimals } from '@/lib/storage';
import { toast } from '@/components/ui/use-toast';

const VaccinationManagement = () => {
  const [vaccinations, setVaccinations] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [vaccinationsData, animalsData] = await Promise.all([getVaccinations(), getAnimals()]);
    setVaccinations(vaccinationsData);
    setAnimals(animalsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const animalMap = useMemo(() => {
    return animals.reduce((acc, animal) => {
      acc[animal.id] = animal.name || animal.ear_tag;
      return acc;
    }, {});
  }, [animals]);

  const filteredVaccinations = useMemo(() => {
    return vaccinations.filter(v => {
      const animalName = (animalMap[v.animal_id] || '').toLowerCase();
      const term = searchTerm.toLowerCase();
      return animalName.includes(term) || v.vaccine_type?.toLowerCase().includes(term);
    });
  }, [vaccinations, searchTerm, animalMap]);

  const isUpcoming = (nextDueDate) => {
    if (!nextDueDate) return false;
    const dueDate = new Date(nextDueDate);
    const today = new Date();
    const daysUntil = (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntil >= 0 && daysUntil <= 30;
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-emerald-900">Aşı Yönetimi</h1>
          <p className="text-emerald-600 mt-1">{filteredVaccinations.length} aşı kaydı</p>
        </div>
        <Button 
          className="gradient-primary text-white gap-2"
          onClick={() => toast({
            title: "🚧 Bu özellik henüz uygulanmadı",
            description: "Endişelenmeyin! Bir sonraki isteminizde talep edebilirsiniz! 🚀"
          })}
        >
          <Plus className="w-4 h-4" />
          Yeni Aşı
        </Button>
      </motion.div>

      <Card className="glass-effect p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
          <Input
            placeholder="Hayvan veya aşı türü ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-12 text-emerald-600">Yükleniyor...</div>
      ) : (
        <>
          <div className="space-y-3">
            {filteredVaccinations.map((vaccination, index) => (
              <motion.div
                key={vaccination.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`glass-effect p-5 hover:shadow-xl transition-all ${
                  isUpcoming(vaccination.next_due_date) ? 'border-l-4 border-yellow-500' : ''
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-emerald-900 text-lg mb-2">
                        {animalMap[vaccination.animal_id] || 'Bilinmiyor'}
                      </h3>
                      <p className="text-gray-700 mb-2">{vaccination.vaccine_type}</p>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>Lot: {vaccination.batch_no}</span>
                        <span>Uygulayan: {vaccination.administered_by}</span>
                      </div>
                      {vaccination.next_due_date && (
                        <div className="flex items-center gap-2 mt-2 text-sm">
                          <Calendar className="w-4 h-4 text-emerald-500" />
                          <span className={isUpcoming(vaccination.next_due_date) ? 'text-yellow-600 font-medium' : 'text-gray-600'}>
                            Sonraki: {new Date(vaccination.next_due_date).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(vaccination.date_administered).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredVaccinations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-emerald-600">Aşı kaydı bulunamadı</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VaccinationManagement;