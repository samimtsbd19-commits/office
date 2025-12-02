
import { User, UserRole, UserStatus } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'admin-1',
    name: 'System Administrator',
    email: 'admin@nexus.com',
    password: 'admin123', // Default password for initial setup
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff',
    lastActive: new Date().toISOString(),
    permissions: ['all'],
    logs: [
      { id: 'l1', action: 'System Install', timestamp: new Date().toISOString() }
    ],
    notifications: [],
    dataMeqLimit: -1, 
    dataMeqUsage: 0,
    data1Usage: 0,
    data2Usage: 0,
    maxPickPerRequest: 1000
  }
];
