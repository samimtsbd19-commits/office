import React from 'react';
import { UserRole } from '../types';
import { LayoutDashboard, Users, UserCircle, LogOut, MessageSquare, Database } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, setIsOpen }) => {
  const { currentUser, logout } = useStore();

  if (!currentUser) return null;

  const isAdmin = currentUser.role === UserRole.ADMIN;

  const menuItems = isAdmin ? [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'user-management', label: 'User Management', icon: Users },
    { id: 'admin-chat', label: 'Messages', icon: MessageSquare },
    { id: 'data-meq', label: 'Data Meq', icon: Database },
  ] : [
    { id: 'user-dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'data-meq', label: 'Data Meq', icon: Database },
    { id: 'user-profile', label: 'My Profile', icon: UserCircle },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-850 text-white transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-20 border-b border-slate-700">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              Nexus<span className="text-white">Admin</span>
            </h1>
          </div>

          <div className="flex flex-col flex-1 p-4 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 pl-3">
              Menu
            </div>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onChangeView(item.id);
                  setIsOpen(false);
                }}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  currentView === item.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center mb-4 px-2">
              <img 
                src={currentUser.avatar} 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-slate-600"
              />
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-400 truncate capitalize">{currentUser.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-red-400 bg-red-400/10 rounded-lg hover:bg-red-400/20 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
