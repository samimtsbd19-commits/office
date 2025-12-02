
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Bell, User, Send, Bot, Users, Activity } from 'lucide-react';
import { getAIChatResponse } from '../../services/geminiService';
import { UserRole } from '../../types';

export const UserDashboard: React.FC = () => {
  const { currentUser, messages, sendMessage, addMessage, clearNotifications } = useStore();
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    sendMessage(userText); 
    setChatInput('');

    // Trigger AI response if specifically asked or for first engagement
    if (userText.toLowerCase().includes('@ai') || messages.length < 2) {
        setIsTyping(true);
        const history = messages.slice(-5).map(m => `${m.senderName}: ${m.text}`).join('\n');
        
        try {
            const aiResponseText = await getAIChatResponse(history, userText);
            
            setTimeout(() => {
                addMessage({
                    id: `ai-${Date.now()}`,
                    senderId: 'system-ai',
                    senderName: 'NexusBot',
                    senderAvatar: 'https://ui-avatars.com/api/?name=Nexus+Bot&background=6366f1&color=fff',
                    senderRole: UserRole.MODERATOR,
                    text: aiResponseText,
                    timestamp: new Date().toISOString(),
                    isAdmin: false
                });
                setIsTyping(false);
            }, 1000);
        } catch (e) {
            setIsTyping(false);
        }
    }
  };

  if (!currentUser) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Notifications & Profile Panel */}
      <div className="lg:col-span-1 space-y-6 overflow-y-auto custom-scrollbar">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-bold flex items-center text-gray-800">
               <Bell className="w-5 h-5 mr-2 text-blue-500" /> Notifications
             </h3>
             {currentUser.notifications.length > 0 && (
               <button onClick={clearNotifications} className="text-xs text-blue-600 hover:underline">Clear all</button>
             )}
          </div>
          
          <div className="space-y-3">
            {currentUser.notifications.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No new notifications</p>
            ) : (
              currentUser.notifications.map(notif => (
                <div key={notif.id} className={`p-4 rounded-lg border-l-4 ${
                  notif.type === 'warning' ? 'bg-orange-50 border-orange-500' : 
                  notif.type === 'danger' ? 'bg-red-50 border-red-500' : 'bg-blue-50 border-blue-500'
                }`}>
                  <h4 className={`text-sm font-bold ${
                     notif.type === 'warning' ? 'text-orange-700' : 
                     notif.type === 'danger' ? 'text-red-700' : 'text-blue-700'
                  }`}>{notif.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(notif.timestamp).toLocaleTimeString()}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
           <h3 className="text-lg font-bold flex items-center text-gray-800 mb-4">
               <User className="w-5 h-5 mr-2 text-emerald-500" /> My Profile
           </h3>
           <div className="flex items-center space-x-4 mb-6">
               <img src={currentUser.avatar} alt="Profile" className="w-16 h-16 rounded-full border-4 border-emerald-50" />
               <div>
                   <h4 className="font-bold text-gray-900">{currentUser.name}</h4>
                   <p className="text-sm text-gray-500">{currentUser.email}</p>
               </div>
           </div>
           
           <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                 <span className="text-sm text-gray-600">Account Status</span>
                 <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                   currentUser.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                 }`}>{currentUser.status}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                 <span className="text-sm text-gray-600">Role</span>
                 <span className="text-sm font-medium text-gray-800 uppercase">{currentUser.role}</span>
              </div>
           </div>

           <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Data Consumption</h4>
           <div className="grid grid-cols-2 gap-3">
               <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                   <div className="text-xs text-blue-600 mb-1">Data 1</div>
                   <div className="text-lg font-bold text-blue-900">{currentUser.data1Usage || 0}</div>
                   <div className="text-[10px] text-blue-400">lines</div>
               </div>
               <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                   <div className="text-xs text-emerald-600 mb-1">Data 2</div>
                   <div className="text-lg font-bold text-emerald-900">{currentUser.data2Usage || 0}</div>
                   <div className="text-[10px] text-emerald-400">lines</div>
               </div>
               <div className="col-span-2 bg-gray-50 p-3 rounded-lg border border-gray-200 flex justify-between items-center">
                   <div>
                       <div className="text-xs text-gray-500">Total Usage</div>
                       <div className="text-sm font-bold text-gray-800">{currentUser.dataMeqUsage} lines</div>
                   </div>
                   <Activity className="w-4 h-4 text-gray-400" />
               </div>
           </div>
        </div>
      </div>

      {/* Community Chat */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden h-full">
        <div className="p-4 border-b border-gray-100 bg-white flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center space-x-3">
             <div className="bg-blue-100 p-2 rounded-lg">
                 <Users className="w-5 h-5 text-blue-600" />
             </div>
             <div>
                <h3 className="font-bold text-gray-800">Community Hub</h3>
                <p className="text-xs text-gray-500">Real-time collaboration</p>
             </div>
          </div>
          <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-emerald-600 font-medium">Live Connected</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 scroll-smooth" ref={scrollRef}>
          {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Bot className="w-12 h-12 mb-2 opacity-20" />
                  <p>No messages yet. Start the conversation!</p>
              </div>
          )}
          {messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            const isSystem = msg.senderId === 'system-ai';
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end space-x-2`}>
                {!isMe && (
                    <img 
                        src={msg.senderAvatar || `https://ui-avatars.com/api/?name=${msg.senderName}`} 
                        alt={msg.senderName} 
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm mb-1" 
                    />
                )}
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  <div className="flex items-center space-x-2 mb-1">
                      {!isMe && <span className="text-xs font-bold text-gray-600">{msg.senderName}</span>}
                      {isSystem && <Bot className="w-3 h-3 text-indigo-500" />}
                  </div>
                  <div className={`px-4 py-2.5 shadow-sm text-sm leading-relaxed ${
                    isMe 
                        ? 'bg-blue-600 text-white rounded-2xl rounded-br-none' 
                        : isSystem
                        ? 'bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-2xl rounded-bl-none'
                        : msg.isAdmin 
                        ? 'bg-purple-600 text-white rounded-2xl rounded-bl-none'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            );
          })}
          {isTyping && (
             <div className="flex justify-start items-end space-x-2">
                 <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mb-1">
                     <Bot className="w-4 h-4 text-indigo-500" />
                 </div>
                 <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
                     <div className="flex space-x-1">
                         <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                         <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-75"></div>
                         <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-150"></div>
                     </div>
                 </div>
             </div>
          )}
        </div>

        <form onSubmit={handleSendChat} className="p-4 bg-white border-t border-gray-100">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message... (Tip: @ai to ask bot)"
              className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            <button 
              type="submit" 
              disabled={!chatInput.trim()}
              className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
