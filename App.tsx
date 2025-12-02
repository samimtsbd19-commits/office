import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Login } from './pages/Login';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { AdminChat } from './pages/admin/AdminChat';
import { UserDashboard } from './pages/user/UserDashboard';
import { DataMeq } from './pages/DataMeq';
import { UserRole } from './types';

const MainLayout: React.FC = () => {
  const { currentUser } = useStore();
  const [currentView, setCurrentView] = useState(
    currentUser?.role === UserRole.ADMIN ? 'admin-dashboard' : 'user-dashboard'
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If not logged in, show login
  if (!currentUser) {
    return <Login />;
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
    // Basic router logic
    if (currentUser.role === UserRole.ADMIN) {
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
        case 'user-profile': return <div className="p-10 text-center text-gray-500">Profile Settings (Placeholder)</div>;
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