import React, { useState, useEffect, useRef } from 'react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';
import { ChevronRight, Calendar, MessageSquare, DollarSign } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sparkline } from '@/components/ui/sparkline';
import { cn } from '@/lib/utils';

const AnimatedBalance = ({ value }) => {
  const ref = useRef(null);
  const spring = useSpring(0, { damping: 20, stiffness: 100 });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
       if (ref.current) {
         ref.current.textContent = `${latest.toFixed(2)} ₺`;
       }
    });
    return unsubscribe;
  }, [spring]);

  return <span ref={ref} />;
}

const CustomerCard = ({ customer, compact = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardVariants = {
    initial: { y: 0, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' },
    hover: {
      y: -4,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    },
  };

  const balanceColor = customer.balance > 0 ? 'text-foreground' : customer.balance < 0 ? 'text-danger' : 'text-gray-500';
  const sparklineData = customer.spendingHistory.map(value => ({ value }));

  if (compact) {
    return (
      <motion.div
        className="flex items-center justify-between p-3 bg-white rounded-lg shadow-soft"
        variants={cardVariants}
        initial="initial"
        whileHover="hover"
        transition={{ duration: 0.18 }}
      >
        <div className="flex items-center gap-3">
          <Avatar>{customer.avatar}</Avatar>
          <p className="font-semibold">{customer.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <p className={cn('font-bold', balanceColor)}>
             <AnimatedBalance value={customer.balance} />
          </p>
          <ChevronRight className="text-gray-400" size={20} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative p-4 bg-white rounded-lg shadow-soft overflow-hidden"
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      transition={{ duration: 0.18, ease: 'easeOut' }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar>{customer.avatar}</Avatar>
          <div>
            <p className="font-bold text-lg text-foreground">{customer.name}</p>
            <p className="text-sm text-gray-500">{customer.email}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn('text-lg font-bold', balanceColor)}>
            <AnimatedBalance value={customer.balance} />
          </p>
          <Sparkline data={sparklineData} lineColor={customer.balance < 0 ? '#FF6B6B' : '#00B894'} />
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="subtle">🐾 {customer.animalCount} Hayvan</Badge>
          <Badge variant="subtle">🗓️ Son Randevu: {customer.lastAppointment}</Badge>
          {customer.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
        </div>
        <ChevronRight className="text-gray-400" size={24} />
      </div>

      <motion.div
        className="absolute top-0 right-0 h-full flex items-center bg-gradient-to-l from-white via-white to-transparent pr-4"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 20 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <div className="flex flex-col gap-2">
          <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200" aria-label="Randevu Ekle"><Calendar size={18} /></button>
          <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200" aria-label="Mesaj Gönder"><MessageSquare size={18} /></button>
          <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200" aria-label="Tahsilat Al"><DollarSign size={18} /></button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export { CustomerCard };
