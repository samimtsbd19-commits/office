
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { UserRole, User } from '../types';
import { Database, Upload, Trash2, Activity, Play, Copy, Lock, Unlock, List, RefreshCw, PieChart, AlertTriangle, Settings, Users as UsersIcon, RotateCcw, Save, Infinity as InfinityIcon, FilePlus } from 'lucide-react';

// --- Constants mimicking Python Code ---
const PLACEHOLDERS = [
  "Personal Text Mail (Email:Pass)", 
  "Team Report Text mail 1 (Email:Pass)", 
  "Team Report Text mail 2 (Email:Pass)",
  "Team Report Text mail 3 (Email:Pass)", 
  "Access All office Text Mail (Email:Pass)", 
  "All Team Report Text Mail (Email:Pass)",
  "Personal Leader Text Mail (Email:Pass)", 
  "Mother Text mail (Email:Pass)"
];

const FIXED_POSITIONS: Record<number, number> = {
  1: 85, // Index 1 (Team Report 1) -> Pos 85
  2: 86,
  3: 87,
  4: 70,
  5: 200,
  6: 250,
  7: 350
};

export const DataMeq: React.FC = () => {
  const { 
      currentUser, 
      users,
      data1, 
      data2, 
      dataMeqLogs, 
      systemSettings, 
      addDataMeq, 
      clearDataMeq, 
      generateEmails,
      updateSystemSettings,
      updateUserLimit,
      resetUserUsage
  } = useStore();
  
  // --- Admin State ---
  const [selectedUserForRules, setSelectedUserForRules] = useState<User | null>(null);
  
  // Rules Modal Temporary State
  const [tempLimit, setTempLimit] = useState(0);
  const [tempMaxPerReq, setTempMaxPerReq] = useState(0);
  const [isUnlimited, setIsUnlimited] = useState(false);

  // --- User / Generator State ---
  const [pick1, setPick1] = useState(0);
  const [pick2, setPick2] = useState(0);
  
  const [inserts, setInserts] = useState(
    PLACEHOLDERS.map((ph, idx) => ({
      text: '',
      pos: FIXED_POSITIONS[idx] || 0,
      isFixed: Object.prototype.hasOwnProperty.call(FIXED_POSITIONS, idx),
      placeholder: ph
    }))
  );

  const [output, setOutput] = useState('');
  const [generatedCount, setGeneratedCount] = useState(0);

  const handleInsertChange = (index: number, field: 'text' | 'pos', value: string | number) => {
      const newInserts = [...inserts];
      // @ts-ignore
      newInserts[index][field] = value;
      setInserts(newInserts);
  };

  const handleGenerate = () => {
      if (pick1 > data1.length || pick2 > data2.length) {
          alert('Not enough data available in SQL Database!');
          return;
      }
      if (pick1 === 0 && pick2 === 0) {
          alert('Please pick at least some data.');
          return;
      }

      const formattedInserts = inserts
        .filter(i => i.text.trim().length > 0)
        .map(i => ({ pos: i.pos, text: i.text }));

      const result = generateEmails(pick1, pick2, formattedInserts);
      
      if (!result && (pick1 > 0 || pick2 > 0)) {
          return; 
      }

      setOutput(result);
      setGeneratedCount(prev => prev + result.split('\n').filter(x => x).length);
  };

  const handleCopy = () => {
      if (!output) return;
      navigator.clipboard.writeText(output);
      const count = output.split('\n').filter(l => l.includes('@')).length;
      alert(`Copied! Total emails: ${count}`);
      setOutput('');
  };

  const openRulesModal = (user: User) => {
      setSelectedUserForRules(user);
      const isUnlim = user.dataMeqLimit === -1;
      setIsUnlimited(isUnlim);
      setTempLimit(isUnlim ? 100 : user.dataMeqLimit);
      setTempMaxPerReq(user.maxPickPerRequest || 50);
  };

  const saveRules = () => {
      if (selectedUserForRules) {
          const limitToSave = isUnlimited ? -1 : tempLimit;
          updateUserLimit(selectedUserForRules.id, limitToSave, tempMaxPerReq);
          setSelectedUserForRules(null);
      }
  };

  const resetUsage = () => {
      if (selectedUserForRules) {
          resetUserUsage(selectedUserForRules.id);
          alert(`Usage for ${selectedUserForRules.name} has been reset.`);
          setSelectedUserForRules(null);
      }
  };

  // Reusable Component for Adding Data
  const DataIngestion = ({ type, color, allowClear = false }: { type: 'data1' | 'data2', color: 'blue' | 'emerald', allowClear?: boolean }) => {
      const [localInput, setLocalInput] = useState('');
      const dataCount = type === 'data1' ? data1.length : data2.length;
      const title = type === 'data1' ? 'Data Source 1' : 'Data Source 2';
      const colorClass = color === 'blue' ? 'text-blue-600' : 'text-emerald-600';
      const bgClass = color === 'blue' ? 'bg-blue-100' : 'bg-emerald-100';
      const textClass = color === 'blue' ? 'text-blue-700' : 'text-emerald-700';
      const indicatorClass = color === 'blue' ? 'bg-blue-500' : 'bg-emerald-500';
      const borderClass = color === 'blue' ? 'border-blue-200' : 'border-emerald-200';
      const hoverClass = color === 'blue' ? 'hover:bg-blue-100' : 'hover:bg-emerald-100';
      const focusClass = color === 'blue' ? 'focus:ring-blue-500' : 'focus:ring-emerald-500';
      const buttonBgClass = color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700';

      const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (content) {
                addDataMeq(type, content);
                e.target.value = ''; 
                alert(`Successfully uploaded to SQL Database: ${title}`);
            }
        };
        reader.readAsText(file);
      };

      return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className={`font-bold flex items-center text-lg ${colorClass}`}>
                    <Database className="w-5 h-5 mr-2" /> 
                    {title}
                    <span className={`ml-2 py-1 px-3 rounded-full text-sm font-bold flex items-center shadow-sm transition-all duration-300 ${dataCount > 0 ? bgClass + ' ' + textClass : 'bg-red-100 text-red-600'}`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${dataCount > 0 ? indicatorClass + ' animate-pulse' : 'bg-red-500'}`}></span>
                        {dataCount} Lines
                    </span>
                </h3>
                {allowClear && (
                    <button 
                        onClick={() => { if(confirm(`Clear ${title}?`)) clearDataMeq(type); }}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                        title="Clear Data"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>
            
            <div className="mb-4">
                <label className={`flex items-center justify-center w-full px-4 py-3 border border-dashed rounded-lg cursor-pointer transition-colors group ${borderClass} ${color === 'blue' ? 'bg-blue-50' : 'bg-emerald-50'} ${hoverClass}`}>
                    <Upload className={`w-5 h-5 mr-2 group-hover:scale-110 transition-transform ${colorClass}`} />
                    <span className={`text-sm font-medium ${textClass}`}>Upload Text File for {type === 'data1' ? 'Data 1' : 'Data 2'}</span>
                    <input type="file" className="hidden" accept=".txt" onChange={handleFileUpload} />
                </label>
            </div>

            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-semibold">OR MANUAL PASTE</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <div className="flex-1 flex flex-col mt-2">
                <textarea 
                    className={`flex-1 w-full min-h-[120px] p-3 border border-gray-200 rounded-lg text-sm mb-3 ${focusClass} focus:ring-2 resize-none`}
                    placeholder={`Paste lines for ${title} here...`}
                    value={localInput}
                    onChange={e => setLocalInput(e.target.value)}
                />
                <button 
                    onClick={() => { addDataMeq(type, localInput); setLocalInput(''); alert(`Added to ${title}`); }}
                    disabled={!localInput}
                    className={`w-full py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm transition-colors ${buttonBgClass}`}
                >
                    Add to {type === 'data1' ? 'Data 1' : 'Data 2'}
                </button>
            </div>
        </div>
      );
  };

  // --- Views ---

  const AdminView = () => {
    const regularUsers = users.filter(u => u.role !== UserRole.ADMIN);

    return (
    <div className="space-y-6">
       {/* System Control Panel */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-gray-50 to-white gap-4">
           <div>
               <h3 className="font-bold text-gray-800 text-lg">System Control</h3>
               <p className="text-sm text-gray-500">Manage access to Data Meq generation</p>
           </div>
           <div className="flex items-center gap-6">
                {/* User Upload Toggle Switch */}
                <label className="flex items-center cursor-pointer">
                    <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={systemSettings.allowUserUploads}
                          onChange={() => updateSystemSettings({ allowUserUploads: !systemSettings.allowUserUploads })}
                        />
                        <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ${systemSettings.allowUserUploads ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ${systemSettings.allowUserUploads ? 'transform translate-x-6' : ''}`}></div>
                    </div>
                    <div className="ml-3 font-medium text-gray-700 select-none">Allow User Uploads</div>
                </label>

                <div className="h-8 w-px bg-gray-300 hidden md:block"></div>

                {/* Lock Toggle Button */}
                <div className="flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-lg flex items-center transition-colors ${systemSettings.dataMeqLocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {systemSettings.dataMeqLocked ? <Lock className="w-5 h-5 mr-2"/> : <Unlock className="w-5 h-5 mr-2"/>}
                        <span className="font-bold">{systemSettings.dataMeqLocked ? 'LOCKED' : 'ACTIVE'}</span>
                    </div>
                    <button 
                        onClick={() => updateSystemSettings({ dataMeqLocked: !systemSettings.dataMeqLocked })}
                        className={`px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-colors ${systemSettings.dataMeqLocked ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}
                    >
                        {systemSettings.dataMeqLocked ? 'Unlock System' : 'Lock System'}
                    </button>
                </div>
           </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <DataIngestion type="data1" color="blue" allowClear={true} />
           <DataIngestion type="data2" color="emerald" allowClear={true} />
       </div>

       {/* User Rule Management Section */}
       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
           <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <div>
                   <h3 className="font-bold text-gray-800 text-lg flex items-center">
                       <UsersIcon className="w-5 h-5 mr-2 text-indigo-600" />
                       User Rules & Quotas
                   </h3>
                   <p className="text-sm text-gray-500 mt-1">
                       Define data access limits for each user.
                   </p>
               </div>
               <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-200">
                   {regularUsers.length} Users
               </span>
           </div>
           
           <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {regularUsers.map(user => {
                        const isUnlimited = user.dataMeqLimit === -1;
                        const usagePercent = !isUnlimited && user.dataMeqLimit > 0 ? (user.dataMeqUsage / user.dataMeqLimit) * 100 : 0;
                        const isLimitReached = !isUnlimited && user.dataMeqUsage >= user.dataMeqLimit;
                        
                        return (
                            <div key={user.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-white flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <img src={user.avatar} alt="" className="w-10 h-10 rounded-full border border-gray-100" />
                                        <div className="overflow-hidden">
                                            <h4 className="font-bold text-gray-800 truncate text-sm">{user.name}</h4>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <button 
                                            onClick={() => {
                                                if (window.confirm(`Are you sure you want to reset usage for ${user.name}?`)) {
                                                    resetUserUsage(user.id);
                                                }
                                            }}
                                            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                            title="Reset Usage to 0"
                                        >
                                            <RotateCcw className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => openRulesModal(user)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Configure Rules"
                                        >
                                            <Settings className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="mt-auto space-y-3">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1 font-medium">
                                            <span className="text-gray-500">Usage</span>
                                            <span className={`${isLimitReached ? 'text-red-600' : 'text-blue-600'}`}>
                                                {user.dataMeqUsage} / {isUnlimited ? '∞' : user.dataMeqLimit}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden relative">
                                            {isUnlimited ? (
                                                <div className="w-full h-full bg-gradient-to-r from-blue-300 to-indigo-300 opacity-50" />
                                            ) : (
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${isLimitReached ? 'bg-red-500' : 'bg-blue-500'}`} 
                                                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                                />
                                            )}
                                        </div>
                                        <div className="flex text-[10px] text-gray-400 mt-1 gap-2">
                                            <span className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1"></div> Data 1: {user.data1Usage || 0}</span>
                                            <span className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></div> Data 2: {user.data2Usage || 0}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                                        <span>Max/Req: {user.maxPickPerRequest || 50}</span>
                                        <span className={`px-1.5 py-0.5 rounded ${user.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{user.status}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    
                    {regularUsers.length === 0 && (
                        <div className="col-span-full text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            No active regular users found to manage.
                        </div>
                    )}
                </div>
           </div>
       </div>

       {/* Logs */}
       <PublicActivityLog />

       {/* Rule Edit Modal */}
       {selectedUserForRules && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                   <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
                       <h3 className="font-bold text-lg flex items-center">
                           <Settings className="w-5 h-5 mr-2" /> Manage Rules
                       </h3>
                       <button onClick={() => setSelectedUserForRules(null)} className="text-indigo-200 hover:text-white text-xl font-bold">&times;</button>
                   </div>
                   
                   <div className="p-6 space-y-6">
                       <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                           <img src={selectedUserForRules.avatar} alt="" className="w-12 h-12 rounded-full" />
                           <div>
                               <h4 className="font-bold text-gray-900">{selectedUserForRules.name}</h4>
                               <p className="text-xs text-gray-500">{selectedUserForRules.email}</p>
                           </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                           <div className="col-span-2">
                               <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2 cursor-pointer">
                                   <input 
                                     type="checkbox" 
                                     checked={isUnlimited} 
                                     onChange={(e) => setIsUnlimited(e.target.checked)}
                                     className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                   />
                                   <span>Unlimited Daily Access</span>
                               </label>
                           </div>

                           <div className="col-span-2 sm:col-span-1">
                               <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                   Daily Limit
                               </label>
                               <div className="relative">
                                   <input 
                                       type="number" 
                                       min="0"
                                       className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono ${isUnlimited ? 'bg-gray-100 text-gray-400' : 'border-gray-300'}`}
                                       value={tempLimit}
                                       onChange={(e) => setTempLimit(parseInt(e.target.value) || 0)}
                                       disabled={isUnlimited}
                                   />
                                   {isUnlimited && <InfinityIcon className="absolute right-2 top-2.5 w-5 h-5 text-gray-400" />}
                               </div>
                           </div>

                           <div className="col-span-2 sm:col-span-1">
                               <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                   Max Per Click
                               </label>
                               <input 
                                   type="number" 
                                   min="1"
                                   className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                                   value={tempMaxPerReq}
                                   onChange={(e) => setTempMaxPerReq(parseInt(e.target.value) || 1)}
                               />
                           </div>
                       </div>

                       <div className="bg-blue-50 rounded-lg p-3 flex flex-col gap-2 border border-blue-100">
                           <div className="flex justify-between items-center">
                               <div>
                                   <div className="text-xs text-blue-800 font-bold uppercase">Current Daily Usage</div>
                                   <div className="text-blue-900 font-mono font-medium">{selectedUserForRules.dataMeqUsage} lines</div>
                               </div>
                               <button 
                                   onClick={resetUsage}
                                   className="text-xs bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded-md hover:bg-blue-100 flex items-center font-medium transition-colors"
                               >
                                   <RotateCcw className="w-3 h-3 mr-1" /> Reset
                               </button>
                           </div>
                           <div className="flex text-[10px] text-blue-600 gap-3 border-t border-blue-200 pt-2">
                               <span className="font-semibold">D1: {selectedUserForRules.data1Usage || 0}</span>
                               <span className="font-semibold">D2: {selectedUserForRules.data2Usage || 0}</span>
                           </div>
                       </div>

                       <div className="flex space-x-3 pt-2">
                           <button 
                               onClick={() => setSelectedUserForRules(null)}
                               className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                           >
                               Cancel
                           </button>
                           <button 
                               onClick={saveRules}
                               className="flex-1 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-colors flex justify-center items-center"
                           >
                               <Save className="w-4 h-4 mr-2" /> Save Rules
                           </button>
                       </div>
                   </div>
               </div>
           </div>
       )}
    </div>
    );
  };

  const PublicActivityLog = () => (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
           <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
               <h3 className="font-bold text-gray-800 flex items-center">
                   <Activity className="w-5 h-5 mr-2 text-blue-600" /> Live Global Activity
               </h3>
               <div className="text-xs text-green-600 flex items-center">
                   <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Live Updates
               </div>
           </div>
           <div className="max-h-60 overflow-y-auto">
               <table className="w-full text-left text-sm">
                   <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0">
                       <tr>
                           <th className="p-3">User</th>
                           <th className="p-3 text-center">Data 1</th>
                           <th className="p-3 text-center">Data 2</th>
                           <th className="p-3 text-right">Total Generated</th>
                           <th className="p-3 text-right">Time</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                       {dataMeqLogs.map(log => (
                           <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                               <td className="p-3 font-medium text-gray-900 flex items-center">
                                   <div className="w-2 h-2 rounded-full bg-blue-400 mr-2"></div>
                                   {log.userName}
                               </td>
                               <td className="p-3 text-center text-gray-600">{log.count1}</td>
                               <td className="p-3 text-center text-gray-600">{log.count2}</td>
                               <td className="p-3 text-right font-bold text-gray-800">{log.totalGenerated} lines</td>
                               <td className="p-3 text-right text-xs text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                           </tr>
                       ))}
                       {dataMeqLogs.length === 0 && (
                           <tr>
                               <td colSpan={5} className="p-6 text-center text-gray-400">No recent activity</td>
                           </tr>
                       )}
                   </tbody>
               </table>
           </div>
       </div>
  );

  const GeneratorView = ({ isAdmin = false }: { isAdmin?: boolean }) => {
      const isLocked = systemSettings.dataMeqLocked && !isAdmin;

      if (isLocked) {
          return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
                 <div className="lg:col-span-3 h-96 bg-gray-100 rounded-xl border border-gray-200 flex flex-col items-center justify-center text-center p-8">
                      <div className="bg-red-100 p-4 rounded-full mb-4">
                          <Lock className="w-12 h-12 text-red-500" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">System Locked</h2>
                      <p className="text-gray-600 max-w-md">
                          The Data Meq generation system is currently paused by the administrator. 
                          Please wait until it is unlocked to generate emails.
                      </p>
                 </div>
                 <div className="lg:col-span-3">
                     <PublicActivityLog />
                 </div>
              </div>
          );
      }

      // Quota logic for non-admins
      const usage = currentUser?.dataMeqUsage || 0;
      const limit = currentUser?.dataMeqLimit ?? 0;
      const isUnlimited = limit === -1;
      const remaining = isUnlimited ? Infinity : Math.max(0, limit - usage);
      const percentUsed = isUnlimited ? 0 : (limit > 0 ? (usage / limit) * 100 : 0);
      const isQuotaFull = !isAdmin && !isUnlimited && remaining <= 0;
      
      const maxPerReq = currentUser?.maxPickPerRequest || 50;

      // Calculate max allowed for input based on all constraints
      // Admin: Total Data
      // User: Min(Total Data, MaxPerRequest, RemainingQuota)
      const maxPickable1 = isAdmin ? data1.length : Math.min(data1.length, maxPerReq, isUnlimited ? data1.length : remaining);
      const maxPickable2 = isAdmin ? data2.length : Math.min(data2.length, maxPerReq, isUnlimited ? data2.length : remaining);

      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
              
              {/* Quota Display for User */}
              {!isAdmin && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                          <h4 className="font-bold text-gray-800 flex items-center">
                              <PieChart className="w-5 h-5 mr-2 text-indigo-500" /> Your Daily Quota
                          </h4>
                          <span className={`text-sm font-bold flex items-center ${isQuotaFull ? 'text-red-500' : 'text-indigo-600'}`}>
                              {isQuotaFull && <AlertTriangle className="w-4 h-4 mr-1"/>}
                              {isUnlimited ? 'Unlimited Access' : `${remaining} lines remaining`}
                          </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden relative">
                          {isUnlimited ? (
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-300 via-purple-300 to-indigo-300 opacity-50 animate-pulse"></div>
                          ) : (
                              <div 
                                  className={`h-full transition-all duration-700 ease-out flex items-center justify-end pr-2 text-[10px] font-bold text-white ${percentUsed > 90 ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`} 
                                  style={{ width: `${Math.min(percentUsed, 100)}%` }}
                              >
                                  {Math.round(percentUsed)}%
                              </div>
                          )}
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                          <span>Used Today: {usage}</span>
                          <div className="flex gap-2">
                             <span>Data 1: {currentUser?.data1Usage || 0}</span>
                             <span>Data 2: {currentUser?.data2Usage || 0}</span>
                          </div>
                          <span className="flex items-center">Max per click: {maxPerReq}</span>
                      </div>
                  </div>
              )}

              {/* User Contribution Section (If enabled) */}
              {!isAdmin && systemSettings.allowUserUploads && (
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 border-dashed">
                      <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                          <FilePlus className="w-5 h-5 mr-2 text-orange-500" /> Contribute Data
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <DataIngestion type="data1" color="blue" allowClear={false} />
                           <DataIngestion type="data2" color="emerald" allowClear={false} />
                      </div>
                  </div>
              )}

              {/* Pick Controls */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-6">
                  <div className="flex-1">
                      <div className="flex items-center mb-2 gap-2">
                          <label className="block text-sm font-medium text-gray-700">Data Source 1</label>
                          <span className={`text-xs font-bold ${data1.length > 0 ? 'text-blue-600' : 'text-red-500'} flex items-center bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100`}>
                              {data1.length > 0 && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse mr-2"></span>}
                              {data1.length} Lines
                          </span>
                      </div>
                      <div className="flex items-center justify-between bg-white border border-gray-300 rounded-lg p-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                          <input 
                              type="number" 
                              min="0" 
                              max={maxPickable1}
                              value={pick1}
                              onChange={e => {
                                  // Ensure we don't exceed maxPerReq combined or individual data limits
                                  const val = parseInt(e.target.value) || 0;
                                  setPick1(val);
                              }}
                              className="flex-1 outline-none min-w-0 font-medium text-gray-800"
                              placeholder="0"
                              disabled={isQuotaFull && !isAdmin}
                          />
                      </div>
                  </div>
                  <div className="flex-1">
                      <div className="flex items-center mb-2 gap-2">
                          <label className="block text-sm font-medium text-gray-700">Data Source 2</label>
                          <span className={`text-xs font-bold ${data2.length > 0 ? 'text-emerald-600' : 'text-red-500'} flex items-center bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100`}>
                              {data2.length > 0 && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></span>}
                              {data2.length} Lines
                          </span>
                      </div>
                      <div className="flex items-center justify-between bg-white border border-gray-300 rounded-lg p-2 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                          <input 
                              type="number" 
                              min="0" 
                              max={maxPickable2}
                              value={pick2}
                              onChange={e => {
                                  const val = parseInt(e.target.value) || 0;
                                  setPick2(val);
                              }}
                              className="flex-1 outline-none min-w-0 font-medium text-gray-800"
                              placeholder="0"
                              disabled={isQuotaFull && !isAdmin}
                          />
                      </div>
                  </div>
              </div>

              {/* Text Mail Inserts */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                      <List className="w-5 h-5 mr-2" /> Text Mail Emails & Positions
                  </h4>
                  <div className="space-y-3">
                      {inserts.map((ins, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                              <span className="w-6 text-sm font-bold text-gray-500">{idx + 1}.</span>
                              <input 
                                  type="text" 
                                  placeholder={ins.placeholder}
                                  value={ins.text}
                                  onChange={e => handleInsertChange(idx, 'text', e.target.value)}
                                  className="flex-1 p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 outline-none transition-shadow"
                                  disabled={isQuotaFull && !isAdmin}
                              />
                              <div className="flex items-center gap-1 w-24">
                                  <span className="text-xs text-gray-500">Pos:</span>
                                  <input 
                                      type="number"
                                      value={ins.pos}
                                      onChange={e => handleInsertChange(idx, 'pos', parseInt(e.target.value))}
                                      disabled={ins.isFixed || (isQuotaFull && !isAdmin)} 
                                      className={`w-full p-1 text-sm border border-gray-200 rounded ${ins.isFixed ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                  />
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              <button 
                  onClick={handleGenerate}
                  disabled={isQuotaFull && !isAdmin}
                  className={`w-full py-4 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center active:scale-95 ${
                      isQuotaFull && !isAdmin ? 'bg-gray-400 cursor-not-allowed hover:scale-100' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                  }`}
              >
                  {isQuotaFull && !isAdmin ? <Lock className="w-6 h-6 mr-2" /> : <Play className="w-6 h-6 mr-2" />}
                  {isQuotaFull && !isAdmin ? 'Quota Limit Reached' : 'Generate Emails'}
              </button>
              
              {!isAdmin && <PublicActivityLog />}
          </div>

          <div className="lg:col-span-1 flex flex-col h-full">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-gray-800">Results</h4>
                      <span className="text-xs text-gray-500">Session Total: {generatedCount}</span>
                  </div>
                  <textarea 
                      readOnly
                      value={output}
                      className="flex-1 w-full bg-slate-50 border border-gray-200 rounded-lg p-3 text-xs font-mono resize-none mb-3 focus:outline-none focus:ring-1 focus:ring-gray-300"
                      placeholder="Generated output will appear here..."
                  />
                  <button 
                      onClick={handleCopy}
                      disabled={!output}
                      className="w-full py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center transition-colors"
                  >
                      <Copy className="w-4 h-4 mr-2" /> Copy to Clipboard
                  </button>
              </div>
          </div>
      </div>
      );
  };

  return (
    <div className="container mx-auto max-w-6xl pb-10">
       {currentUser?.role === UserRole.ADMIN ? <AdminView /> : <GeneratorView />}
    </div>
  );
};
