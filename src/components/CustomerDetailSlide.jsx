import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, DollarSign, Calendar } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AISuggestions } from '@/components/AISuggestions';

const CustomerDetailSlide = ({ customer, onClose }) => {
  if (!customer) return null;

  const backdropVariants = {
    visible: { opacity: 0.5 },
    hidden: { opacity: 0 },
  };

  const slideVariants = {
    visible: { x: 0 },
    hidden: { x: '100%' },
  };

  const balanceColor = customer.balance > 0 ? 'text-green-600' : customer.balance < 0 ? 'text-danger' : 'text-gray-500';

  return (
    <AnimatePresence>
      {customer && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.24, ease: 'easeInOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-background shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar>{customer.avatar}</Avatar>
                  <div>
                    <h2 className="text-xl font-bold">{customer.name}</h2>
                    <p className="text-sm text-gray-500">{customer.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Paneli kapat">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" className="gap-2"><MessageSquare size={16}/> Mesaj Gönder</Button>
                <Button size="sm" className="gap-2"><DollarSign size={16}/> Tahsilat Al</Button>
                <Button size="sm" className="gap-2"><Calendar size={16}/> Randevu Planla</Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Genel Bilgiler */}
              <section>
                <h3 className="text-lg font-semibold mb-3">Genel Bilgiler</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-100 p-3 rounded-md">
                        <p className="text-gray-500">Bakiye</p>
                        <p className={`font-bold text-lg ${balanceColor}`}>{customer.balance.toFixed(2)} ₺</p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-md">
                        <p className="text-gray-500">Hayvan Sayısı</p>
                        <p className="font-bold text-lg">{customer.animalCount}</p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-md">
                        <p className="text-gray-500">Son Randevu</p>
                        <p className="font-bold">{customer.lastAppointment}</p>
                    </div>
                     <div className="bg-gray-100 p-3 rounded-md">
                        <p className="text-gray-500">Etiketler</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {customer.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                        </div>
                    </div>
                </div>
              </section>

              {/* Önerilen Aksiyonlar (AI Bölümü) */}
              <section>
                <h3 className="text-lg font-semibold mb-3">Önerilen Aksiyonlar</h3>
                <AISuggestions customer={customer} />
              </section>

              {/* TODO: Timeline */}
              <section>
                <h3 className="text-lg font-semibold mb-3">Müşteri Geçmişi</h3>
                <div className="border-l-2 border-gray-200 pl-4 space-y-6">
                    <p className="text-sm text-gray-500">Timeline/aktivite akışı buraya gelecek.</p>
                </div>
              </section>

              {/* TODO: Hayvanlar Bölümü */}
               <section>
                <h3 className="text-lg font-semibold mb-3">Hayvanlar</h3>
                 <div className="flex space-x-4 overflow-x-auto pb-2">
                    <p className="text-sm text-gray-500">Hayvan kartları slider'ı buraya gelecek.</p>
                </div>
              </section>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export { CustomerDetailSlide };
