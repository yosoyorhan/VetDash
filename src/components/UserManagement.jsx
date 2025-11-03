import React, { useState, useEffect, useMemo, useCallback } from 'react';
    import { motion } from 'framer-motion';
    import { Plus, Search, User, Loader2 } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { Card } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { Badge } from '@/components/ui/badge';
    import { getUsers } from '@/lib/storage';
    import { toast } from '@/components/ui/use-toast';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

    const UserManagement = () => {
      const [users, setUsers] = useState([]);
      const [searchTerm, setSearchTerm] = useState('');
      const [loading, setLoading] = useState(true);
      const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);

      const loadData = useCallback(async () => {
        setLoading(true);
        try {
          const data = await getUsers();
          if (data) {
            setUsers(data);
          } else {
            throw new Error("Kullanıcı verisi alınamadı.");
          }
        } catch (error) {
          toast({
            title: "Hata!",
            description: error.message || "Kullanıcılar yüklenirken bir sorun oluştu.",
            variant: "destructive",
          });
          setUsers([]);
        } finally {
          setLoading(false);
        }
      }, []);

      useEffect(() => {
        loadData();
      }, [loadData]);

      const filteredUsers = useMemo(() => {
        if (!users) return [];
        return users.filter(user =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }, [users, searchTerm]);

      const getRoleBadgeColor = (role) => {
        switch (role) {
          case 'admin':
            return 'bg-red-100 text-red-700 border-red-300';
          case 'veteriner':
            return 'bg-emerald-100 text-emerald-700 border-emerald-300';
          case 'saha':
            return 'bg-blue-100 text-blue-700 border-blue-300';
          default:
            return 'bg-gray-100 text-gray-700 border-gray-300';
        }
      };

      return (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-emerald-900">Kullanıcı Yönetimi</h1>
              <p className="text-emerald-600 mt-1">{filteredUsers.length} kullanıcı bulundu.</p>
            </div>
            <Button
              className="gradient-primary text-white gap-2 shadow-lg"
              onClick={() => setIsAddUserDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Yeni Kullanıcı
            </Button>
          </motion.div>

          <Card className="glass-effect p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
              <Input
                placeholder="İsim ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>

          {loading ? (
            <div className="text-center py-16 flex justify-center items-center text-emerald-600">
                <Loader2 className="w-8 h-8 animate-spin mr-3"/> Kullanıcılar yükleniyor...
            </div>
          ) : (
            <>
              {filteredUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUsers.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="glass-effect p-5 hover:shadow-xl transition-all h-full">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full gradient-secondary flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-emerald-900 text-lg mb-1 truncate">
                              {user.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2 truncate">{user.email || 'E-posta yok'}</p>
                            <div className="flex items-center gap-2">
                              <Badge className={getRoleBadgeColor(user.role)}>
                                {user.role || 'rol yok'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                   <p className="text-xl font-semibold text-emerald-700">Kullanıcı Bulunamadı</p>
                  <p className="text-emerald-500 mt-2">Bu klinikte başka kullanıcı bulunmuyor veya arama kriteri eşleşmedi.</p>
                </div>
              )}
            </>
          )}
          
          <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
            <DialogContent className="glass-effect">
              <DialogHeader>
                <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
                <DialogDescription>
                    Bu özellik henüz tam olarak uygulanmadı.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 text-center">
                <p className="text-gray-600">
                  🚧 Kullanıcı ekleme özelliği şu anda geliştirme aşamasındadır.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Bu özelliği bir sonraki isteminizde talep edebilirsiniz! 🚀
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      );
    };

    export default UserManagement;