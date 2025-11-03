import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Send, CreditCard, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AISuggestions = ({ customer }) => {
  const suggestions = [];

  // Öneri 1: Uzun süredir gelmeyen müşteri
  const lastAppointmentDate = new Date(customer.lastAppointment);
  const daysSinceLastVisit = (new Date() - lastAppointmentDate) / (1000 * 60 * 60 * 24);
  if (daysSinceLastVisit > 60) {
    suggestions.push({
      icon: <Send className="w-4 h-4 mr-2" />,
      text: `Bu müşteri ${Math.floor(daysSinceLastVisit)} gündür gelmedi. Bir hatırlatma SMS'i gönderebilirsiniz.`,
      action: () => console.log('ACTION: Send Reminder SMS'),
      buttonText: 'SMS Gönder',
    });
  }

  // Öneri 2: Negatif bakiye
  if (customer.balance < 0) {
    suggestions.push({
      icon: <CreditCard className="w-4 h-4 mr-2" />,
      text: `Müşterinin ${Math.abs(customer.balance).toFixed(2)} ₺ negatif bakiyesi bulunuyor.`,
      action: () => console.log('ACTION: Collect Payment'),
      buttonText: 'Tahsilat Linki Öner',
    });
  }

  // Öneri 3: Kontrol muayenesi zamanı
  if (daysSinceLastVisit > 180) {
     suggestions.push({
      icon: <CalendarPlus className="w-4 h-4 mr-2" />,
      text: `Son randevunun üzerinden 6 aydan fazla geçti. Bir kontrol muayenesi planlayabilirsiniz.`,
      action: () => console.log('ACTION: Schedule Check-up'),
      buttonText: 'Kontrol Planla',
    });
  }

  // Öneri 4: Pasif/Riskli Müşteri
  if (customer.tags.includes('Pasif') || customer.tags.includes('Riskli')) {
     suggestions.push({
      icon: <Lightbulb className="w-4 h-4 mr-2" />,
      text: `Bu müşteri "riskli" veya "pasif" olarak etiketlenmiş. Özel bir kampanya ile tekrar kazanmayı deneyebilirsiniz.`,
      action: () => console.log('ACTION: Send Special Offer'),
      buttonText: 'Kampanya Öner',
    });
  }

  if (suggestions.length === 0) {
    return (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg flex items-center">
            <Lightbulb className="w-5 h-5 mr-3 text-green-600"/>
            <p className="text-sm text-green-800">Bu müşteri için her şey yolunda görünüyor!</p>
        </div>
    );
  }

  return (
    <div className="space-y-3">
      {suggestions.map((suggestion, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5 text-amber-600">
                {suggestion.icon}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-amber-800">{suggestion.text}</p>
              <Button size="sm" variant="outline" className="mt-3 gap-2 border-amber-300 text-amber-800 hover:bg-amber-100" onClick={suggestion.action}>
                {suggestion.buttonText}
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export { AISuggestions };
