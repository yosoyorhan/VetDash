import React from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate'i import et
import { motion } from 'framer-motion';
import { ChevronRight, PlusCircle, FileText, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateAvatar } from '@/lib/utils';

const CustomerCard = ({ customer, index }) => { // onViewChange prop'unu kaldır
  const navigate = useNavigate(); // navigate fonksiyonunu başlat

  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ').filter(Boolean);
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleActionClick = (e, action) => {
    e.stopPropagation(); // Kartın tıklanmasını engelle
    // TODO: Bu eylemler için modal veya ilgili sayfalara yönlendirme ekle
    console.log(`${action} for customer ${customer.id}`);
    if (action === 'randevu') {
        // Örnek: navigate(`/add-appointment?customerId=${customer.id}`);
    }
  };

  const handleCardClick = () => {
    navigate(`/customer/${customer.id}`);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:shadow-lg cursor-pointer transition-shadow duration-200"
        onClick={handleCardClick} // Tıklama işleyicisini güncelle
      >
        {/* Left Side: Avatar and Info */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div
            className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-lg font-bold text-white"
            style={generateAvatar(customer.full_name)}
          >
            {getInitials(customer.full_name)}
          </div>
          <div className="flex-grow">
            <p className="font-bold text-lg text-foreground">{customer.full_name}</p>
            <p className="text-sm text-muted-foreground">{customer.phone || customer.email || 'İletişim bilgisi yok'}</p>
            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                <span><strong className="text-foreground">{customer.animals_count || 0}</strong> Hayvan</span>
                <span>Son İşlem: <strong className="text-foreground">YOK</strong></span>
            </div>
          </div>
        </div>

        {/* Right Side: Balance and Quick Actions */}
        <div className="flex items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto justify-between">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Müşteri Bakiyesi</p>
            <p className={`font-bold text-xl ${customer.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {customer.balance ? customer.balance.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) : 'Bakiye Yok'}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1">
             <Button variant="ghost" size="icon" onClick={(e) => handleActionClick(e, 'randevu')}>
                <PlusCircle className="w-5 h-5" />
             </Button>
             <Button variant="ghost" size="icon" onClick={(e) => handleActionClick(e, 'fatura')}>
                <FileText className="w-5 h-5" />
             </Button>
             <Button variant="ghost" size="icon" onClick={(e) => handleActionClick(e, 'mesaj')}>
                <MessageSquare className="w-5 h-5" />
             </Button>
          </div>
          <ChevronRight className="w-6 h-6 text-muted-foreground hidden sm:block"/>
        </div>
      </Card>
    </motion.div>
  );
};

export default CustomerCard;