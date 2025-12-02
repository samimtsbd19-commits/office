
import { User, ChatMessage, DataMeqLog, SystemSettings } from '../types';
import { INITIAL_USERS } from '../constants';

// Simulated SQL Table definitions (LocalStorage Keys)
const TABLES = {
  USERS: 'nexus_sqlite_users',
  MESSAGES: 'nexus_sqlite_messages',
  SETTINGS: 'nexus_sqlite_settings',
  DATA1: 'nexus_sqlite_data1',
  DATA2: 'nexus_sqlite_data2',
  LOGS: 'nexus_sqlite_logs'
};

class LocalSQLDB {
  private connected: boolean = false;

  async connect(): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate fast SQLite connection
      setTimeout(() => {
        this.connected = true;
        this.initializeDefaults();
        resolve(true);
      }, 800); 
    });
  }

  private initializeDefaults() {
    // If "disk" is empty, initialize with default schema/data
    if (!localStorage.getItem(TABLES.USERS)) {
      localStorage.setItem(TABLES.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(TABLES.SETTINGS)) {
      localStorage.setItem(TABLES.SETTINGS, JSON.stringify({ 
        dataMeqLocked: false, 
        maintenanceMode: false, 
        allowUserUploads: false 
      }));
    }
  }

  // --- Generic Query Helpers ---

  private select<T>(table: string): T {
    const data = localStorage.getItem(table);
    return data ? JSON.parse(data) : (table.includes('data') ? [] : null);
  }

  private update(table: string, data: any) {
    localStorage.setItem(table, JSON.stringify(data));
  }

  // --- Public Methods ---

  authenticate(email: string, password?: string): User | null {
    const users = this.getUsers();
    // Simple query: SELECT * FROM users WHERE email = ? AND password = ?
    // In production, passwords should be hashed. For this local install, we store as is or assume hash.
    const user = users.find(u => u.email === email);
    if (!user) return null;
    
    // If user has no password set (old data), allow or fail? 
    // We assume all users must have password now.
    if (user.password === password) {
        return user;
    }
    return null;
  }

  getUsers(): User[] {
    return this.select<User[]>(TABLES.USERS) || [];
  }

  saveUsers(users: User[]) {
    this.update(TABLES.USERS, users);
  }

  getMessages(): ChatMessage[] {
    return this.select<ChatMessage[]>(TABLES.MESSAGES) || [];
  }

  saveMessages(msgs: ChatMessage[]) {
    this.update(TABLES.MESSAGES, msgs);
  }

  getSettings(): SystemSettings {
    return this.select<SystemSettings>(TABLES.SETTINGS) || { 
      dataMeqLocked: false, 
      maintenanceMode: false, 
      allowUserUploads: false 
    };
  }

  saveSettings(settings: SystemSettings) {
    this.update(TABLES.SETTINGS, settings);
  }

  getData(type: 'data1' | 'data2'): string[] {
    return this.select<string[]>(type === 'data1' ? TABLES.DATA1 : TABLES.DATA2) || [];
  }

  saveData(type: 'data1' | 'data2', data: string[]) {
    this.update(type === 'data1' ? TABLES.DATA1 : TABLES.DATA2, data);
  }

  getLogs(): DataMeqLog[] {
    return this.select<DataMeqLog[]>(TABLES.LOGS) || [];
  }

  saveLogs(logs: DataMeqLog[]) {
    this.update(TABLES.LOGS, logs);
  }

  isConnected() {
    return this.connected;
  }
}

export const db = new LocalSQLDB();
