import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Send, User as UserIcon, Shield, Trash2, CheckCircle } from 'lucide-react';

export const AdminChat: React.FC = () => {
  const { currentUser, messages, sendMessage, addMessage } = useStore();
  const [chatInput, setChatInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage(chatInput);
    setChatInput('');
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
           <h3 className="font-bold text-gray-800 flex items-center">
             <Shield className="w-5 h-5 mr-2 text-indigo-600" /> Admin Global Chat View
           </h3>
           <div className="text-xs text-gray-500">
              Monitoring {messages.length} messages
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white" ref={scrollRef}>
          {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <p>No messages in the system.</p>
              </div>
          )}
          {messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[60%]`}>
                  <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-bold text-gray-600">{msg.senderName}</span>
                      {msg.isAdmin && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1 rounded">ADMIN</span>}
                      <span className="text-[10px] text-gray-400">{new Date(msg.timestamp).toLocaleString()}</span>
                  </div>
                  <div className={`px-4 py-2 rounded-lg text-sm ${
                    isMe ? 'bg-indigo-600 text-white' : 
                    msg.isAdmin ? 'bg-indigo-50 border border-indigo-100 text-indigo-900' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSendChat} className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex gap-2">
                <input 
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Reply as Administrator..."
                    className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </form>
    </div>
  );
};