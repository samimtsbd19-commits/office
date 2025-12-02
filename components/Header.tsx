import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface HeaderProps {
  toggleSidebar: () => void;
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar, title }) => {
  const { currentUser, clearNotifications } = useStore();
  const unreadCount = currentUser?.notifications.filter(n => !n.read).length || 0;

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="p-2 mr-4 text-gray-600 rounded-lg lg:hidden hover:bg-gray-100"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <button 
            className="p-2 text-gray-500 rounded-full hover:bg-gray-100 transition-colors relative"
            onClick={clearNotifications} // Simple mechanic: click bell to clear
            title="Click to clear notifications"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
