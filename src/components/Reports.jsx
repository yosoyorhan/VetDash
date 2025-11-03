import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, Briefcase, Syringe, FileText, Bell, AreaChart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

const ReportsPage = () => {
    const reportGroups = [
        {
            title: "Gelir Gider İşlemleri",
            icon: DollarSign,
            reports: [
                { name: "Faturalar", available: true },
                { name: "Ödenmemiş Bakiye", available: false },
                { name: "Vadesi Geçmiş Faturalar", available: false },
                { name: "Ödemeler", available: true },
                { name: "Klinik Gelirleri", available: true },
                { name: "Harcamalar", available: true },
                { name: "Vadesi Geçmiş Harcamalar", available: false },
            ]
        },
        {
            title: "Diğer",
            icon: AreaChart,
            reports: [
                { name: "Bildirim Geçmişi", available: true },
                { name: "Bildirim Raporları", available: false },
                { name: "Gün Özeti", available: true },
            ]
        },
        {
            title: "Müşteriler",
            icon: Users,
            reports: [
                { name: "Müşteriler", available: false },
                { name: "Müşteri Gelirleri", available: false },
            ]
        },
        {
            title: "Hastalar",
            icon: Briefcase,
            reports: [
                { name: "Evcil Hayvanlar", available: false },
            ]
        },
        {
            title: "Aşılamalar",
            icon: Syringe,
            reports: [
                { name: "Geçmiş Aşılamalar", available: false },
                { name: "Medikal Kayıtlar", available: false },
            ]
        },
    ];

    const handleReportClick = (report) => {
        if (!report.available) {
            toast({ title: "Yakında!", description: `${report.name} raporu yakında kullanıma sunulacaktır.` });
        } else {
             toast({ title: "Rapor Oluşturuluyor...", description: `${report.name} raporu hazırlanıyor.` });
        }
    };

    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold">Raporlar</h1>
                <p className="text-muted-foreground mt-1">Klinik verilerinizi analiz edin ve dışa aktarın.</p>
            </motion.div>

            <div className="space-y-8">
                {reportGroups.map((group, groupIndex) => (
                    <motion.div key={group.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: groupIndex * 0.1 }}>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
                            <group.icon className="w-6 h-6 text-primary" />
                            {group.title}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {group.reports.map((report, reportIndex) => (
                                <Card 
                                    key={report.name} 
                                    className={`p-4 flex items-center justify-between transition-all duration-200 ${report.available ? 'cursor-pointer hover:bg-accent hover:shadow-md' : 'opacity-60 cursor-not-allowed'}`}
                                    onClick={() => handleReportClick(report)}
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-muted-foreground" />
                                        <span className="font-medium text-foreground">{report.name}</span>
                                    </div>
                                    {!report.available && <span className="text-xs font-semibold text-blue-500">Yakında</span>}
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ReportsPage;