import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Day = ({ date, isSelected, isToday, onClick }) => (
  <motion.div
    onClick={() => onClick(date)}
    className={cn(
      "flex flex-col items-center justify-center h-24 w-full rounded-lg cursor-pointer transition-all duration-200 ease-in-out",
      isSelected ? "bg-primary text-primary-foreground shadow-lg" : "bg-card hover:bg-accent",
      isToday && !isSelected && "border-2 border-primary"
    )}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <p className={cn("text-sm", isSelected ? "opacity-75" : "text-muted-foreground")}>
      {date.toLocaleDateString('tr-TR', { weekday: 'short' })}
    </p>
    <p className="text-2xl font-bold mt-1">
      {date.getDate()}
    </p>
  </motion.div>
);

const WeeklyCalendar = ({ selectedDate, setSelectedDate }) => {
  const week = useMemo(() => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + (startOfWeek.getDay() === 0 ? -6 : 1)); // Monday as start of week

    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      return date;
    });
  }, [selectedDate]);

  const goToPreviousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-semibold text-center">
          {week[0].toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
        </h2>
        <Button variant="outline" size="icon" onClick={goToNextWeek}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {week.map(date => (
          <Day
            key={date.toString()}
            date={date}
            isSelected={date.toDateString() === selectedDate.toDateString()}
            isToday={date.toDateString() === new Date().toDateString()}
            onClick={setSelectedDate}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default WeeklyCalendar;
