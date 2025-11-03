import React, { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthForm = ({ isLogin, onSwitch }) => {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        if (isLogin) {
            await signIn(email, password);
        } else {
            if (!fullName || !clinicName) {
                toast({
                    variant: 'destructive',
                    title: 'Kayıt Başarısız',
                    description: 'Lütfen tüm alanları doldurun.',
                });
                setLoading(false);
                return;
            }

            // We pass clinic_name and full_name in the `data` part of the `options`
            // The handle_new_user trigger in Supabase will use this.
            const { data, error } = await signUp(email, password, {
                data: {
                    full_name: fullName,
                    clinic_name: clinicName,
                    role: 'admin',
                },
            });
            
            if (error) throw error;
            
            if (data.user) {
              toast({
                  title: 'Kayıt Başarılı!',
                  description: 'Hesabınızı doğrulamak için lütfen e-postanızı kontrol edin.',
                  duration: 7000,
              });
              onSwitch(); // Switch to login view after successful signup
            }
        }
    } catch (error) {
        toast({
            variant: 'destructive',
            title: isLogin ? 'Giriş Başarısız' : 'Klinik Oluşturulamadı',
            description: error.message,
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md glass-effect">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-theme-text">{isLogin ? 'Giriş Yap' : 'Yeni Klinik Oluştur'}</CardTitle>
        <CardDescription>{isLogin ? 'VetDash panelinize erişin.' : 'Kliniğinizi dakikalar içinde dijitale taşıyın.'}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <Label htmlFor="clinicName">Klinik Adı</Label>
                <Input id="clinicName" value={clinicName} onChange={(e) => setClinicName(e.target.value)} required />
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <Label htmlFor="fullName">Adınız Soyadınız (Yönetici)</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </motion.div>
            </>
          )}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: isLogin ? 0.1 : 0.4 }}>
            <Label htmlFor="email">E-posta Adresiniz</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: isLogin ? 0.2 : 0.5 }}>
            <Label htmlFor="password">Şifre</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: isLogin ? 0.3 : 0.6 }}>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? (isLogin ? 'Giriş Yapılıyor...' : 'Oluşturuluyor...') : (isLogin ? 'Giriş Yap' : 'Hesap Oluştur')}
            </Button>
          </motion.div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AuthForm;