import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Beef, CalendarCheck, Package, FileText, Users, Menu, X, LogOut, HeartHandshake, User, Settings, Fingerprint, DollarSign, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, generateAvatar } from '@/lib/utils';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { signOut, userProfile } = useAuth();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'appointments', path: '/appointments', label: 'Randevular', icon: CalendarCheck },
    { id: 'customers', path: '/customers', label: 'Müşteri Yönetimi', icon: HeartHandshake },
    { id: 'animals', path: '/animals', label: 'Hayvanlar', icon: Beef },
    { id: 'inventory', path: '/inventory', label: 'Envanter', icon: Package },
    { id: 'payments', path: '/payments', label: 'Ödemeler', icon: DollarSign },
    { id: 'expenses', path: '/expenses', label: 'Harcamalar', icon: DollarSign, className: "stroke-destructive" },
    { id: 'reports', path: '/reports', label: 'Raporlar', icon: FileText },
    { id: 'definitions', path: '/definitions', label: 'Tanımlamalar', icon: BookOpen },
    { id: 'users', path: '/users', label: 'Kullanıcılar', icon: Users }
  ];

  const NavLink = ({ item }) => {
    const Icon = item.icon;
    const isActive = location.pathname.startsWith(item.path);
    return (
      <Link to={item.path} onClick={() => {
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
      }}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-sm font-medium",
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
            "justify-center lg:justify-start"
          )}
          title={item.label}
        >
          <Icon className={cn("w-5 h-5 flex-shrink-0", item.className)} />
          <span className="hidden lg:inline">{item.label}</span>
        </motion.div>
      </Link>
    );
  };

  const currentUser = {
    name: userProfile?.full_name || 'Kullanıcı',
    role: userProfile?.role || 'rol belirtilmemiş',
    clinicId: userProfile?.clinic_id || 'N/A'
  };

  const getInitials = (name) => {
    if (!name || name === 'Kullanıcı') return <User className="w-5 h-5"/>;
    const names = name.split(' ').filter(Boolean);
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-card/80 backdrop-blur-xl border-r">
      <div className="p-4 border-b flex items-center justify-center lg:justify-start gap-3 h-[73px]">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="relative w-9 h-9 flex-shrink-0">
            <div className="w-full h-full rounded-lg bg-primary flex items-center justify-center">
              <Beef className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
          <div className="hidden lg:block">
              <h2 className="font-bold text-lg text-foreground">VetDash</h2>
              <p className="text-xs text-muted-foreground">Klinik Takip Sistemi</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink key={item.id} item={item} />
        ))}
      </nav>

      <div className="p-4 border-t space-y-2">
         <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground hidden lg:flex items-center gap-2">
            <Fingerprint className="w-4 h-4"/>
            <span className="font-mono">{currentUser.clinicId}</span>
         </div>
        <Link to="/settings" className={cn(
            "w-full p-2 rounded-lg transition-colors block",
            location.pathname === '/settings' ? 'bg-accent' : 'hover:bg-accent'
         )}>
          <div className="flex items-center gap-3">
             <div 
                className="w-10 h-10 rounded-full gradient-avatar flex-shrink-0 text-sm"
                style={generateAvatar(currentUser.name)}
              >
              {getInitials(currentUser.name)}
            </div>
            <div className="flex-1 min-w-0 hidden lg:block text-left">
              <p className="font-semibold text-sm text-foreground truncate">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground capitalize truncate">{currentUser.role}</p>
            </div>
            <Settings className="w-5 h-5 text-muted-foreground hidden lg:block" />
          </div>
        </Link>
         <button onClick={signOut} className="w-full flex items-center justify-center lg:justify-start gap-4 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="hidden lg:inline text-sm font-medium">Güvenli Çıkış</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Button variant="ghost" size="icon" className="fixed top-5 left-5 z-50 lg:hidden bg-card/80 backdrop-blur-xl" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
      </Button>
      
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed left-0 top-0 h-full w-64 z-40 lg:hidden">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside className="fixed left-0 top-0 h-full w-[72px] lg:w-64 z-20 hidden lg:flex flex-col">
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;