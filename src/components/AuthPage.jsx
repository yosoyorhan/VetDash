import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2, LogIn, UserPlus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Giriş Başarısız',
          description: "Lütfen e-posta ve şifrenizi kontrol edin.",
        });
      }
      // Successful login is handled by the onAuthStateChange listener
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
      const { error } = await signUp(email, password, {
        full_name: fullName,
        clinic_name: clinicName,
        role: 'Admin', // First user is always Admin
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Kayıt Başarısız',
          description: error.message || "Bir hata oluştu, lütfen tekrar deneyin.",
        });
      } else {
        toast({
          title: 'Kayıt Başarılı!',
          description: 'Hesabınızı doğrulamak için lütfen e-posta adresinize gönderilen linke tıklayın.',
          duration: 7000,
        });
        setIsLogin(true); // Switch to login view after successful sign up
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">{isLogin ? 'Tekrar Hoş Geldiniz!' : 'Hesap Oluşturun'}</CardTitle>
            <CardDescription>{isLogin ? 'Klinik bilgilerinize erişmek için giriş yapın.' : 'Yeni bir klinik hesabı oluşturun.'}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="clinicName">Klinik Adı</Label>
                    <Input id="clinicName" placeholder="Örn: Sevimli Patiler Veteriner Kliniği" value={clinicName} onChange={(e) => setClinicName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Adınız Soyadınız</Label>
                    <Input id="fullName" placeholder="Örn: Dr. Ahmet Yılmaz" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input id="email" type="email" placeholder="ornek@eposta.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isLogin ? <LogIn className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />)}
                {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              {isLogin ? "Hesabınız yok mu?" : "Zaten bir hesabınız var mı?"}
              <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="px-1">
                {isLogin ? 'Kayıt Olun' : 'Giriş Yapın'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AuthPage;