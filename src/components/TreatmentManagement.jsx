import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getTreatments, getAnimals } from '@/lib/storage';
import { toast } from '@/components/ui/use-toast';

const TreatmentManagement = () => {
  const [treatments, setTreatments] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [treatmentsData, animalsData] = await Promise.all([getTreatments(), getAnimals()]);
    setTreatments(treatmentsData);
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

  const filteredTreatments = useMemo(() => {
    return treatments.filter(t => {
      const animalName = (animalMap[t.animal_id] || '').toLowerCase();
      const term = searchTerm.toLowerCase();
      return animalName.includes(term) || t.diagnosis?.toLowerCase().includes(term);
    });
  }, [treatments, searchTerm, animalMap]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-emerald-900">Tedavi Yönetimi</h1>
          <p className="text-emerald-600 mt-1">{filteredTreatments.length} tedavi kaydı</p>
        </div>
        <Button 
          className="gradient-primary text-white gap-2"
          onClick={() => toast({
            title: "🚧 Bu özellik henüz uygulanmadı",
            description: "Endişelenmeyin! Bir sonraki isteminizde talep edebilirsiniz! 🚀"
          })}
        >
          <Plus className="w-4 h-4" />
          Yeni Tedavi
        </Button>
      </motion.div>

      <Card className="glass-effect p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
          <Input
            placeholder="Hayvan veya tanı ile ara..."
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
            {filteredTreatments.map((treatment, index) => (
              <motion.div
                key={treatment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-effect p-5 hover:shadow-xl transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-emerald-900 text-lg mb-2">
                        {animalMap[treatment.animal_id] || 'Bilinmiyor'}
                      </h3>
                      <p className="text-gray-700 mb-2">{treatment.diagnosis}</p>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>İlaç: {treatment.medication}</span>
                        <span>Doz: {treatment.dose}</span>
                      </div>
                      {treatment.notes && (
                        <p className="text-sm text-gray-500 mt-2">{treatment.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(treatment.start_date).toLocaleDateString('tr-TR')}
                      </p>
                      {treatment.end_date && (
                        <p className="text-sm text-gray-500">
                          - {new Date(treatment.end_date).toLocaleDateString('tr-TR')}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredTreatments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-emerald-600">Tedavi kaydı bulunamadı</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TreatmentManagement;