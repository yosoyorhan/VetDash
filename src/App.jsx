import React from 'react';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import AuthPage from '@/components/AuthPage';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import AnimalList from '@/components/AnimalList';
import AnimalProfile from '@/components/AnimalProfile';
import Reports from '@/components/Reports';
import UserManagement from '@/components/UserManagement';
import Appointments from '@/components/Appointments';
import Tasks from '@/components/Tasks';
import InventoryManagement from '@/components/InventoryManagement';
import CustomerManagement from '@/components/CustomerManagement';
import CustomerProfile from '@/components/CustomerProfile';
import AddAnimalPage from '@/components/AddAnimalPage';
import ServicesManagement from '@/components/ServicesManagement';
import SettingsPage from '@/components/SettingsPage';
import HealthRecordPage from '@/components/HealthRecordPage';
import AddAppointmentPage from '@/components/AddAppointmentPage';
import AppointmentDetailPage from '@/components/AppointmentDetailPage';
import PaymentsPage from '@/components/PaymentsPage';
import AddProductPage from '@/components/AddProductPage';
import ExpensesPage from '@/components/ExpensesPage';
import AddExpensePage from '@/components/AddExpensePage';
import DefinitionsPage from '@/components/DefinitionsPage';
import AddCustomerPage from '@/components/AddCustomerPage';
import AddCategoryPage from '@/components/AddCategoryPage';
import Footer from '@/components/Footer';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// ProtectedRoute bileşeni, giriş yapmış kullanıcıların erişebileceği sayfaları korur.
const ProtectedLayout = () => (
  <div className="flex min-h-screen bg-background">
    <Sidebar />
    <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 ml-0 lg:ml-72 transition-all duration-300 ease-in-out">
      <div className="flex-grow max-w-8xl mx-auto w-full">
        <Outlet /> {/* İç içe route'lar burada render edilecek */}
      </div>
      <Footer />
    </main>
  </div>
);

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div className="w-full h-full shimmer-bar"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>VetDash - Klinik Takip Sistemi</title>
        <meta name="description" content="Veteriner klinikleri için hepsi bir arada yönetim, takip ve analiz platformu." />
      </Helmet>

      <Routes>
        {!user ? (
          <>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </>
        ) : (
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/animals" element={<AnimalList />} />
            <Route path="/animal/:animalId" element={<AnimalProfile />} />
            <Route path="/add-animal" element={<AddAnimalPage />} />
            <Route path="/animal/:animalId/edit" element={<AddAnimalPage />} />
            <Route path="/animal/:animalId/health-record/add/:recordType" element={<HealthRecordPage />} />
            <Route path="/animal/:animalId/health-record/edit/:recordId" element={<HealthRecordPage />} />
            <Route path="/services" element={<ServicesManagement />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/add-appointment" element={<AddAppointmentPage />} />
            <Route path="/appointment/:appointmentId" element={<AppointmentDetailPage />} />
            <Route path="/appointment/:appointmentId/edit" element={<AddAppointmentPage />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/inventory" element={<InventoryManagement />} />
            <Route path="/customers" element={<CustomerManagement />} />
            <Route path="/customer/:customerId" element={<CustomerProfile />} />
            <Route path="/add-customer" element={<AddCustomerPage />} />
            <Route path="/customer/:customerId/edit" element={<AddCustomerPage />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/add-expense" element={<AddExpensePage />} />
            <Route path="/add-product" element={<AddProductPage />} />
            <Route path="/add-category" element={<AddCategoryPage />} />
            <Route path="/definitions" element={<DefinitionsPage />} />
            {/* Giriş yapılmışsa ve /auth'a gidilirse dashboard'a yönlendir */}
            <Route path="/auth" element={<Navigate to="/dashboard" replace />} />
          </Route>
        )}
      </Routes>

      <Toaster />
    </>
  );
}

export default App;