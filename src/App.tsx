import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Dashboard } from './pages/Dashboard';
import { CreateService } from './pages/CreateService';
import { ProviderDashboard } from './pages/ProviderDashboard';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { VerifyService } from './pages/VerifyService';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);

  const handleSelectService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setActiveTab('verify');
  };

  const handleCreateSuccess = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setActiveTab('provider');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0D14] text-slate-100">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectService={handleSelectService}
          />
        )}

        {activeTab === 'create' && (
          <CreateService onSuccess={handleCreateSuccess} />
        )}

        {activeTab === 'provider' && (
          <ProviderDashboard
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectService={handleSelectService}
          />
        )}

        {activeTab === 'customer' && (
          <CustomerDashboard onSelectService={handleSelectService} />
        )}

        {activeTab === 'verify' && (
          <VerifyService
            initialServiceId={selectedServiceId}
            onClearInitialId={() => setSelectedServiceId(undefined)}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;

