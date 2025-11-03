import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { 
  DollarSign, Activity, Calendar, Users, ArrowUp, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboardKPIs, getWeeklyRevenue } from '@/lib/storage';
import { toast } from '@/components/ui/use-toast';

const Dashboard = () => {
  const [kpis, setKpis] = useState({ totalAnimals: 0, totalCustomers: 0, recentTransactions: 0 });
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [kpiData, weeklyRevenue] = await Promise.all([
          getDashboardKPIs(),
          getWeeklyRevenue()
        ]);
        setKpis(kpiData);
        setRevenueData(weeklyRevenue);
      } catch (error) {
        toast({ title: "Dashboard verileri yüklenemedi", description: error.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const kpiCards = [
    { title: 'Toplam Hayvan', value: kpis.totalAnimals, icon: Activity, color: 'text-yellow-500' },
    { title: 'Aktif Müşteri', value: kpis.totalCustomers, icon: Users, color: 'text-primary' },
    { title: 'Son İşlemler (30 gün)', value: kpis.recentTransactions, icon: DollarSign, color: 'text-theme-success' },
    { title: 'Yaklaşan Randevular', value: '5', icon: Calendar, color: 'text-blue-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground">Akıllı Dashboard</h1>
        <p className="text-muted-foreground mt-1">Kliniğinizin anlık durumu ve performans metrikleri</p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-effect overflow-hidden">
                <div className="p-6 flex flex-row items-center justify-between space-y-0">
                    <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{kpi.title}</h3>
                    <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <div className="p-6 pt-0">
                    <div className="text-3xl font-bold text-foreground">{kpi.value}</div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center">
                        <ArrowUp className="h-3 w-3 mr-1 text-theme-success" />
                        +2.5% son haftadan
                    </p>
                </div>
                <div className="h-2 animated-gradient-bg" />
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-4">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Haftalık Gelir Analizi</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₺${value/1000}k`} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}/>
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-3">
            <Card className="glass-effect">
                <CardHeader>
                    <CardTitle>Randevu Durumları</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                         <BarChart data={[{ name: 'Bekliyor', count: 5 }, { name: 'Onaylandı', count: 12 }, { name: 'İptal', count: 2 }]} layout="vertical" margin={{ left: 10 }}>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={80}/>
                            <Tooltip cursor={{fill: 'hsl(var(--primary) / 0.1)'}} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} background={{ fill: 'hsl(var(--background))' }} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;