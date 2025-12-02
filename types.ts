
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator'
}

export enum UserStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  SUSPENDED = 'suspended'
}

export interface Log {
  id: string;
  action: string;
  timestamp: string;
  details?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  read: boolean;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Added for auth
  role: UserRole;
  status: UserStatus;
  avatar: string;
  lastActive: string;
  logs: Log[];
  notifications: Notification[];
  permissions: string[]; 
  dataMeqLimit: number; 
  dataMeqUsage: number; 
  data1Usage: number; // New: Specific usage for Data 1
  data2Usage: number; // New: Specific usage for Data 2
  maxPickPerRequest: number; 
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRole?: UserRole;
  text: string;
  timestamp: string;
  isAdmin: boolean;
}

export interface DataMeqLog {
  id: string;
  userId: string;
  userName: string;
  count1: number;
  count2: number;
  totalGenerated: number;
  timestamp: string;
}

export interface SystemSettings {
  dataMeqLocked: boolean;
  maintenanceMode: boolean;
  allowUserUploads: boolean;
}

export interface StoreState {
  currentUser: User | null;
  users: User[];
  messages: ChatMessage[];
  systemSettings: SystemSettings;
  
  // Data Meq State
  data1: string[];
  data2: string[];
  dataMeqLogs: DataMeqLog[];
  
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'logs' | 'notifications' | 'lastActive' | 'dataMeqLimit' | 'dataMeqUsage' | 'maxPickPerRequest' | 'data1Usage' | 'data2Usage'>) => void;
  updateUserStatus: (id: string, status: UserStatus) => void;
  sendNotification: (userId: string, notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
  sendMessage: (text: string) => void;
  addMessage: (msg: ChatMessage) => void;
  clearNotifications: () => void;
  deleteUser: (id: string) => void;
  
  // System Actions
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  
  // Data Meq Actions
  addDataMeq: (type: 'data1' | 'data2', content: string) => void;
  clearDataMeq: (type: 'data1' | 'data2') => void;
  generateEmails: (count1: number, count2: number, inserts: {pos: number, text: string}[]) => string;
  updateUserLimit: (userId: string, limit: number, maxPerRequest: number) => void;
  resetUserUsage: (userId: string) => void;
}
