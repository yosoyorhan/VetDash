import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getHealthRecordById, saveHealthRecord, getVeterinarians } from '@/lib/storage';
import { toast } from '@/components/ui/use-toast';

const Combobox = ({ options, value, onChange, placeholder, disabled = false, className }) => {
  const [open, setOpen] = useState(false);
  const displayValue = options.find((option) => option.value === value)?.label || placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          <span className="truncate">{displayValue}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0 z-[100]">
        <Command>
          <CommandInput placeholder="Ara..." />
          <CommandList>
            <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onChange(option.value === value ? '' : option.value);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn('mr-2 h-4 w-4', value === option.value ? 'opacity-100' : 'opacity-0')}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const HealthRecordPage = () => {
  const { animalId, recordType, recordId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    animal_id: animalId,
    event_type: recordType,
    event_date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    treatment: '',
    notes: '',
    administered_by: '',
    batch_no: '',
    dose: '',
    insemination_type: '',
    next_check_date: ''
  });
  const [veterinarians, setVeterinarians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const isEditMode = !!recordId;

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const vets = await getVeterinarians();
        setVeterinarians(vets.map(v => ({ value: v.id, label: v.full_name })));

        if (isEditMode) {
          const record = await getHealthRecordById(recordId);
          if (record) {
            setFormData(prev => ({
              ...prev,
              ...record,
              event_date: record.event_date ? new Date(record.event_date).toISOString().split('T')[0] : '',
              next_check_date: record.next_check_date ? new Date(record.next_check_date).toISOString().split('T')[0] : ''
            }));
          }
        } else if (recordType === 'insemination') {
            const today = new Date();
            const nextCheck = new Date(today.setMonth(today.getMonth() + 1));
            setFormData(prev => ({...prev, next_check_date: nextCheck.toISOString().split('T')[0]}));
        }
      } catch (error) {
        toast({ title: 'Hata', description: 'Veriler yüklenirken bir sorun oluştu.', variant: 'destructive' });
        navigate(`/animal/${animalId}`);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [recordId, isEditMode, navigate, recordType, animalId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
        const dataToSave = { ...formData };
        if (recordType !== 'insemination') {
            delete dataToSave.insemination_type;
            delete dataToSave.next_check_date;
        }
        if (!dataToSave.administered_by) dataToSave.administered_by = null;

        await saveHealthRecord(dataToSave);
        toast({ title: "Başarılı!", description: `Kayıt başarıyla ${isEditMode ? 'güncellendi' : 'eklendi'}.` });
        navigate(`/animal/${animalId}`);
    } catch (error) {
        toast({
          title: "Hata!",
          description: error.message || `Kayıt ${isEditMode ? 'güncellenemedi' : 'eklenemedi'}.`,
          variant: "destructive"
        });
    } finally {
        setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getTitle = () => {
    switch (recordType) {
      case 'treatment': return isEditMode ? 'Tedavi Kaydını Düzenle' : 'Yeni Tedavi Kaydı';
      case 'vaccination': return isEditMode ? 'Aşı Kaydını Düzenle' : 'Yeni Aşı Kaydı';
      case 'insemination': return isEditMode ? 'Tohumlama Kaydını Düzenle' : 'Yeni Tohumlama Kaydı';
      default: return 'Sağlık Kaydı';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-12 h-12 text-theme-primary animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(`/animal/${animalId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-theme-text">{getTitle()}</h1>
          <p className="text-muted-foreground mt-1">Hayvanın sağlık bilgilerini {isEditMode ? 'güncelleyin' : 'ekleyin'}.</p>
        </div>
      </div>

      <Card className="glass-effect">
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <div><Label>Olay Tarihi *</Label><Input type="date" required value={formData.event_date || ''} onChange={e => handleInputChange('event_date', e.target.value)} /></div>

            {recordType === 'treatment' && (
              <>
                <div><Label>Teşhis</Label><Input value={formData.diagnosis || ''} onChange={e => handleInputChange('diagnosis', e.target.value)} /></div>
                <div><Label>Tedavi</Label><Input value={formData.treatment || ''} onChange={e => handleInputChange('treatment', e.target.value)} /></div>
              </>
            )}

            {recordType === 'vaccination' && (
              <>
                <div><Label>Aşı Adı *</Label><Input required value={formData.treatment || ''} onChange={e => handleInputChange('treatment', e.target.value)} /></div>
                <div><Label>Doz</Label><Input value={formData.dose || ''} onChange={e => handleInputChange('dose', e.target.value)} /></div>
                <div><Label>Parti No</Label><Input value={formData.batch_no || ''} onChange={e => handleInputChange('batch_no', e.target.value)} /></div>
              </>
            )}

            {recordType === 'insemination' && (
              <>
                <div><Label>Tohumlama Tipi</Label><Input value={formData.insemination_type || ''} onChange={e => handleInputChange('insemination_type', e.target.value)} /></div>
                <div><Label>Bir Sonraki Kontrol Tarihi</Label><Input type="date" value={formData.next_check_date || ''} onChange={e => handleInputChange('next_check_date', e.target.value)} /></div>
              </>
            )}

            <div className={cn("md:col-span-2", recordType === 'insemination' ? 'col-span-1' : '')}>
              <Label>Uygulayan Kişi</Label>
              <Combobox
                options={veterinarians}
                value={formData.administered_by}
                onChange={v => handleInputChange('administered_by', v)}
                placeholder="Veteriner seçin..."
              />
            </div>

            <div className="md:col-span-2"><Label>Notlar</Label><Input value={formData.notes || ''} onChange={e => handleInputChange('notes', e.target.value)} /></div>

            <div className="md:col-span-2 flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={() => navigate(`/animal/${animalId}`)} disabled={isSaving}>İptal</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HealthRecordPage;