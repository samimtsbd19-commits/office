
import { User, UserRole, UserStatus } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'admin-1',
    name: 'Super Admin',
    email: 'admin@nexus.com',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    avatar: 'https://picsum.photos/200/200',
    lastActive: new Date().toISOString(),
    permissions: ['all'],
    logs: [
      { id: 'l1', action: 'System Init', timestamp: new Date().toISOString() }
    ],
    notifications: [],
    dataMeqLimit: 1000000, // Unlimited effectively
    dataMeqUsage: 0
  },
  {
    id: 'user-1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    avatar: 'https://picsum.photos/201/201',
    lastActive: new Date(Date.now() - 3600000).toISOString(),
    permissions: ['edit_profile'],
    logs: [
      { id: 'l2', action: 'Login', timestamp: new Date(Date.now() - 3600000).toISOString() }
    ],
    notifications: [],
    dataMeqLimit: 50,
    dataMeqUsage: 12
  },
  {
    id: 'user-2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: UserRole.USER,
    status: UserStatus.BLOCKED,
    avatar: 'https://picsum.photos/202/202',
    lastActive: new Date(Date.now() - 86400000).toISOString(),
    permissions: ['edit_profile'],
    logs: [
      { id: 'l3', action: 'Failed Login', timestamp: new Date(Date.now() - 4000000).toISOString(), details: 'Wrong password 3 times' }
    ],
    notifications: [
      { id: 'n1', title: 'Account Suspended', message: 'Your account has been blocked due to suspicious activity.', type: 'danger', read: false, timestamp: new Date().toISOString() }
    ],
    dataMeqLimit: 50,
    dataMeqUsage: 48
  },
  {
    id: 'user-3',
    name: 'Charlie Davis',
    email: 'charlie@example.com',
    role: UserRole.MODERATOR,
    status: UserStatus.ACTIVE,
    avatar: 'https://picsum.photos/203/203',
    lastActive: new Date().toISOString(),
    permissions: ['edit_profile', 'view_users'],
    logs: [],
    notifications: [],
    dataMeqLimit: 200,
    dataMeqUsage: 0
  }
];
