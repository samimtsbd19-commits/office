
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StoreState, User, UserRole, UserStatus, Notification, ChatMessage, DataMeqLog, SystemSettings } from '../types';
import { db } from '../services/db';

interface StoreContextType extends StoreState {
  isDbConnected: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDbConnected, setIsDbConnected] = useState(false);

  // Initialize State
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({ 
    dataMeqLocked: false, 
    maintenanceMode: false, 
    allowUserUploads: false 
  });
  const [data1, setData1] = useState<string[]>([]);
  const [data2, setData2] = useState<string[]>([]);
  const [dataMeqLogs, setDataMeqLogs] = useState<DataMeqLog[]>([]);

  // Initial DB Connection
  useEffect(() => {
    const initDb = async () => {
      await db.connect();
      setIsDbConnected(true);
      
      // Load initial data
      setUsers(db.getUsers());
      setMessages(db.getMessages());
      setSystemSettings(db.getSettings());
      setData1(db.getData('data1'));
      setData2(db.getData('data2'));
      setDataMeqLogs(db.getLogs());

      // Load session
      const savedUser = localStorage.getItem('nexus_sqlite_current_user');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
    };

    initDb();
  }, []);

  // Persist changes to DB whenever state changes
  useEffect(() => { if(isDbConnected) db.saveUsers(users); }, [users, isDbConnected]);
  useEffect(() => { if(isDbConnected) db.saveMessages(messages); }, [messages, isDbConnected]);
  useEffect(() => { if(isDbConnected) db.saveSettings(systemSettings); }, [systemSettings, isDbConnected]);
  useEffect(() => { if(isDbConnected) db.saveData('data1', data1); }, [data1, isDbConnected]);
  useEffect(() => { if(isDbConnected) db.saveData('data2', data2); }, [data2, isDbConnected]);
  useEffect(() => { if(isDbConnected) db.saveLogs(dataMeqLogs); }, [dataMeqLogs, isDbConnected]);

  // Sync Current User Session
  useEffect(() => {
    if (currentUser) {
        localStorage.setItem('nexus_sqlite_current_user', JSON.stringify(currentUser));
        const liveUser = users.find(u => u.id === currentUser.id);
        
        if (liveUser) {
           if (JSON.stringify(liveUser) !== JSON.stringify(currentUser)) {
               setCurrentUser(liveUser);
           }
           if (liveUser.status === UserStatus.BLOCKED || liveUser.status === UserStatus.SUSPENDED) {
             if (currentUser.role !== UserRole.ADMIN) {
               alert("Security Alert: Access Revoked.");
               logout();
             }
           }
        }
    } else {
        localStorage.removeItem('nexus_sqlite_current_user');
    }
  }, [users, currentUser]);

  // Real-time Polling
  useEffect(() => {
    if (!isDbConnected) return;

    const interval = setInterval(() => {
      const dbUsers = db.getUsers();
      if (JSON.stringify(dbUsers) !== JSON.stringify(users)) setUsers(dbUsers);

      const dbMsgs = db.getMessages();
      if (JSON.stringify(dbMsgs) !== JSON.stringify(messages)) setMessages(dbMsgs);

      const dbData1 = db.getData('data1');
      if (dbData1.length !== data1.length) setData1(dbData1);

      const dbData2 = db.getData('data2');
      if (dbData2.length !== data2.length) setData2(dbData2);
      
      const dbLogs = db.getLogs();
      if (dbLogs.length !== dataMeqLogs.length) setDataMeqLogs(dbLogs);

      const dbSettings = db.getSettings();
      if (JSON.stringify(dbSettings) !== JSON.stringify(systemSettings)) setSystemSettings(dbSettings);

    }, 500);

    return () => clearInterval(interval);
  }, [isDbConnected, users, messages, data1, data2, dataMeqLogs, systemSettings]);


  // --- Actions ---

  const login = async (email: string, password?: string): Promise<boolean> => {
    const user = db.authenticate(email, password);
    
    if (user) {
      if (user.status === UserStatus.BLOCKED) {
        alert("Access Denied: Account Blocked");
        return false;
      }
      const updatedUser = { ...user, lastActive: new Date().toISOString() };
      // Update local state immediately
      setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
      setCurrentUser(updatedUser);
      return true;
    } else {
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('nexus_sqlite_current_user');
  };

  const addUser = (userData: Omit<User, 'id' | 'logs' | 'notifications' | 'lastActive' | 'dataMeqLimit' | 'dataMeqUsage' | 'maxPickPerRequest' | 'data1Usage' | 'data2Usage'>) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      // Default password for new users
      password: 'user123', 
      lastActive: 'Never',
      logs: [{ id: `log-${Date.now()}`, action: 'Account Created', timestamp: new Date().toISOString() }],
      notifications: [],
      dataMeqLimit: 100,
      dataMeqUsage: 0,
      data1Usage: 0,
      data2Usage: 0,
      maxPickPerRequest: 50
    };
    setUsers(prev => [...prev, newUser]);
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const updateUserStatus = (id: string, status: UserStatus) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
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
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, notifications: [] } : u));
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
      setSystemSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addDataMeq = (type: 'data1' | 'data2', content: string) => {
      const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (type === 'data1') setData1(prev => [...prev, ...lines]);
      else setData2(prev => [...prev, ...lines]);
  };

  const clearDataMeq = (type: 'data1' | 'data2') => {
      if (type === 'data1') setData1([]);
      else setData2([]);
  };

  const updateUserLimit = (userId: string, limit: number, maxPerRequest: number) => {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, dataMeqLimit: limit, maxPickPerRequest: maxPerRequest } : u));
  };

  const resetUserUsage = (userId: string) => {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, dataMeqUsage: 0, data1Usage: 0, data2Usage: 0 } : u));
  };

  const generateEmails = (count1: number, count2: number, inserts: {pos: number, text: string}[]) => {
      if (!currentUser) return '';
      
      if (systemSettings.dataMeqLocked && currentUser.role !== UserRole.ADMIN) {
          alert("System Locked by Admin");
          return '';
      }

      if (currentUser.role !== UserRole.ADMIN) {
        const maxPerReq = currentUser.maxPickPerRequest || 50;
        if ((count1 + count2) > maxPerReq) {
            alert(`Limit Exceeded: Max ${maxPerReq} per request.`);
            return '';
        }
        if (currentUser.dataMeqLimit !== -1) {
          const remaining = currentUser.dataMeqLimit - currentUser.dataMeqUsage;
          if ((count1 + count2) > remaining) {
              alert(`Quota Exceeded: Only ${remaining} left today.`);
              return '';
          }
        }
      }

      const currentData1 = db.getData('data1');
      const currentData2 = db.getData('data2');

      if (currentData1.length < count1 || currentData2.length < count2) {
          setData1(currentData1); 
          setData2(currentData2);
          alert("Sync Error: Data updated by another user.");
          return '';
      }
      
      const picks1 = currentData1.slice(0, count1);
      const picks2 = currentData2.slice(0, count2);
      
      const remaining1 = currentData1.slice(count1);
      const remaining2 = currentData2.slice(count2);

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
          if (insertMap[i + 1]) final.push(...insertMap[i + 1]);
      });
      
      if (insertMap[combined.length + 1]) final.push(...insertMap[combined.length + 1]);

      const resultText = final.join('\n');
      const totalGenerated = final.length;

      if (currentUser.role !== UserRole.ADMIN) {
           const updatedUser = { 
               ...currentUser, 
               dataMeqUsage: currentUser.dataMeqUsage + (picks1.length + picks2.length),
               data1Usage: (currentUser.data1Usage || 0) + picks1.length,
               data2Usage: (currentUser.data2Usage || 0) + picks2.length
           };
           setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
           setCurrentUser(updatedUser);
      }

      const log: DataMeqLog = {
          id: `meq-${Date.now()}-${Math.random()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          count1: picks1.length,
          count2: picks2.length,
          totalGenerated,
          timestamp: new Date().toISOString()
      };
      
      const currentLogs = db.getLogs();
      const newLogs = [log, ...currentLogs].slice(0, 100);
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
      isDbConnected,
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
