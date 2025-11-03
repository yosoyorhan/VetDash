import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent } from '@/components/ui/card';
    import { toast } from '@/components/ui/use-toast';
    import { Loader2 } from 'lucide-react';
    import { supabase } from '@/lib/customSupabaseClient';

    const SettingsPage = () => {
      const { user, userProfile, loading: authLoading } = useAuth();
      const [formData, setFormData] = useState({
        full_name: '',
        email: '',
      });
      const [isSaving, setIsSaving] = useState(false);

      useEffect(() => {
        if (userProfile) {
          const [firstName, ...lastName] = userProfile.full_name?.split(' ') || ['', ''];
          setFormData({
            firstName: firstName || '',
            lastName: lastName.join(' ') || '',
            email: user.email || '',
            fullName: userProfile.full_name || '',
            role: userProfile.role || 'Kullanıcı'
          });
        }
      }, [userProfile, user]);

      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
      };

      const handleSaveChanges = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const newFullName = `${formData.firstName} ${formData.lastName}`.trim();

        try {
          const { error } = await supabase
            .from('profiles')
            .update({ full_name: newFullName })
            .eq('id', user.id);

          if (error) throw error;
          
          // E-posta güncelleme (Supabase Auth tarafında)
          if(formData.email !== user.email){
             const { error: emailError } = await supabase.auth.updateUser({ email: formData.email });
             if (emailError) throw emailError;
             toast({ title: 'E-posta Güncelleme', description: 'E-posta adresinizi doğrulamak için lütfen gelen kutunuzu kontrol edin.' });
          }

          toast({ title: 'Başarılı!', description: 'Bilgileriniz başarıyla güncellendi.' });
          
          // Refresh auth session to get new user data if needed, or update context state
          // For simplicity, we can rely on the user to see changes on next login or refresh context.

        } catch (error) {
          toast({
            title: 'Hata!',
            description: error.message || 'Bilgiler güncellenirken bir hata oluştu.',
            variant: 'destructive',
          });
        } finally {
          setIsSaving(false);
        }
      };

      if (authLoading) {
        return (
          <div className="flex items-center justify-center h-full">
            <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
              <div className="w-full h-full shimmer-bar"></div>
            </div>
          </div>
        );
      }
      
      const initials = formData.fullName?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '..';

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center min-h-[calc(100vh-10rem)]"
        >
          <Card className="w-full max-w-3xl shadow-xl p-4 sm:p-8 relative overflow-hidden">
            <div className="absolute top-8 right-8 text-center flex flex-col items-center gap-2">
               <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 blur-md opacity-70"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                        {initials}
                    </div>
                </div>
              <p className="font-semibold text-foreground">{formData.fullName}</p>
              <p className="text-sm text-muted-foreground capitalize">{formData.role}</p>
            </div>

            <CardContent className="pt-6">
              <h1 className="text-3xl font-bold mb-4">Kişisel Ayarlar</h1>
              <p className="text-muted-foreground mb-8">Temel bilgilerinizi buradan güncelleyebilirsiniz.</p>
              
              <form onSubmit={handleSaveChanges} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="temel-bilgiler">Temel Bilgiler</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Input id="firstName" name="firstName" placeholder="Ad *" value={formData.firstName || ''} onChange={handleInputChange} required />
                        </div>
                         <div>
                            <Input id="lastName" name="lastName" placeholder="Soyad *" value={formData.lastName || ''} onChange={handleInputChange} required />
                        </div>
                    </div>
                    <div className="pt-2">
                       <Input id="email" name="email" type="email" placeholder="E-posta *" value={formData.email || ''} onChange={handleInputChange} required />
                    </div>
                </div>

                <div className="flex justify-start pt-4">
                  <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default SettingsPage;