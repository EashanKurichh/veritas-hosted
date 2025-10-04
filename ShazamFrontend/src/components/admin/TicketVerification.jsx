import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const TicketVerification = () => {
  const [ticketCode, setTicketCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [ticketInfo, setTicketInfo] = useState(null);
  const [error, setError] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTicketInfo(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/verify-ticket`,
        { ticketCode },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setTicketInfo(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify ticket');
      toast.error('Failed to verify ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsUsed = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/mark-ticket-used`,
        { ticketCode },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success('Ticket marked as used');
      setTicketInfo({ ...ticketInfo, status: 'USED' });
      // Clear form after successful marking
      setTicketCode('');
      setTicketInfo(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark ticket as used');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'VALID':
        return 'text-green-500 bg-green-500/10';
      case 'USED':
        return 'text-orange-500 bg-orange-500/10';
      case 'INVALID':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-zinc-500 bg-zinc-500/10';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-zinc-900/80 rounded-xl shadow-xl p-8 mt-4">
      <h2 className="font-['Inter'] text-2xl font-bold text-white mb-6 flex items-center gap-2 tracking-tight">
        <i className="ri-ticket-2-line text-violet-400 text-3xl"></i> Verify Concert Tickets
      </h2>

      {/* Verification Form */}
      <form onSubmit={handleVerify} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={ticketCode}
            onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
            placeholder="Enter ticket code (e.g., VI-25X7-AB93)"
            className="flex-1 bg-zinc-800 text-white px-4 py-3 rounded-lg border border-zinc-700 focus:outline-none focus:border-violet-500"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading || !ticketCode}
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </motion.button>
        </div>
      </form>

      {/* Results */}
      <AnimatePresence mode="wait">
        {ticketInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-zinc-800 rounded-xl p-8 border border-zinc-700"
          >
            {/* Status Badge */}
            <div className="flex justify-center mb-6">
              <span className={`px-4 py-2 rounded-full font-medium ${getStatusColor(ticketInfo.status)}`}>
                {ticketInfo.status}
              </span>
            </div>

            {/* Ticket Information */}
            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Ticket Code</span>
                  <span className="text-white font-mono">{ticketInfo.ticketCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Concert ID</span>
                  <span className="text-white">{ticketInfo.concertId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Ticket Type</span>
                  <span className="text-white">{ticketInfo.ticketType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">User Name</span>
                  <span className="text-white">{ticketInfo.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">User Email</span>
                  <span className="text-white">{ticketInfo.userEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Issued At</span>
                  <span className="text-white">{formatDate(ticketInfo.issuedAt)}</span>
                </div>
              </div>

              {/* Action Button */}
              {ticketInfo.status === 'VALID' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleMarkAsUsed}
                  className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 font-medium transition-colors"
                >
                  Mark as Used
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {error && !ticketInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-500/10 text-red-500 p-4 rounded-lg text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TicketVerification; 