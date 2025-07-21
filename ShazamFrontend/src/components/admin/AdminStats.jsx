import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const stats = {
  totalUsers: 123,
  totalSongs: 487,
  lastSong: 'Karan Aujla',
};

const data = [
  { day: 'Mon', tickets: 20 },
  { day: 'Tue', tickets: 35 },
  { day: 'Wed', tickets: 25 },
  { day: 'Thu', tickets: 50 },
  { day: 'Fri', tickets: 40 },
  { day: 'Sat', tickets: 65 },
  { day: 'Sun', tickets: 70 },
];

const AdminStats = () => (
  <div className="max-w-4xl mx-auto bg-zinc-900/80 rounded-xl shadow-xl p-8 mt-4 animate-fade-in">
    <h2 className="font-['Inter'] text-2xl font-bold text-white mb-6 flex items-center gap-2 tracking-tight">
      <i className="ri-bar-chart-2-line text-violet-400 text-3xl"></i> Analytics Dashboard
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <motion.div whileHover={{ scale: 1.03 }} className="bg-zinc-800 rounded-lg p-6 flex flex-col items-center">
        <span className="font-['Inter'] text-3xl font-bold text-violet-400">{stats.totalUsers}</span>
        <span className="font-['Inter'] text-zinc-300 mt-2 text-sm font-medium">Total Users</span>
      </motion.div>
      <motion.div whileHover={{ scale: 1.03 }} className="bg-zinc-800 rounded-lg p-6 flex flex-col items-center">
        <span className="font-['Inter'] text-3xl font-bold text-violet-400">{stats.totalSongs}</span>
        <span className="font-['Inter'] text-zinc-300 mt-2 text-sm font-medium">Total Tickets Sold</span>
      </motion.div>
      <motion.div whileHover={{ scale: 1.03 }} className="bg-zinc-800 rounded-lg p-6 flex flex-col items-center">
        <span className="font-['Inter'] text-lg font-semibold text-violet-400">{stats.lastSong}</span>
        <span className="font-['Inter'] text-zinc-300 mt-2 text-sm font-medium">Last Concert Added</span>
      </motion.div>
    </div>
    <div className="bg-zinc-800 rounded-lg p-6">
      <h3 className="font-['Inter'] text-lg font-semibold text-white mb-4 tracking-tight">Tickets Sold (Last 7 Days)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="day" stroke="#aaa" fontFamily="Inter" fontSize={12} />
          <YAxis stroke="#aaa" fontFamily="Inter" fontSize={12} />
          <Tooltip 
            contentStyle={{ 
              background: '#18181b', 
              border: 'none', 
              color: '#fff',
              fontFamily: 'Inter',
              fontSize: '12px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }} 
          />
          <Line type="monotone" dataKey="tickets" stroke="#a78bfa" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default AdminStats; 