import React from 'react';
    import { motion } from 'framer-motion';
    import { Card } from '@/components/ui/card';
    import { Badge } from '@/components/ui/badge';
    import { Calendar, MapPin, Activity, Fingerprint } from 'lucide-react';

    const AnimalCard = ({ animal, onClick }) => {
      const getStatusColor = (status) => {
        switch (status) {
          case 'sağlıklı': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
          case 'tedavi': return 'bg-orange-100 text-orange-700 border-orange-300';
          case 'kritik': return 'bg-red-100 text-red-700 border-red-300';
          default: return 'bg-gray-100 text-gray-700 border-gray-300';
        }
      };

      const dob = animal.dob ? new Date(animal.dob) : null;
      const today = new Date();
      const age = dob ? today.getFullYear() - dob.getFullYear() - (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate()) ? 1 : 0) : null;

      return (
        <motion.div
          whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
          whileTap={{ scale: 0.98 }}
          layout
        >
          <Card 
            className="glass-effect p-5 cursor-pointer overflow-hidden transition-shadow duration-300 h-full flex flex-col"
            onClick={onClick}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-theme-text mb-1 truncate">
                  {animal.name || 'İsimsiz'}
                </h3>
                <p className="text-sm text-muted-foreground font-mono">
                  {animal.ear_tag || 'Küpe No Yok'}
                </p>
              </div>
              <Badge className={getStatusColor(animal.status)}>
                {animal.status || 'Bilinmiyor'}
              </Badge>
            </div>

            <div className="space-y-2.5 text-sm flex-grow">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Activity className="w-4 h-4 text-theme-primary flex-shrink-0" />
                <span className="text-theme-text font-medium">{animal.species}</span> • <span>{animal.breed || 'Bilinmiyor'}</span>
              </div>
              
              {dob && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4 text-theme-primary flex-shrink-0" />
                  <span className="text-theme-text font-medium">{dob.toLocaleDateString('tr-TR')}</span> 
                  {age !== null && <span className="text-xs">({age} yaşında)</span>}
                </div>
              )}
              
              {animal.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-theme-primary flex-shrink-0" />
                  <span className="text-theme-text font-medium truncate">{animal.location}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-border/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span className="font-mono">{animal.clinic_id}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      );
    };

    export default AnimalCard;