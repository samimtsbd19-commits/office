
import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Landing } from './pages/Landing';
import { AdminLogin } from './pages/admin/AdminLogin';
import { UserLogin } from './pages/UserLogin';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { AdminChat } from './pages/admin/AdminChat';
import { UserDashboard } from './pages/user/UserDashboard';
import { DataMeq } from './pages/DataMeq';
import { UserRole } from './types';

const MainLayout: React.FC = () => {
  const { currentUser, isDbConnected } = useStore();
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Auth Flow State
  const [authView, setAuthView] = useState<'landing' | 'admin' | 'user'>('landing');

  // System Boot Loader
  if (!isDbConnected) {
      return (
          <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white">
              <div className="mb-8 relative">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-emerald-500 border-b-transparent rounded-full animate-spin direction-reverse"></div>
                  </div>
              </div>
              <h2 className="text-xl font-bold tracking-widest mb-2">NEXUS<span className="text-blue-400">ADMIN</span></h2>
              <p className="text-slate-400 text-sm animate-pulse">Initializing SQLite Database...</p>
          </div>
      );
  }

  // Not Logged In: Show Auth Screens
  if (!currentUser) {
    if (authView === 'admin') return <AdminLogin onBack={() => setAuthView('landing')} />;
    if (authView === 'user') return <UserLogin onBack={() => setAuthView('landing')} />;
    return <Landing onSelect={setAuthView} />;
  }

  // Logged In Logic
  const isAdmin = currentUser.role === UserRole.ADMIN;
  
  // Default views if currentView not set or invalid
  if (currentView === 'dashboard') {
      setCurrentView(isAdmin ? 'admin-dashboard' : 'user-dashboard');
  }

  const getTitle = () => {
    switch(currentView) {
        case 'admin-dashboard': return 'Dashboard Overview';
        case 'user-management': return 'User Management Control';
        case 'admin-chat': return 'Global Messages';
        case 'data-meq': return 'Data Meq Tool';
        case 'user-dashboard': return 'My Dashboard';
        case 'user-profile': return 'My Profile';
        default: return 'NexusAdmin';
    }
  };

  const renderContent = () => {
    if (isAdmin) {
      switch(currentView) {
        case 'admin-dashboard': return <AdminDashboard />;
        case 'user-management': return <UserManagement />;
        case 'admin-chat': return <AdminChat />;
        case 'data-meq': return <DataMeq />;
        default: return <AdminDashboard />;
      }
    } else {
      switch(currentView) {
        case 'user-dashboard': return <UserDashboard />;
        case 'data-meq': return <DataMeq />;
        case 'user-profile': return <div className="p-10 text-center text-gray-500">Profile Settings (Coming Soon)</div>;
        default: return <UserDashboard />;
      }
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          title={getTitle()}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8">
           {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
}
