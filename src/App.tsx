import React, { useState } from 'react';
import AuthPage from './components/AuthPage';
import BusinessSelector from './components/BusinessSelector';
import IceCalculator from './components/IceCalculator';
import { useAuth } from './hooks/useAuth';
import { useSupabaseKeepAlive } from './hooks/useSupabaseKeepAlive';
import { Business } from './types';

function App() {
  const { isAuthenticated, signOut, loading, user } = useAuth();
  useSupabaseKeepAlive(); // Hält Supabase aktiv
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-700 text-lg font-medium">Lade Anwendung...</p>
        </div>
      </div>
    );
  }

  const handleBusinessSelect = (business: Business) => {
    setSelectedBusiness(business);
  };

  const handleBackToBusiness = () => {
    setSelectedBusiness(null);
  };

  const handleLogout = () => {
    setSelectedBusiness(null);
    signOut();
  };

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Benutzer';

  return (
    <div className="min-h-screen">
      {!isAuthenticated ? (
        <AuthPage />
      ) : !selectedBusiness ? (
        <BusinessSelector 
          onBusinessSelect={handleBusinessSelect}
          onLogout={handleLogout}
          userName={userName}
        />
      ) : (
        <IceCalculator 
          onLogout={handleLogout}
          selectedBusiness={selectedBusiness}
          onBackToBusiness={handleBackToBusiness}
        />
      )}
    </div>
  );
}

export default App;