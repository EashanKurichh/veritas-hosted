import React, { useState } from 'react';
import { motion } from 'framer-motion';

const dummyUsers = [
  { id: 1, fullName: 'Alice Smith', email: 'alice@example.com', role: 'USER' },
  { id: 2, fullName: 'Bob Johnson', email: 'bob@example.com', role: 'ADMIN' },
  { id: 3, fullName: 'Charlie Lee', email: 'charlie@example.com', role: 'USER' },
];

const UserList = () => {
  const [users] = useState(dummyUsers);

  const handleResetPassword = (user) => {
    alert(`Password reset simulated for ${user.email}`);
  };

  return (
    <div className="max-w-4xl mx-auto bg-zinc-900/80 rounded-xl shadow-xl p-8 mt-4 animate-fade-in">
      <h2 className="font-['Inter'] text-2xl font-bold text-white mb-6 flex items-center gap-2 tracking-tight">
        <i className="ri-user-3-line text-violet-400 text-3xl"></i> User Overview
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-700">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left font-['Inter'] text-sm font-medium text-zinc-400 tracking-wide">Full Name</th>
              <th className="px-4 py-2 text-left font-['Inter'] text-sm font-medium text-zinc-400 tracking-wide">Email</th>
              <th className="px-4 py-2 text-left font-['Inter'] text-sm font-medium text-zinc-400 tracking-wide">Role</th>
              <th className="px-4 py-2 text-left font-['Inter'] text-sm font-medium text-zinc-400 tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <motion.tr key={user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: user.id * 0.05 }} className="hover:bg-zinc-800/60">
                <td className="px-4 py-2 font-['Inter'] text-white font-medium">{user.fullName}</td>
                <td className="px-4 py-2 font-['Inter'] text-zinc-300">{user.email}</td>
                <td className="px-4 py-2 font-['Inter'] text-zinc-300">{user.role}</td>
                <td className="px-4 py-2">
                  <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.97 }} 
                    onClick={() => handleResetPassword(user)} 
                    className="px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-['Inter'] font-medium text-sm transition-all"
                  >
                    Reset Password
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList; 