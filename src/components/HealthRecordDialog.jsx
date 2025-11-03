import React, { useState, useEffect } from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
    
    const HealthRecordDialog = ({ open, onOpenChange, onSave, isSaving, record, clinicUsers = [] }) => {
      const [formData, setFormData] = useState({});
      
      const recordType = record?.event_type || 'treatment';

      const typeConfig = {
        treatment: { title: 'Tedavi', icon: 'Stethoscope' },
        vaccination: { title: 'Aşı', icon: 'Syringe' },
        insemination: { title: 'Tohumlama', icon: 'Beef' }
      };
      
      const config = typeConfig[recordType];
      
      // Helper to format date for input type=date
      const formatDateForInput = (date) => {
        if (!date) return '';
        try {
          return new Date(date).toISOString().split('T')[0];
        } catch (e) {
          return '';
        }
      };
      
      useEffect(() => {
        if (open && record) {
          setFormData({
            ...record,
            event_date: formatDateForInput(record.event_date || new Date())
          });
        } else {
            setFormData({});
        }
      }, [open, record]);

      const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
      };

      const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
      };
      
      const handleClose = () => {
        onOpenChange(false);
      }

      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="glass-effect max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-theme-text">{record?.id ? 'Kaydı Düzenle' : `Yeni ${config.title} Kaydı`}</DialogTitle>
              <DialogDescription>Hayvanın sağlık geçmişine yeni bir kayıt ekleyin veya güncelleyin.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              
              <div className="space-y-2">
                <Label htmlFor="event_date" className="flex items-center"><CalendarIcon className="w-4 h-4 mr-2" /> Olay Tarihi *</Label>
                <Input id="event_date" type="date" required value={formData.event_date || ''} onChange={e => handleInputChange('event_date', e.target.value)} />
              </div>

              {recordType === 'treatment' && <>
                <div className="space-y-2"><Label htmlFor="diagnosis">Teşhis *</Label><Input id="diagnosis" required value={formData.diagnosis || ''} onChange={e => handleInputChange('diagnosis', e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="treatment">Uygulanan Tedavi *</Label><Input id="treatment" required value={formData.treatment || ''} onChange={e => handleInputChange('treatment', e.target.value)} /></div>
              </>}
              {recordType === 'vaccination' && <>
                <div className="space-y-2"><Label htmlFor="treatment">Aşı Adı/Türü *</Label><Input id="treatment" required value={formData.treatment || ''} onChange={e => handleInputChange('treatment', e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="batch_no">Parti No</Label><Input id="batch_no" value={formData.batch_no || ''} onChange={e => handleInputChange('batch_no', e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="dose">Doz</Label><Input id="dose" value={formData.dose || ''} onChange={e => handleInputChange('dose', e.target.value)} /></div>
              </>}
              {recordType === 'insemination' && <>
                <div className="space-y-2"><Label htmlFor="insemination_type">Tohumlama Tipi *</Label><Select required value={formData.insemination_type || 'Suni'} onValueChange={v => handleInputChange('insemination_type', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Suni">Suni Tohumlama</SelectItem><SelectItem value="Doğal">Doğal Aşım</SelectItem><SelectItem value="Embriyo Transferi">Embriyo Transferi</SelectItem></SelectContent></Select></div>
              </>}

              <div className="space-y-2">
                <Label htmlFor="administered_by">Uygulayan Kişi</Label>
                <Select value={formData.administered_by || ''} onValueChange={v => handleInputChange('administered_by', v)}>
                  <SelectTrigger id="administered_by"><SelectValue placeholder="Kullanıcı seçin..."/></SelectTrigger>
                  <SelectContent>
                    {clinicUsers.map(user => (
                      <SelectItem key={user.id} value={user.name}>{user.name} ({user.role})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label htmlFor="notes">Notlar</Label><Input id="notes" value={formData.notes || ''} onChange={e => handleInputChange('notes', e.target.value)} /></div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={handleClose} disabled={isSaving}>İptal</Button>
                <Button type="submit" className="gradient-primary text-white" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      );
    };
    
    export default HealthRecordDialog;