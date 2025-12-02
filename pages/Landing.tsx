
import React from 'react';
import { ShieldCheck, User, Database } from 'lucide-react';

interface LandingProps {
  onSelect: (role: 'admin' | 'user') => void;
}

export const Landing: React.FC<LandingProps> = ({ onSelect }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-5xl z-10">
        <div className="text-center mb-12">
           <div className="inline-flex items-center justify-center p-3 bg-slate-800 rounded-xl mb-4 shadow-lg border border-slate-700">
               <Database className="w-6 h-6 text-blue-400 mr-2" />
               <span className="text-slate-200 font-bold tracking-wider">LOCAL SQLITE SYSTEM</span>
           </div>
           <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
             Nexus<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Admin</span>
           </h1>
           <p className="text-slate-400 text-lg max-w-2xl mx-auto">
             Secure, role-based management dashboard with real-time data synchronization and AI-powered analytics.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Admin Card */}
          <button 
            onClick={() => onSelect('admin')}
            className="group relative bg-slate-800 hover:bg-slate-750 p-8 rounded-3xl border border-slate-700 hover:border-blue-500/50 transition-all duration-300 text-left shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1"
          >
            <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:rotate-12 duration-500">
              <ShieldCheck className="w-32 h-32 text-blue-500" />
            </div>
            <div className="bg-blue-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Admin Portal</h2>
            <p className="text-slate-400 leading-relaxed">
              Full system control. Manage users, monitor logs, configure global settings, and oversee data distribution.
            </p>
            <div className="mt-6 flex items-center text-blue-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
               Secure Login &rarr;
            </div>
          </button>

          {/* User Card */}
          <button 
            onClick={() => onSelect('user')}
            className="group relative bg-slate-800 hover:bg-slate-750 p-8 rounded-3xl border border-slate-700 hover:border-emerald-500/50 transition-all duration-300 text-left shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1"
          >
            <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:-rotate-12 duration-500">
              <User className="w-32 h-32 text-emerald-500" />
            </div>
            <div className="bg-emerald-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
              <User className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">User Portal</h2>
            <p className="text-slate-400 leading-relaxed">
              Access your personal workspace. View dashboards, participate in chats, and utilize data generation tools.
            </p>
            <div className="mt-6 flex items-center text-emerald-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
               User Access &rarr;
            </div>
          </button>

        </div>
        
        <div className="text-center mt-16">
           <p className="text-slate-600 text-xs uppercase tracking-widest">
             System Status: <span className="text-emerald-500 font-bold">Online</span> • Database: <span className="text-blue-500 font-bold">Connected</span>
           </p>
        </div>
      </div>
    </div>
  );
};
