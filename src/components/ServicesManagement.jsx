import React, { useState } from 'react';
    import { motion } from 'framer-motion';
    import { Wrench, Plus, Syringe, Microscope, Stethoscope, HeartPulse, Bone, Brain, Droplets, Scissors, Pill, Search } from 'lucide-react';
    import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { toast } from '@/components/ui/use-toast';
    import { Input } from '@/components/ui/input';

    const serviceCategories = {
      "Koruyucu Hekimlik": { icon: Syringe, color: "text-blue-500", services: ["Aşılama Takibi", "Parazit Kontrolü", "Genel Muayene (Check-up)", "Mikroçip Uygulaması", "Beslenme Danışmanlığı"] },
      "Teşhis ve Görüntüleme": { icon: Microscope, color: "text-purple-500", services: ["Laboratuvar Hizmetleri (Kan/İdrar)", "Dijital Röntgen (X-Ray)", "Ultrasonografi (USG)", "Hızlı Test Kitleri"] },
      "Tedavi ve Cerrahi": { icon: HeartPulse, color: "text-red-500", services: ["Dahiliye (İç Hastalıkları)", "Kısırlaştırma Operasyonu", "Yumuşak Doku Cerrahisi", "Acil ve Yoğun Bakım"] },
      "Uzmanlık ve Destek": { icon: Stethoscope, color: "text-green-500", services: ["Diş Hekimliği", "Doğum ve Jinekoloji", "Göz (Oftalmoloji)", "Dermatoloji (Deri)"] },
      "Ortopedi": { icon: Bone, color: "text-yellow-600", services: ["Kırık, Çıkık Tedavisi", "Çapraz Bağ Operasyonları"] },
      "Nöroloji": { icon: Brain, color: "text-indigo-500", services: ["Nörolojik Muayene", "Nöbet Yönetimi"] },
      "Sürü Yönetimi": { icon: Droplets, color: "text-teal-500", services: ["Suni Tohumlama", "Verimlilik Danışmanlığı"] },
      "Bakım ve Diğer": { icon: Scissors, color: "text-orange-500", services: ["Kuaför ve Bakım", "Pet Shop ve Mama Satışı"] },
    };

    const ServicesManagement = () => {
      const [searchTerm, setSearchTerm] = useState("");

      const handleNotImplemented = () => {
        toast({
          title: "🚧 Bu özellik henüz uygulanmadı",
          description: "Endişelenmeyin! Bir sonraki isteminizde talep edebilirsiniz! 🚀",
        });
      };

      const filteredCategories = Object.keys(serviceCategories)
        .filter(category =>
          category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          serviceCategories[category].services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .reduce((obj, key) => {
          obj[key] = serviceCategories[key];
          return obj;
        }, {});

      return (
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Wrench className="w-8 h-8 text-primary" />
                Hizmet Yönetimi
              </h1>
              <p className="text-muted-foreground mt-1">Klinikte sunulan hizmetleri ve ücretlerini buradan yönetebilirsiniz.</p>
            </div>
            <div className="w-full sm:w-auto flex gap-2">
               <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Hizmet veya kategori ara..."
                        className="pl-11 h-11"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
              <Button onClick={handleNotImplemented}>
                <Plus className="w-4 h-4 mr-2" />
                Yeni Hizmet Oluştur
              </Button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Object.entries(filteredCategories).map(([category, { icon: Icon, color, services }], index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-3 ${color}`}>
                      <Icon className="w-6 h-6" />
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2.5 text-sm">
                      {services
                        .filter(service => service.toLowerCase().includes(searchTerm.toLowerCase()) || category.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(service => (
                        <li key={service} className="flex items-center gap-2.5 text-foreground">
                          <Pill className="w-4 h-4 text-primary/50" />
                          <span>{service}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
             {Object.keys(filteredCategories).length === 0 && (
                <div className="col-span-full text-center py-20 text-muted-foreground">
                    <p className="text-lg font-semibold">Sonuç bulunamadı</p>
                    <p>"{searchTerm}" için bir hizmet veya kategori bulunamadı.</p>
                </div>
            )}
          </div>
        </div>
      );
    };

    export default ServicesManagement;