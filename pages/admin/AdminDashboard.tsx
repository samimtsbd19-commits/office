import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Users, UserX, Activity, ShieldAlert } from 'lucide-react';
import { UserStatus } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { users } = useStore();

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === UserStatus.ACTIVE).length;
  const blockedUsers = users.filter(u => u.status === UserStatus.BLOCKED).length;
  const suspendedUsers = users.filter(u => u.status === UserStatus.SUSPENDED).length;

  const stats = [
    { label: 'Total Users', value: totalUsers, icon: Users, color: 'bg-blue-500' },
    { label: 'Active Now', value: activeUsers, icon: Activity, color: 'bg-emerald-500' },
    { label: 'Blocked', value: blockedUsers, icon: UserX, color: 'bg-red-500' },
    { label: 'Suspended', value: suspendedUsers, icon: ShieldAlert, color: 'bg-orange-500' },
  ];

  const data = [
    { name: 'Active', count: activeUsers },
    { name: 'Blocked', count: blockedUsers },
    { name: 'Suspended', count: suspendedUsers },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
            <div className={`p-4 rounded-lg ${stat.color} bg-opacity-10 mr-4`}>
              <stat.icon className={`w-8 h-8 ${stat.color.replace('bg-', 'text-')}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">User Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent System Logs</h3>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {users.flatMap(u => u.logs.map(l => ({ ...l, user: u.name, userAvatar: u.avatar })))
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 5)
              .map((log) => (
                <div key={log.id} className="flex items-start pb-4 border-b border-gray-50 last:border-0">
                  <img src={log.userAvatar} alt="" className="w-8 h-8 rounded-full mr-3" />
                  <div>
                    <p className="text-sm text-gray-800"><span className="font-medium">{log.user}</span>: {log.action}</p>
                    <p className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};
