import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { UserRole } from '../types';
import { ShieldCheck, User } from 'lucide-react';

export const Login: React.FC = () => {
  const { users, login } = useStore();
  const [selectedEmail, setSelectedEmail] = useState('');

  const admins = users.filter(u => u.role === UserRole.ADMIN);
  const regularUsers = users.filter(u => u.role !== UserRole.ADMIN);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmail) {
      login(selectedEmail);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-slate-850 p-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">NexusAdmin</h1>
          <p className="text-slate-400">Select an account to simulate login</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Simulate Admin Access
              </label>
              <div className="grid grid-cols-1 gap-2">
                {admins.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedEmail(u.email)}
                    className={`flex items-center p-3 border rounded-lg transition-all ${
                      selectedEmail === u.email 
                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="bg-indigo-100 p-2 rounded-full mr-3">
                        <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="text-left">
                        <div className="font-medium text-gray-900">{u.name}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Simulate User Access
              </label>
              <div className="max-h-48 overflow-y-auto grid grid-cols-1 gap-2 pr-1">
                 {regularUsers.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedEmail(u.email)}
                    className={`flex items-center p-3 border rounded-lg transition-all ${
                      selectedEmail === u.email 
                        ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' 
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="bg-emerald-100 p-2 rounded-full mr-3">
                        <User className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-left">
                        <div className="font-medium text-gray-900">{u.name}</div>
                        <div className="text-xs text-gray-500">{u.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedEmail}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-850 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Login to Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
