import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, ChevronsUpDown, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { animalData, speciesList } from '@/lib/animalData';
import { locationOptions } from '@/lib/locationData.js';
import { getCustomers, getAnimalById, saveAnimal } from '@/lib/storage';
import { toast } from '@/components/ui/use-toast';

const Combobox = ({ options, value, onChange, placeholder, disabled = false }) => {
  const [open, setOpen] = useState(false);
  const displayValue = value ? options.find((option) => option.toLowerCase() === value.toLowerCase()) : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className="truncate">{displayValue || placeholder}</span>
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
                  key={option}
                  value={option}
                  onSelect={(currentValue) => {
                    onChange(currentValue.toLowerCase() === value?.toLowerCase() ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn('mr-2 h-4 w-4', value && value.toLowerCase() === option.toLowerCase() ? 'opacity-100' : 'opacity-0')}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const AddAnimalPage = ({ animalId, customerId: preselectedCustomerId, onBack, onSaveSuccess, onViewChange }) => {
  const [formData, setFormData] = useState({
    name: '', ear_tag_number: '', species: '', breed: '', gender: 'Dişi', dob: '', status: 'Sağlıklı', location: '', customer_id: null, microchip_id: '', current_weight: ''
  });
  const [breedOptions, setBreedOptions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const isEditMode = !!animalId;
  const isOwnerLocked = !!preselectedCustomerId;

  const formatDateForInput = (date) => {
    if (!date) return '';
    try {
      return new Date(date).toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  const updateBreedOptions = (speciesValue) => {
    if (speciesValue) {
        for (const category in animalData) {
            const speciesKey = Object.keys(animalData[category]).find(key => key.toLowerCase() === speciesValue.toLowerCase());
            if (speciesKey) {
                setBreedOptions(animalData[category][speciesKey]);
                return;
            }
        }
    }
    setBreedOptions([]);
  };

  const handleSpeciesChange = (value) => {
    setFormData(prev => ({ ...prev, species: value, breed: '' }));
    updateBreedOptions(value);
  };
  
  const loadInitialData = useCallback(async () => {
      setLoading(true);
      try {
        const customersData = await getCustomers();
        setCustomers(customersData);

        if (isEditMode) {
          const animal = await getAnimalById(animalId);
          if (animal) {
            const initialData = { ...animal, dob: formatDateForInput(animal.dob), customer_id: animal.customer_id || null };
            setFormData(initialData);
            updateBreedOptions(initialData.species);
          }
        } else {
          setFormData(prev => ({ ...prev, customer_id: preselectedCustomerId || null }));
        }
      } catch (error) {
        toast({ title: 'Hata', description: 'Veriler yüklenirken bir sorun oluştu.', variant: 'destructive' });
        if (onBack) onBack();
      } finally {
        setLoading(false);
      }
    }, [animalId, isEditMode, preselectedCustomerId, onBack]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.species) {
        toast({ title: "Zorunlu Alanlar Eksik", description: "Lütfen İsim ve Tür alanlarını doldurun.", variant: "destructive" });
        return;
    }
    setIsSaving(true);
    try {
        await saveAnimal(formData);
        toast({ title: "Başarılı!", description: `Hayvan bilgileri ${isEditMode ? 'güncellendi' : 'kaydedildi'}.` });
        if (onSaveSuccess) onSaveSuccess();
    } catch (error) {
        toast({
          title: "Hata!",
          description: error.message || `Hayvan ${isEditMode ? 'güncellenemedi' : 'kaydedilemedi'}.`,
          variant: "destructive"
        });
    } finally {
        setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  if(loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-12 h-12 text-theme-primary animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-theme-text">{isEditMode ? 'Hayvan Bilgilerini Düzenle' : 'Yeni Hayvan Ekle'}</h1>
          <p className="text-muted-foreground mt-1">{isEditMode ? 'Hayvanın bilgilerini güncelleyin.' : 'Sisteme yeni bir hayvan kaydı ekleyin.'}</p>
        </div>
      </div>

      <Card className="glass-effect">
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <div><Label>İsim *</Label><Input required value={formData.name || ''} onChange={e => handleInputChange('name', e.target.value)} /></div>
            <div><Label>Küpe Numarası</Label><Input value={formData.ear_tag_number || ''} onChange={e => handleInputChange('ear_tag_number', e.target.value)} /></div>
            
            <div>
              <Label>Tür *</Label>
              <Combobox options={speciesList} value={formData.species} onChange={handleSpeciesChange} placeholder="Tür seçin..." />
            </div>

            <div>
              <Label>Irk</Label>
              <Combobox options={breedOptions} value={formData.breed} onChange={(v) => handleInputChange('breed', v)} placeholder="Irk seçin..." disabled={breedOptions.length === 0} />
            </div>

            <div><Label>Cinsiyet *</Label><Select required value={formData.gender || 'Dişi'} onValueChange={v => handleInputChange('gender', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Dişi">Dişi</SelectItem><SelectItem value="Erkek">Erkek</SelectItem></SelectContent></Select></div>
            <div><Label>Doğum Tarihi</Label><Input type="date" value={formData.dob || ''} onChange={e => handleInputChange('dob', e.target.value)} /></div>
            <div><Label>Sağlık Durumu *</Label><Select required value={formData.status || 'Sağlıklı'} onValueChange={v => handleInputChange('status', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Sağlıklı">Sağlıklı</SelectItem><SelectItem value="Tedavide">Tedavide</SelectItem><SelectItem value="Kritik">Kritik</SelectItem></SelectContent></Select></div>
            <div>
                <Label>Lokasyon</Label>
                <Combobox options={locationOptions} value={formData.location} onChange={(v) => handleInputChange('location', v)} placeholder="İl / İlçe seçin..." />
            </div>
            <div className="md:col-span-2">
                <Label>Sahibi</Label>
                <div className="flex gap-2">
                    <Select value={formData.customer_id || ''} onValueChange={v => handleInputChange('customer_id', v || null)} disabled={isOwnerLocked}>
                        <SelectTrigger><SelectValue placeholder="Sahip seçin (Belirtilmemiş)"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={null}>Belirtilmemiş</SelectItem>
                            {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="icon" onClick={() => onViewChange('add-customer', { backTo: 'add-animal' })} disabled={isOwnerLocked}>
                        <Plus className="w-4 h-4"/>
                    </Button>
                </div>
            </div>
            <div><Label>Mikroçip ID</Label><Input value={formData.microchip_id || ''} onChange={e => handleInputChange('microchip_id', e.target.value)} /></div>
            <div><Label>Güncel Ağırlık (kg)</Label><Input type="number" step="0.1" value={formData.current_weight || ''} onChange={e => handleInputChange('current_weight', e.target.value)} /></div>
            
            <div className="md:col-span-2 flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={onBack} disabled={isSaving}>İptal</Button>
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

export default AddAnimalPage;