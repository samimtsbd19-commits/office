
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StoreState, User, UserRole, UserStatus, Notification, ChatMessage, DataMeqLog, SystemSettings } from '../types';
import { INITIAL_USERS } from '../constants';

const StoreContext = createContext<StoreState | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load from local storage if available, else initial
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('nexus_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
     const saved = localStorage.getItem('nexus_current_user');
     return saved ? JSON.parse(saved) : null;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('nexus_messages');
    return saved ? JSON.parse(saved) : [];
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
      const saved = localStorage.getItem('nexus_system_settings');
      return saved ? JSON.parse(saved) : { dataMeqLocked: false, maintenanceMode: false };
  });

  // Data Meq State
  const [data1, setData1] = useState<string[]>(() => {
    const saved = localStorage.getItem('nexus_data1');
    return saved ? JSON.parse(saved) : [];
  });

  const [data2, setData2] = useState<string[]>(() => {
    const saved = localStorage.getItem('nexus_data2');
    return saved ? JSON.parse(saved) : [];
  });

  const [dataMeqLogs, setDataMeqLogs] = useState<DataMeqLog[]>(() => {
    const saved = localStorage.getItem('nexus_datameq_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist to local storage
  useEffect(() => { localStorage.setItem('nexus_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('nexus_messages', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem('nexus_data1', JSON.stringify(data1)); }, [data1]);
  useEffect(() => { localStorage.setItem('nexus_data2', JSON.stringify(data2)); }, [data2]);
  useEffect(() => { localStorage.setItem('nexus_datameq_logs', JSON.stringify(dataMeqLogs)); }, [dataMeqLogs]);
  useEffect(() => { localStorage.setItem('nexus_system_settings', JSON.stringify(systemSettings)); }, [systemSettings]);

  useEffect(() => {
    if (currentUser) {
        localStorage.setItem('nexus_current_user', JSON.stringify(currentUser));
        
        const liveUser = users.find(u => u.id === currentUser.id);
        if (!liveUser) {
             logout(); 
        } else if (liveUser.status === UserStatus.BLOCKED || liveUser.status === UserStatus.SUSPENDED) {
            if (currentUser.role !== UserRole.ADMIN) { 
                 alert("Your account has been suspended by an administrator.");
                 logout();
            }
        } else if (JSON.stringify(liveUser) !== JSON.stringify(currentUser)) {
            setCurrentUser(liveUser);
        }
    } else {
        localStorage.removeItem('nexus_current_user');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, currentUser]);

  // Listen for storage events (Cross-tab synchronization) AND Poll for changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'nexus_messages' && e.newValue) setMessages(JSON.parse(e.newValue));
        if (e.key === 'nexus_users' && e.newValue) setUsers(JSON.parse(e.newValue));
        if (e.key === 'nexus_data1' && e.newValue) setData1(JSON.parse(e.newValue));
        if (e.key === 'nexus_data2' && e.newValue) setData2(JSON.parse(e.newValue));
        if (e.key === 'nexus_datameq_logs' && e.newValue) setDataMeqLogs(JSON.parse(e.newValue));
        if (e.key === 'nexus_system_settings' && e.newValue) setSystemSettings(JSON.parse(e.newValue));
    };
    window.addEventListener('storage', handleStorageChange);

    // Polling backup for robust sync (checks every 0.5s)
    const interval = setInterval(() => {
        const d1 = localStorage.getItem('nexus_data1');
        const d2 = localStorage.getItem('nexus_data2');
        const logs = localStorage.getItem('nexus_datameq_logs');
        const settings = localStorage.getItem('nexus_system_settings');
        const usersStored = localStorage.getItem('nexus_users');

        if (d1) {
            const parsed1 = JSON.parse(d1);
            setData1(prev => prev.length !== parsed1.length ? parsed1 : prev);
        }
        if (d2) {
            const parsed2 = JSON.parse(d2);
            setData2(prev => prev.length !== parsed2.length ? parsed2 : prev);
        }
        if (logs) {
             const parsedLogs = JSON.parse(logs);
             setDataMeqLogs(prev => prev.length !== parsedLogs.length ? parsedLogs : prev);
        }
        if (settings) {
            const parsedSettings = JSON.parse(settings);
            setSystemSettings(prev => JSON.stringify(prev) !== JSON.stringify(parsedSettings) ? parsedSettings : prev);
        }
        if (usersStored) {
            const parsedUsers = JSON.parse(usersStored);
            setUsers(prev => JSON.stringify(prev) !== JSON.stringify(parsedUsers) ? parsedUsers : prev);
        }
    }, 500);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
    };
  }, []);

  const login = (email: string) => {
    const user = users.find(u => u.email === email);
    if (user) {
      if (user.status === UserStatus.BLOCKED) {
        alert("This account is blocked.");
        return;
      }
      const updatedUser = { ...user, lastActive: new Date().toISOString() };
      updateUserInternal(updatedUser);
      setCurrentUser(updatedUser);
    } else {
      alert("User not found");
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('nexus_current_user');
  };

  const updateUserInternal = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const addUser = (userData: Omit<User, 'id' | 'logs' | 'notifications' | 'lastActive' | 'dataMeqLimit' | 'dataMeqUsage'>) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      lastActive: 'Never',
      logs: [{ id: `log-${Date.now()}`, action: 'Account Created', timestamp: new Date().toISOString() }],
      notifications: [],
      dataMeqLimit: 100, // Default limit
      dataMeqUsage: 0
    };
    setUsers(prev => [...prev, newUser]);
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const updateUserStatus = (id: string, status: UserStatus) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const actionLog = {
            id: `log-${Date.now()}`,
            action: `Status changed to ${status}`,
            timestamp: new Date().toISOString()
        };
        return { ...u, status, logs: [actionLog, ...u.logs] };
      }
      return u;
    }));
  };

  const sendNotification = (userId: string, notificationData: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newNotif: Notification = {
          ...notificationData,
          id: `notif-${Date.now()}`,
          read: false,
          timestamp: new Date().toISOString()
        };
        return { ...u, notifications: [newNotif, ...u.notifications] };
      }
      return u;
    }));
  };

  const clearNotifications = () => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, notifications: [] };
    updateUserInternal(updatedUser);
    setCurrentUser(updatedUser);
  };

  const addMessage = (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
  };

  const sendMessage = (text: string) => {
    if (!currentUser) return;
    const msg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      senderRole: currentUser.role,
      text,
      timestamp: new Date().toISOString(),
      isAdmin: currentUser.role === UserRole.ADMIN
    };
    addMessage(msg);
  };

  const updateSystemSettings = (newSettings: Partial<SystemSettings>) => {
      setSystemSettings(prev => {
          const updated = { ...prev, ...newSettings };
          localStorage.setItem('nexus_system_settings', JSON.stringify(updated));
          return updated;
      });
  };

  // --- Data Meq Functions ---

  const addDataMeq = (type: 'data1' | 'data2', content: string) => {
      const key = type === 'data1' ? 'nexus_data1' : 'nexus_data2';
      const currentData = JSON.parse(localStorage.getItem(key) || '[]');
      
      const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const updatedData = [...currentData, ...lines];
      
      localStorage.setItem(key, JSON.stringify(updatedData));
      
      if (type === 'data1') setData1(updatedData);
      else setData2(updatedData);
  };

  const clearDataMeq = (type: 'data1' | 'data2') => {
      const key = type === 'data1' ? 'nexus_data1' : 'nexus_data2';
      localStorage.setItem(key, JSON.stringify([]));
      if (type === 'data1') setData1([]);
      else setData2([]);
  };

  const updateUserLimit = (userId: string, limit: number) => {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, dataMeqLimit: limit } : u));
  };

  const resetUserUsage = (userId: string) => {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, dataMeqUsage: 0 } : u));
  };

  const generateEmails = (count1: number, count2: number, inserts: {pos: number, text: string}[]) => {
      if (!currentUser) return '';
      
      // Check system lock
      const currentSettings = JSON.parse(localStorage.getItem('nexus_system_settings') || '{}');
      if (currentSettings.dataMeqLocked && currentUser.role !== UserRole.ADMIN) {
          alert("System is currently locked by Administrator.");
          return '';
      }

      // Check User Limit for non-admins
      if (currentUser.role !== UserRole.ADMIN) {
          const totalRequested = count1 + count2;
          const remainingLimit = currentUser.dataMeqLimit - currentUser.dataMeqUsage;
          if (totalRequested > remainingLimit) {
              alert(`Quota Exceeded! You can only generate ${remainingLimit} more lines.`);
              return '';
          }
      }

      // Critical: Read directly from storage to prevent consuming stale state
      const currentData1 = JSON.parse(localStorage.getItem('nexus_data1') || '[]');
      const currentData2 = JSON.parse(localStorage.getItem('nexus_data2') || '[]');

      // Concurrency Check
      if (currentData1.length < count1 || currentData2.length < count2) {
          setData1(currentData1);
          setData2(currentData2);
          alert("Synchronization Error: Data was consumed by another user. Display updated.");
          return '';
      }
      
      const picks1 = currentData1.slice(0, count1);
      const picks2 = currentData2.slice(0, count2);
      
      const remaining1 = currentData1.slice(count1);
      const remaining2 = currentData2.slice(count2);

      localStorage.setItem('nexus_data1', JSON.stringify(remaining1));
      localStorage.setItem('nexus_data2', JSON.stringify(remaining2));
      
      setData1(remaining1);
      setData2(remaining2);

      const combined = [...picks1, ...picks2];

      const insertMap: Record<number, string[]> = {};
      inserts.forEach(ins => {
          if (ins.text && ins.pos > 0) {
              if (!insertMap[ins.pos]) insertMap[ins.pos] = [];
              insertMap[ins.pos].push(ins.text);
          }
      });

      let final: string[] = [];
      if (insertMap[1]) final.push(...insertMap[1]);

      combined.forEach((orig, index) => {
          const i = index + 1; 
          final.push(orig);
          
          if (insertMap[i + 1]) {
              final.push(...insertMap[i + 1]);
          }
      });
      
      if (insertMap[combined.length + 1]) {
          final.push(...insertMap[combined.length + 1]);
      }

      const resultText = final.join('\n');
      const totalGenerated = final.length;
      const consumedCount = picks1.length + picks2.length;

      // Update User Usage
      if (currentUser.role !== UserRole.ADMIN) {
           const updatedUsage = currentUser.dataMeqUsage + consumedCount;
           const updatedUser = { ...currentUser, dataMeqUsage: updatedUsage };
           updateUserInternal(updatedUser);
           setCurrentUser(updatedUser);
      }

      const log: DataMeqLog = {
          id: `meq-${Date.now()}-${Math.random()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          count1: picks1.length,
          count2: picks2.length,
          totalGenerated: totalGenerated,
          timestamp: new Date().toISOString()
      };
      
      const currentLogs = JSON.parse(localStorage.getItem('nexus_datameq_logs') || '[]');
      const newLogs = [log, ...currentLogs].slice(0, 100); // Keep last 100 logs
      localStorage.setItem('nexus_datameq_logs', JSON.stringify(newLogs));
      setDataMeqLogs(newLogs);

      return resultText;
  };

  return (
    <StoreContext.Provider value={{
      currentUser,
      users,
      messages,
      systemSettings,
      data1,
      data2,
      dataMeqLogs,
      login,
      logout,
      addUser,
      deleteUser,
      updateUserStatus,
      sendNotification,
      sendMessage,
      addMessage,
      clearNotifications,
      updateSystemSettings,
      addDataMeq,
      clearDataMeq,
      generateEmails,
      updateUserLimit,
      resetUserUsage
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
