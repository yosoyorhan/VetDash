import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { generateAvatar } from '@/lib/utils';

const CustomerCard = ({ customer, index }) => {
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ').filter(Boolean);
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
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
        className="p-4 flex items-center justify-between hover:shadow-lg cursor-pointer transition-shadow duration-200"
        onClick={handleCardClick}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-lg font-bold text-white"
            style={generateAvatar(customer.full_name)}
          >
            {getInitials(customer.full_name)}
          </div>
          <div>
            <p className="font-bold text-lg text-foreground">{customer.full_name}</p>
            <p className="text-sm text-muted-foreground">{customer.email || 'E-posta yok'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="text-xs text-muted-foreground">Güncel Bakiye</p>
                <p className={`font-bold text-xl ${customer.balance >= 0 ? 'text-foreground' : 'text-destructive'}`}>
                {customer.balance ? customer.balance.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) : '₺0,00'}
                </p>
            </div>
            <ChevronRight className="w-6 h-6 text-muted-foreground"/>
        </div>
      </Card>
    </motion.div>
  );
};

export default CustomerCard;
