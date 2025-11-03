import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Plus, Search, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

const mockTasks = [
  { id: 1, description: 'Aşı stoğunu kontrol et', assignedTo: 'Elif', status: 'completed', priority: 'medium' },
  { id: 2, description: 'Karabaş\'ın kontrol randevusunu ara', assignedTo: 'Can', status: 'pending', priority: 'high' },
  { id: 3, description: 'Yeni gelen ilaçları sisteme gir', assignedTo: 'Elif', status: 'in_progress', priority: 'high' },
  { id: 4, description: 'Haftalık raporu hazırla', assignedTo: 'Yönetici', status: 'pending', priority: 'low' },
];

const priorityConfig = {
  high: { color: 'border-red-500 bg-red-50', label: 'Yüksek Öncelik' },
  medium: { color: 'border-yellow-500 bg-yellow-50', label: 'Orta Öncelik' },
  low: { color: 'border-gray-400 bg-gray-50', label: 'Düşük Öncelik' },
};

const statusConfig = {
    pending: { label: 'Bekliyor', color: 'text-yellow-600' },
    in_progress: { label: 'Devam Ediyor', color: 'text-blue-600' },
    completed: { label: 'Tamamlandı', color: 'text-green-600' }
};

const Tasks = () => {

  const handleAction = () => {
    toast({
        title: "🚧 Bu özellik henüz uygulanmadı",
        description: "Endişelenmeyin! Bir sonraki isteminizde talep edebilirsiniz! 🚀",
    });
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-theme-text">Görev Yönetimi</h1>
          <p className="text-muted-foreground mt-1">Klinik içi görevleri takip edin ve atayın.</p>
        </div>
        <Button className="gradient-primary text-primary-foreground gap-2" onClick={handleAction}>
          <Plus className="w-4 h-4" />
          Yeni Görev Ata
        </Button>
      </motion.div>
      
      <Card className="glass-effect p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input placeholder="Görev veya atanan kişi ara..." className="pl-10" />
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTasks.map((task, index) => {
          const pConfig = priorityConfig[task.priority];
          const sConfg = statusConfig[task.status];
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`glass-effect border-l-4 ${pConfig.color}`}>
                <CardContent className="p-5 space-y-3">
                  <p className="font-semibold text-theme-text">{task.description}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Atanan: <span className="font-medium text-theme-text">{task.assignedTo}</span></span>
                    <Badge variant="outline" className={`border-none ${sConfg.color === 'text-green-600' ? 'bg-green-100' : 'bg-background'}`}>
                      {task.status === 'completed' ? <Check className="w-4 h-4 mr-1"/> : <AlertCircle className="w-4 h-4 mr-1"/>}
                      {sConfg.label}
                    </Badge>
                  </div>
                  <Button variant="secondary" size="sm" className="w-full mt-2" onClick={handleAction}>
                    {task.status === 'completed' ? 'Arşivle' : 'Tamamlandı Olarak İşaretle'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  );
};

export default Tasks;