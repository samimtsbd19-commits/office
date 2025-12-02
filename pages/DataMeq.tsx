
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { UserRole } from '../types';
import { Database, Upload, Trash2, Activity, Play, Copy, Lock, Unlock, List, RefreshCw, FileText, PieChart } from 'lucide-react';

// --- Constants mimicking Python Code ---
const PLACEHOLDERS = [
  "Personal Text Mail", 
  "Team Report Text mail 1", 
  "Team Report Text mail 2",
  "Team Report Text mail 3", 
  "Access All office Text Mail", 
  "All Team Report Text Mail",
  "Personal Leader Text Mail", 
  "Mother Text mail"
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
      data1, 
      data2, 
      dataMeqLogs, 
      systemSettings, 
      addDataMeq, 
      clearDataMeq, 
      generateEmails,
      updateSystemSettings 
  } = useStore();
  
  // --- Admin State ---
  const [inputData1, setInputData1] = useState('');
  const [inputData2, setInputData2] = useState('');

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'data1' | 'data2') => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          const content = event.target?.result as string;
          if (content) {
              addDataMeq(type, content);
              e.target.value = ''; // Reset input
          }
      };
      reader.readAsText(file);
  };

  const handleGenerate = () => {
      if (pick1 > data1.length || pick2 > data2.length) {
          alert('Not enough data available!');
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

  // --- Views ---

  const AdminView = () => (
    <div className="space-y-6">
       {/* System Control Panel */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
           <div>
               <h3 className="font-bold text-gray-800 text-lg">System Control</h3>
               <p className="text-sm text-gray-500">Manage access to Data Meq generation</p>
           </div>
           <div className="flex items-center gap-4">
                <div className={`px-4 py-2 rounded-lg flex items-center ${systemSettings.dataMeqLocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
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

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Data 1 Control */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
               <div className="flex items-center mb-4 space-x-4">
                   <h3 className="font-bold text-gray-800 flex items-center">
                       <Database className="w-5 h-5 mr-2 text-blue-600" /> Data Source 1
                   </h3>
                   <div className="flex items-center space-x-2">
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {data1.length} Lines
                        </span>
                   </div>
               </div>
               
               {/* File Upload Button */}
               <div className="mb-3">
                   <label className="flex items-center justify-center w-full px-4 py-2 bg-gray-50 border border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                       <FileText className="w-4 h-4 mr-2 text-gray-500" />
                       <span className="text-sm text-gray-600">Upload Text File</span>
                       <input type="file" className="hidden" accept=".txt" onChange={(e) => handleFileUpload(e, 'data1')} />
                   </label>
               </div>

               <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OR PASTE</span>
                    <div className="flex-grow border-t border-gray-200"></div>
               </div>

               <textarea 
                  className="w-full h-32 p-3 border border-gray-200 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-blue-500"
                  placeholder="Paste Data 1 lines here..."
                  value={inputData1}
                  onChange={e => setInputData1(e.target.value)}
               />
               <div className="flex justify-between">
                   <button 
                      onClick={() => { addDataMeq('data1', inputData1); setInputData1(''); }}
                      disabled={!inputData1}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                   >
                       <Upload className="w-4 h-4 mr-2" /> Add Data
                   </button>
                   <button 
                       onClick={() => { if(confirm('Clear Data 1?')) clearDataMeq('data1'); }}
                       className="text-red-500 hover:text-red-700 text-sm flex items-center"
                   >
                       <Trash2 className="w-4 h-4 mr-1" /> Clear
                   </button>
               </div>
           </div>

           {/* Data 2 Control */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
               <div className="flex items-center mb-4 space-x-4">
                   <h3 className="font-bold text-gray-800 flex items-center">
                       <Database className="w-5 h-5 mr-2 text-emerald-600" /> Data Source 2
                   </h3>
                   <div className="flex items-center space-x-2">
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                            {data2.length} Lines
                        </span>
                   </div>
               </div>

               {/* File Upload Button */}
               <div className="mb-3">
                   <label className="flex items-center justify-center w-full px-4 py-2 bg-gray-50 border border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                       <FileText className="w-4 h-4 mr-2 text-gray-500" />
                       <span className="text-sm text-gray-600">Upload Text File</span>
                       <input type="file" className="hidden" accept=".txt" onChange={(e) => handleFileUpload(e, 'data2')} />
                   </label>
               </div>

               <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OR PASTE</span>
                    <div className="flex-grow border-t border-gray-200"></div>
               </div>

               <textarea 
                  className="w-full h-32 p-3 border border-gray-200 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-emerald-500"
                  placeholder="Paste Data 2 lines here..."
                  value={inputData2}
                  onChange={e => setInputData2(e.target.value)}
               />
               <div className="flex justify-between">
                   <button 
                      onClick={() => { addDataMeq('data2', inputData2); setInputData2(''); }}
                      disabled={!inputData2}
                      className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                   >
                       <Upload className="w-4 h-4 mr-2" /> Add Data
                   </button>
                   <button 
                       onClick={() => { if(confirm('Clear Data 2?')) clearDataMeq('data2'); }}
                       className="text-red-500 hover:text-red-700 text-sm flex items-center"
                   >
                       <Trash2 className="w-4 h-4 mr-1" /> Clear
                   </button>
               </div>
           </div>
       </div>

       {/* Admin Also has access to Generator */}
       <div className="border-t border-gray-200 pt-6">
           <h3 className="text-xl font-bold mb-4">Admin Generator Tool</h3>
           <GeneratorView isAdmin={true} />
       </div>

       {/* Logs */}
       <PublicActivityLog />
    </div>
  );

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
      const limit = currentUser?.dataMeqLimit || 0;
      const remaining = Math.max(0, limit - usage);
      const percentUsed = limit > 0 ? (usage / limit) * 100 : 0;
      const isQuotaFull = !isAdmin && remaining <= 0;

      return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
              
              {/* Quota Display for User */}
              {!isAdmin && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                          <h4 className="font-bold text-gray-800 flex items-center">
                              <PieChart className="w-5 h-5 mr-2 text-indigo-500" /> Your Data Quota
                          </h4>
                          <span className={`text-sm font-bold ${isQuotaFull ? 'text-red-500' : 'text-indigo-600'}`}>
                              {remaining} lines remaining
                          </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                          <div 
                              className={`h-3 rounded-full transition-all duration-500 ${percentUsed > 90 ? 'bg-red-500' : 'bg-indigo-500'}`} 
                              style={{ width: `${Math.min(percentUsed, 100)}%` }}
                          ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>Used: {usage}</span>
                          <span>Limit: {limit}</span>
                      </div>
                  </div>
              )}

              {/* Pick Controls */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-6">
                  <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pick from Data 1</label>
                      <div className="flex items-center justify-between bg-white border border-gray-300 rounded-lg p-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                          <input 
                              type="number" 
                              min="0" 
                              max={isAdmin ? data1.length : Math.min(data1.length, remaining)}
                              value={pick1}
                              onChange={e => setPick1(parseInt(e.target.value) || 0)}
                              className="flex-1 outline-none min-w-0 font-medium text-gray-800"
                              placeholder="0"
                              disabled={isQuotaFull && !isAdmin}
                          />
                          <div className="flex items-center space-x-2 pl-2 border-l border-gray-200 ml-2">
                               <span className="flex h-2 w-2 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${data1.length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-600'}`}>
                                  {data1.length} Lines
                              </span>
                          </div>
                      </div>
                  </div>
                  <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pick from Data 2</label>
                      <div className="flex items-center justify-between bg-white border border-gray-300 rounded-lg p-2 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                          <input 
                              type="number" 
                              min="0" 
                              max={isAdmin ? data2.length : Math.min(data2.length, remaining)}
                              value={pick2}
                              onChange={e => setPick2(parseInt(e.target.value) || 0)}
                              className="flex-1 outline-none min-w-0 font-medium text-gray-800"
                              placeholder="0"
                              disabled={isQuotaFull && !isAdmin}
                          />
                           <div className="flex items-center space-x-2 pl-2 border-l border-gray-200 ml-2">
                               <span className="flex h-2 w-2 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${data2.length > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                                  {data2.length} Lines
                              </span>
                          </div>
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
                      className="w-full py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-