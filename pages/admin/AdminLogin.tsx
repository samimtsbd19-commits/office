
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShieldCheck, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export const AdminLogin: React.FC<Props> = ({ onBack }) => {
  const { login } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Artificial delay to simulate secure handshake
    setTimeout(async () => {
        const success = await login(email, password);
        if (!success) {
            setError('Authentication Failed: Invalid credentials or insufficient permissions.');
            setLoading(false);
        }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <button onClick={onBack} className="absolute top-8 left-8 text-slate-400 hover:text-white flex items-center transition-colors">
        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Portal
      </button>

      <div className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-700 bg-slate-800/50">
           <div className="flex justify-center mb-4">
              <div className="bg-blue-600/20 p-3 rounded-full border border-blue-500/30">
                  <ShieldCheck className="w-10 h-10 text-blue-500" />
              </div>
           </div>
           <h2 className="text-2xl font-bold text-center text-white">Admin Access</h2>
           <p className="text-center text-slate-400 text-sm mt-1">Restricted Area • Authorization Required</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Administrator Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
              placeholder="admin@nexus.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Secure Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Authenticate System'}
          </button>
        </form>
      </div>
    </div>
  );
};
