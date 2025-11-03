import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import AuthPage from '@/components/AuthPage';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2 } from 'lucide-react';
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
import PaymentsPage from '@/components/PaymentsPage';
import AddProductPage from '@/components/AddProductPage';
import ExpensesPage from '@/components/ExpensesPage';
import AddExpensePage from '@/components/AddExpensePage';
import DefinitionsPage from '@/components/DefinitionsPage';
import AddCustomerPage from '@/components/AddCustomerPage';
import AddCategoryPage from '@/components/AddCategoryPage';
import Footer from '@/components/Footer';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [viewPayload, setViewPayload] = useState(null);
  const { user, loading, userProfile } = useAuth(); 

  const handleViewChange = (view, payload = null) => {
    setCurrentView(view);
    setViewPayload(payload);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="w-full h-full shimmer-bar"></div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={handleViewChange} />;
      case 'animals':
        return <AnimalList onViewChange={handleViewChange} />;
      case 'animal-profile':
        return <AnimalProfile animalId={viewPayload} onBack={() => handleViewChange('animals')} onViewChange={handleViewChange} />;
      case 'add-animal':
        return <AddAnimalPage customerId={viewPayload?.customerId} onBack={() => handleViewChange(viewPayload?.backTo || 'animals', viewPayload?.payload)} onSaveSuccess={() => handleViewChange(viewPayload?.backTo || 'animals', viewPayload?.payload)} onViewChange={handleViewChange} />;
      case 'edit-animal':
        return <AddAnimalPage animalId={viewPayload} onBack={() => handleViewChange('animal-profile', viewPayload)} onSaveSuccess={() => handleViewChange('animal-profile', viewPayload)} onViewChange={handleViewChange} />;
      case 'add-health-record':
      case 'edit-health-record':
        return <HealthRecordPage animalId={viewPayload.animalId} recordType={viewPayload.recordType} recordId={viewPayload.recordId} onBack={() => handleViewChange('animal-profile', viewPayload.animalId)} onSaveSuccess={() => handleViewChange('animal-profile', viewPayload.animalId)} />;
      case 'services':
        return <ServicesManagement />;
      case 'settings':
        return <SettingsPage />;
      case 'appointments':
        return <Appointments onViewChange={handleViewChange} />;
      case 'add-appointment':
      case 'edit-appointment':
        return <AddAppointmentPage appointmentId={viewPayload?.id} customerId={viewPayload?.customerId} onBack={() => handleViewChange(viewPayload?.backTo || 'appointments', viewPayload?.payload)} onSaveSuccess={() => handleViewChange(viewPayload?.backTo || 'appointments', viewPayload?.payload)} onViewChange={handleViewChange} />;
      case 'tasks':
        return <Tasks />;
      case 'inventory':
        return <InventoryManagement onViewChange={handleViewChange} />;
      case 'customers':
        return <CustomerManagement onViewChange={handleViewChange} />;
      case 'customer-profile':
        return <CustomerProfile customerId={viewPayload} onBack={() => handleViewChange('customers')} onViewChange={handleViewChange} />;
      case 'add-customer':
        return <AddCustomerPage onBack={() => handleViewChange(viewPayload?.backTo || 'customers')} onSaveSuccess={(newCustomerId) => handleViewChange(viewPayload?.backTo || 'customers', viewPayload?.backTo === 'add-animal' ? { ...viewPayload, newCustomerId } : newCustomerId )} />;
       case 'edit-customer':
        return <AddCustomerPage customerId={viewPayload} onBack={() => handleViewChange('customer-profile', viewPayload)} onSaveSuccess={(customerId) => handleViewChange('customer-profile', customerId)} />;
      case 'reports':
        return <Reports onViewChange={handleViewChange} />;
      case 'users':
        return <UserManagement />;
      case 'payments':
        return <PaymentsPage onViewChange={handleViewChange} />;
      case 'expenses':
        return <ExpensesPage onViewChange={handleViewChange} />;
      case 'add-expense':
        return <AddExpensePage expenseType={viewPayload?.type} onBack={() => handleViewChange('expenses')} onSaveSuccess={() => handleViewChange('expenses')} />;
      case 'add-product':
        return <AddProductPage onBack={() => handleViewChange('inventory')} onSaveSuccess={() => handleViewChange('inventory')} onViewChange={handleViewChange}/>;
      case 'add-category':
        return <AddCategoryPage onBack={() => handleViewChange('add-product')} onSaveSuccess={() => handleViewChange('add-product')} />;
      case 'definitions':
        return <DefinitionsPage />;
      default:
        return <Dashboard onViewChange={handleViewChange} />;
    }
  };

  return (
    <>
        <Helmet>
            <title>VetDash - Klinik Takip Sistemi</title>
            <meta name="description" content="Veteriner klinikleri için hepsi bir arada yönetim, takip ve analiz platformu." />
        </Helmet>
        
        {!user ? (
            <AuthPage />
        ) : (
            <div className="flex min-h-screen bg-background">
                <Sidebar currentView={currentView} onViewChange={handleViewChange} />
                <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 ml-0 lg:ml-72 transition-all duration-300 ease-in-out">
                    <div className="flex-grow max-w-8xl mx-auto w-full">
                        {renderContent()}
                    </div>
                    <Footer />
                </main>
            </div>
        )}
        
        <Toaster />
    </>
  );
}

export default App;