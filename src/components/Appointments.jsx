import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Search, CheckCircle, Clock, XCircle, MoreVertical, Edit, Trash2, User, Copy, Car, Hotel as Hospital, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { getAppointments, updateAppointmentStatus } from '@/lib/storage';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const statusConfig = {
  'Onaylandı': { icon: CheckCircle, color: 'bg-green-100 text-green-700', label: 'Onaylandı' },
  'Bekliyor': { icon: Clock, color: 'bg-yellow-100 text-yellow-700', label: 'Bekliyor' },
  'İptal Edildi': { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'İptal Edildi' },
  'Tamamlandı': { icon: CheckCircle, color: 'bg-blue-100 text-blue-700', label: 'Tamamlandı' },
};

const CalendarDay = ({ date, isSelected, onClick }) => {
  const dayName = date.toLocaleDateString('tr-TR', { weekday: 'short' });
  const dayNumber = date.getDate();

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center w-14 h-20 rounded-xl transition-all duration-200",
        isSelected
          ? "bg-primary text-primary-foreground shadow-lg"
          : "bg-card hover:bg-accent"
      )}
    >
      <span className={cn("text-xs uppercase", isSelected ? 'opacity-80' : 'text-muted-foreground')}>{dayName}</span>
      <span className="text-xl font-bold mt-1">{dayNumber}</span>
    </button>
  );
};


const Appointments = ({ onViewChange }) => {
  const [selectedDate, setSelectedDate] = useState(new Date("2025-10-23"));
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadAppointments = useCallback(async (date) => {
    setLoading(true);
    try {
      const data = await getAppointments(date);
      setAppointments(data);
    } catch (error) {
      toast({ title: "Randevular Yüklenemedi", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments(selectedDate);
  }, [selectedDate, loadAppointments]);

  const filteredAppointments = useMemo(() => {
    return appointments
      .filter(apt => {
        const term = searchTerm.toLowerCase();
        return (
          apt.customer?.full_name?.toLowerCase().includes(term) ||
          apt.animal?.name?.toLowerCase().includes(term)
        );
      })
      .filter(apt => statusFilter === 'all' || apt.status === statusFilter);
  }, [appointments, searchTerm, statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
        await updateAppointmentStatus(id, newStatus);
        toast({ title: "Durum Güncellendi", description: `Randevu durumu "${newStatus}" olarak değiştirildi.` });
        loadAppointments(selectedDate);
    } catch (error) {
        toast({ title: "Hata", description: "Durum güncellenemedi.", variant: "destructive" });
    }
  };

  const handleAction = (action, payload) => {
      onViewChange(action, payload);
  };
  
  const calendarDates = useMemo(() => {
      const dates = [];
      for (let i = -3; i <= 3; i++) {
          const date = new Date(selectedDate);
          date.setDate(date.getDate() + i);
          dates.push(date);
      }
      return dates;
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Randevu Yönetimi</h1>
          <p className="text-muted-foreground mt-1">Günün randevu akışını buradan yönetin.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2" onClick={() => handleAction('add-appointment')}>
          <Plus className="w-4 h-4" />
          Yeni Randevu
        </Button>
      </motion.div>

      {/* Calendar Strip */}
      <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
              {calendarDates.map((date, i) => (
                  <CalendarDay 
                    key={i} 
                    date={date} 
                    isSelected={date.toDateString() === selectedDate.toDateString()}
                    onClick={() => setSelectedDate(date)}
                  />
              ))}
          </div>
          <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon"><Calendar className="w-5 h-5"/></Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <div className="p-4 text-center">Tarih: {selectedDate.toLocaleDateString('tr-TR')}</div>
              </PopoverContent>
          </Popover>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="Müşteri veya hayvan adıyla ara..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <Popover>
              <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                      <Filter className="w-4 h-4" />
                      Filtrele
                  </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2">
                  <div className="grid gap-1">
                  {['all', 'Bekliyor', 'Onaylandı', 'İptal Edildi', 'Tamamlandı'].map(status => (
                      <Button key={status} variant={statusFilter === status ? "default" : "ghost"} size="sm" className="justify-start" onClick={() => setStatusFilter(status)}>
                          {status === 'all' ? 'Tüm Durumlar' : status}
                      </Button>
                  ))}
                  </div>
              </PopoverContent>
          </Popover>
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary"/></div>
      ) : (
        <AnimatePresence>
          {filteredAppointments.length > 0 ? (
            <div className="space-y-3">
              {filteredAppointments.map((apt, index) => {
                const config = statusConfig[apt.status] || statusConfig['Bekliyor'];
                const StatusIcon = config.icon;
                const AppointmentTypeIcon = apt.appointment_type === 'Klinik' ? Hospital : Car;
                return (
                  <motion.div key={apt.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} layout>
                    <Card>
                      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="text-xl font-bold text-primary bg-primary/10 p-3 rounded-lg">
                            {new Date(apt.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{apt.customer?.full_name || 'İsimsiz Müşteri'}</p>
                            <p className="text-sm text-muted-foreground">{apt.animal?.name || 'İsimsiz Hayvan'} ({apt.animal?.species || 'Belirtilmemiş'})</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <AppointmentTypeIcon className="w-3.5 h-3.5"/>
                                <span>{apt.appointment_type}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                           <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Badge variant="outline" className={`${config.color} border-none font-medium cursor-pointer`}>
                                        <StatusIcon className="w-4 h-4 mr-2" />
                                        {config.label}
                                    </Badge>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {Object.keys(statusConfig).map(status => (
                                        <DropdownMenuItem key={status} onClick={() => handleStatusChange(apt.id, status)}>
                                            {statusConfig[status].label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                           </DropdownMenu>
                           <Button variant="outline" size="sm" onClick={() => toast({title: "Yakında!"})}>Detaylar</Button>
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleAction('edit-appointment', apt)}>
                                  <Edit className="mr-2 h-4 w-4" /> Düzenle
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAction('customer-profile', apt.customer_id)}>
                                  <User className="mr-2 h-4 w-4" /> Müşteri Profili
                                </DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => toast({title: "Yakında!"})}>
                                  <Copy className="mr-2 h-4 w-4" /> Kopyala
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={() => toast({title: "Yakında!"})}>
                                  <Trash2 className="mr-2 h-4 w-4" /> Sil
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
             <div className="text-center py-16">
                <p className="text-xl font-semibold">Randevu Bulunamadı</p>
                <p className="text-muted-foreground mt-2">Bu tarih için kayıtlı bir randevu yok.</p>
             </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default Appointments;