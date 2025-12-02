
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { User, UserRole, UserStatus } from '../../types';
import { MoreVertical, Shield, Ban, AlertTriangle, CheckCircle, Trash2, Search, BrainCircuit, Database, RotateCcw } from 'lucide-react';
import { generateWarningMessage, analyzeUserActivity } from '../../services/geminiService';

export const UserManagement: React.FC = () => {
  const { users, updateUserStatus, deleteUser, sendNotification, addUser, updateUserLimit, resetUserUsage } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiAction, setAiAction] = useState<'warn' | 'analyze'>('analyze');
  const [aiOutput, setAiOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [warningReason, setWarningReason] = useState('');
  
  // Data Limit Modal State
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [newLimit, setNewLimit] = useState(0);

  // New user form state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: UserRole.USER });

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAIAction = async () => {
    if (!selectedUser) return;
    setLoading(true);
    setAiOutput('');

    if (aiAction === 'warn') {
      const msg = await generateWarningMessage(selectedUser, warningReason);
      setAiOutput(msg);
    } else {
      const analysis = await analyzeUserActivity(selectedUser);
      setAiOutput(analysis);
    }
    setLoading(false);
  };

  const confirmWarning = () => {
    if (selectedUser && aiOutput) {
      sendNotification(selectedUser.id, {
        title: 'Admin Warning',
        message: aiOutput,
        type: 'warning'
      });
      setIsAIModalOpen(false);
      setAiOutput('');
      setWarningReason('');
      alert('Warning sent successfully!');
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({
        ...newUser,
        status: UserStatus.ACTIVE,
        avatar: `https://ui-avatars.com/api/?name=${newUser.name}&background=random`,
        permissions: []
    });
    setIsAddUserOpen(false);
    setNewUser({ name: '', email: '', role: UserRole.USER });
  };

  const openLimitModal = (user: User) => {
      setSelectedUser(user);
      setNewLimit(user.dataMeqLimit);
      setIsLimitModalOpen(true);
  };

  const saveLimit = () => {
      if (selectedUser) {
          updateUserLimit(selectedUser.id, newLimit);
          setIsLimitModalOpen(false);
      }
  };

  const handleResetUsage = () => {
      if (selectedUser) {
          resetUserUsage(selectedUser.id);
          alert('Usage reset to 0');
          // Keep modal open to show updated stats? No, close it for better UX flow or update local state?
          // Since users list updates automatically, we just close.
          setIsLimitModalOpen(false);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
            onClick={() => setIsAddUserOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          + Add New User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-semibold text-gray-600 text-sm">User</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Role</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Data Limit</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map(user => {
                 const usagePercent = user.dataMeqLimit > 0 ? (user.dataMeqUsage / user.dataMeqLimit) * 100 : 0;
                 return (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center">
                      <img src={user.avatar} alt="" className="w-10 h-10 rounded-full mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase
                      ${user.role === UserRole.ADMIN ? 'bg-indigo-100 text-indigo-700' : 
                        user.role === UserRole.MODERATOR ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`flex items-center text-sm font-medium
                      ${user.status === UserStatus.ACTIVE ? 'text-emerald-600' : 'text-red-600'}`}>
                      {user.status === UserStatus.ACTIVE ? <CheckCircle className="w-4 h-4 mr-1" /> : <Ban className="w-4 h-4 mr-1" />}
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4">
                     <div className="flex items-center space-x-2">
                        <div className="flex-1 w-24 bg-gray-200 rounded-full h-2">
                           <div 
                              className={`h-2 rounded-full ${usagePercent > 90 ? 'bg-red-500' : 'bg-blue-500'}`} 
                              style={{ width: `${Math.min(usagePercent, 100)}%` }}
                           ></div>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">{user.dataMeqUsage} / {user.dataMeqLimit}</span>
                     </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Limit Control */}
                      <button 
                         onClick={() => openLimitModal(user)}
                         className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                         title="Set Data Limit"
                      >
                         <Database className="w-5 h-5" />
                      </button>

                      {/* AI Actions */}
                      <button 
                        onClick={() => { setSelectedUser(user); setAiAction('analyze'); setIsAIModalOpen(true); setAiOutput(''); }}
                        className="p-1.5 text-purple-600 hover:bg-purple-50 rounded" 
                        title="AI Analysis"
                      >
                        <BrainCircuit className="w-5 h-5" />
                      </button>
                      
                      {/* Warning */}
                      <button 
                         onClick={() => { setSelectedUser(user); setAiAction('warn'); setIsAIModalOpen(true); setAiOutput(''); }}
                         className="p-1.5 text-orange-500 hover:bg-orange-50 rounded"
                         title="Send Warning"
                      >
                        <AlertTriangle className="w-5 h-5" />
                      </button>

                      {/* Status Toggle */}
                      {user.status === UserStatus.ACTIVE ? (
                        <button 
                          onClick={() => updateUserStatus(user.id, UserStatus.BLOCKED)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                          title="Block User"
                        >
                          <Ban className="w-5 h-5" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => updateUserStatus(user.id, UserStatus.ACTIVE)}
                          className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded"
                          title="Unblock User"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}

                      {/* Delete */}
                       <button 
                          onClick={() => { if(window.confirm('Delete user?')) deleteUser(user.id); }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete User"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                  </td>
                </tr>
              )}})}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Modal */}
      {isAIModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <BrainCircuit className="w-6 h-6 mr-2 text-purple-600" />
              {aiAction === 'analyze' ? `Analyze ${selectedUser.name}` : `Warn ${selectedUser.name}`}
            </h3>
            
            {aiAction === 'warn' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Warning</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  value={warningReason}
                  onChange={(e) => setWarningReason(e.target.value)}
                  placeholder="e.g. Spamming in chat"
                />
              </div>
            )}

            {!aiOutput && (
               <button 
                  onClick={handleAIAction}
                  disabled={loading || (aiAction === 'warn' && !warningReason)}
                  className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 mb-4"
               >
                 {loading ? 'Processing...' : 'Generate with Gemini AI'}
               </button>
            )}

            {aiOutput && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{aiOutput}</p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button onClick={() => setIsAIModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Close</button>
              {aiAction === 'warn' && aiOutput && (
                <button onClick={confirmWarning} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">Send Warning</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Data Limit Modal */}
      {isLimitModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
               <h3 className="text-xl font-bold mb-1">Set Data Limit</h3>
               <p className="text-sm text-gray-500 mb-4">For user: {selectedUser.name}</p>

               <div className="bg-blue-50 p-3 rounded-lg mb-4 flex justify-between items-center">
                   <div>
                       <div className="text-xs text-blue-800 font-semibold uppercase">Current Usage</div>
                       <div className="text-lg font-bold text-blue-900">{selectedUser.dataMeqUsage} lines</div>
                   </div>
                   <button onClick={handleResetUsage} className="text-blue-600 hover:bg-blue-100 p-2 rounded-full" title="Reset Usage to 0">
                       <RotateCcw className="w-5 h-5" />
                   </button>
               </div>
               
               <div className="mb-6">
                   <label className="block text-sm font-medium text-gray-700 mb-2">Max Lines Allowed</label>
                   <input 
                       type="number"
                       className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                       value={newLimit}
                       onChange={(e) => setNewLimit(parseInt(e.target.value) || 0)}
                   />
               </div>

               <div className="flex justify-end gap-2">
                   <button onClick={() => setIsLimitModalOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                   <button onClick={saveLimit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Limit</button>
               </div>
            </div>
          </div>
      )}

      {/* Add User Modal */}
      {isAddUserOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-xl font-bold mb-4">Add New User</h3>
              <form onSubmit={handleAddUser} className="space-y-4">
                 <div>
                   <label className="block text-sm text-gray-700 mb-1">Name</label>
                   <input required type="text" className="w-full border p-2 rounded" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                 </div>
                 <div>
                   <label className="block text-sm text-gray-700 mb-1">Email</label>
                   <input required type="email" className="w-full border p-2 rounded" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                 </div>
                 <div>
                   <label className="block text-sm text-gray-700 mb-1">Role</label>
                   <select className="w-full border p-2 rounded" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}>
                     <option value={UserRole.USER}>User</option>
                     <option value={UserRole.MODERATOR}>Moderator</option>
                     <option value={UserRole.ADMIN}>Admin</option>
                   </select>
                 </div>
                 <div className="flex justify-end pt-4">
                   <button type="button" onClick={() => setIsAddUserOpen(false)} className="px-4 py-2 text-gray-500 mr-2">Cancel</button>
                   <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create User</button>
                 </div>
              </form>
            </div>
         </div>
      )}
    </div>
  );
};
