import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import UserList from '../components/admin/UserList';
import AdminStats from '../components/admin/AdminStats';
import CreateConcertForm from '../components/admin/CreateConcertForm';
import { useConcerts } from '../context/ConcertContext';
import { toast } from 'react-hot-toast';
import TicketVerification from '../components/admin/TicketVerification';

const adminSections = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: 'ri-dashboard-line' },
  { name: 'Concerts', path: '/admin/concerts', icon: 'ri-calendar-event-line' },
  { name: 'Users', path: '/admin/users', icon: 'ri-user-3-line' },
  // { name: 'Analytics', path: '/admin/analytics', icon: 'ri-bar-chart-2-line' },
  { name: 'Verify Tickets', path: '/admin/verify-tickets', icon: 'ri-ticket-2-line' },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 bg-zinc-900 border-r border-zinc-800">
      <div className="p-6">
        <h1 className="font-['Inter'] text-2xl font-bold text-white flex items-center gap-2">
          <i className="ri-admin-line text-violet-500"></i>
          Admin Panel
        </h1>
      </div>
      <nav className="mt-6">
        {adminSections.map((section) => (
          <motion.button
            key={section.path}
            onClick={() => navigate(section.path)}
            className={`w-full flex items-center gap-3 px-6 py-3 font-['Inter'] text-sm ${
              location.pathname.includes(section.path)
                ? 'text-white bg-violet-600'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <i className={section.icon}></i>
            {section.name}
          </motion.button>
        ))}
      </nav>
    </div>
  );
};

const AdminHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.fullName?.split(' ')[0] || 'Admin';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex justify-end items-center h-16 px-8 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <span className="font-['Inter'] text-zinc-300">Welcome, <span className="text-white font-medium">{firstName}</span></span>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-['Inter'] text-sm font-medium transition-colors flex items-center gap-2"
        >
          <i className="ri-logout-box-r-line"></i>
          Sign Out
        </motion.button>
      </div>
    </div>
  );
};

const ConcertCard = ({ concert, onDelete, onEdit, onCopyUrl }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-zinc-800/50 rounded-lg border border-zinc-700/50 overflow-hidden"
  >
    <div className="aspect-video relative overflow-hidden">
      <img 
        src={concert.image || '/concert-placeholder.jpg'} 
        alt={concert.name} 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
    </div>
    <div className="p-4">
      <h3 className="font-['Inter'] text-lg font-semibold text-white mb-1">{concert.name}</h3>
      <p className="font-['Inter'] text-zinc-400 text-sm mb-2">{concert.location}</p>
      <div className="flex items-center gap-2 mb-3">
        <i className="ri-calendar-line text-violet-400"></i>
        <span className="font-['Inter'] text-zinc-300 text-sm">{new Date(concert.date).toLocaleDateString()}</span>
      </div>
      <p className="font-['Inter'] text-zinc-300 text-sm line-clamp-2 mb-4">{concert.description}</p>
      
      {/* Booking URL Section */}
      {concert.ticketLink && concert.ticketLink.startsWith('/book-ticket/') && (
        <div className="bg-zinc-900/50 rounded-lg p-3 mb-4">
          <p className="text-xs text-zinc-400 mb-2">Booking URL:</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={`${import.meta.env.VITE_FRONTEND_URL}${concert.ticketLink}`}
              readOnly
              className="flex-1 bg-zinc-900 text-white px-2 py-1 rounded border border-zinc-700 text-xs"
            />
            <button
              onClick={() => onCopyUrl(`${import.meta.env.VITE_FRONTEND_URL}${concert.ticketLink}`)}
              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-medium transition-colors"
            >
              <i className="ri-file-copy-line"></i>
            </button>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div className="font-['Inter'] text-sm text-zinc-400">
          <i className="ri-group-line mr-1"></i>
          {concert.artists.split(',').length} Artists
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(concert)}
            className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg font-['Inter'] text-sm font-medium transition-all flex items-center gap-1"
          >
            <i className="ri-edit-2-line"></i>
            Edit
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(concert.id)}
            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg font-['Inter'] text-sm font-medium transition-all flex items-center gap-1"
          >
            <i className="ri-delete-bin-line"></i>
            Remove
          </motion.button>
        </div>
      </div>
    </div>
  </motion.div>
);

const AdminConcerts = () => {
  const [showForm, setShowForm] = useState(false);
  const { concerts, loading, addConcert, removeConcert, updateConcert, getTicketDetails } = useConcerts();
  const [modalOpen, setModalOpen] = useState(false);
  const [concertToDelete, setConcertToDelete] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [concertToEdit, setConcertToEdit] = useState(null);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Booking URL copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy URL');
    }
  };

  const handleCreate = async (concert) => {
    try {
      const { concert: newConcert } = await addConcert(concert);
    setShowForm(false);
      toast.success('Concert created successfully!');
    } catch (error) {
      console.error('Error creating concert:', error);
      toast.error(error.message || 'Failed to create concert');
    }
  };

  const handleEditClick = async (concert) => {
    try {
      // Fetch ticket details
      const ticketDetails = await getTicketDetails(concert.id.toString());
      
      // Prepare initial data with ticket details if available
      const initialData = {
        ...concert,
        ticketPageType: ticketDetails?.pageType || 'COMING_SOON',
        availableFrom: ticketDetails?.availableFrom || '',
        ticketTypes: ticketDetails?.ticketTypes?.map(type => ({
          typeName: type.typeName,
          price: type.price,
          quantity: type.quantity
        })) || []
      };
      
      setConcertToEdit(initialData);
      setEditModalOpen(true);
    } catch (error) {
      console.error('Error preparing edit form:', error);
      toast.error('Failed to load concert details');
    }
  };

  const handleEditSave = async (updatedConcert) => {
    try {
      const result = await updateConcert(concertToEdit.id, updatedConcert);
    setConcertToEdit(null);
    setEditModalOpen(false);
      toast.success('Concert updated successfully!');
    } catch (error) {
      console.error('Error updating concert:', error);
      toast.error(error.message || 'Failed to update concert');
    }
  };

  const handleEditCancel = () => {
    setConcertToEdit(null);
    setEditModalOpen(false);
  };

  const handleDeleteClick = (concertId) => {
    setConcertToDelete(concertId);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (concertToDelete) {
      try {
        await removeConcert(concertToDelete);
      setConcertToDelete(null);
      setModalOpen(false);
      } catch (error) {
        console.error('Error deleting concert:', error);
        // Handle error appropriately
      }
    }
  };

  const handleCancelDelete = () => {
    setConcertToDelete(null);
    setModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-['Inter'] text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
          <i className="ri-calendar-event-line text-violet-400 text-3xl"></i> Concert Management
        </h2>
        <motion.button 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }} 
          onClick={() => setShowForm(f => !f)} 
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-['Inter'] font-medium text-sm transition-all flex items-center gap-2"
        >
          <i className={showForm ? "ri-close-line" : "ri-add-line"}></i>
          {showForm ? 'Cancel' : 'Add Concert'}
        </motion.button>
      </div>
      {showForm && <CreateConcertForm onCreate={handleCreate} onCancel={() => setShowForm(false)} />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {concerts.map(concert => (
          <ConcertCard 
            key={concert.id} 
            concert={concert} 
            onDelete={handleDeleteClick}
            onEdit={handleEditClick}
            onCopyUrl={copyToClipboard}
          />
        ))}
      </div>
      {/* Confirmation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 rounded-xl p-8 shadow-lg border border-zinc-700 w-full max-w-sm">
            <h3 className="font-['Inter'] text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <i className="ri-error-warning-line text-yellow-400 text-2xl"></i>
              Confirm Deletion
            </h3>
            <p className="font-['Inter'] text-zinc-300 mb-6">Are you sure you want to remove this concert? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 rounded-lg bg-zinc-700 text-zinc-200 hover:bg-zinc-600 font-['Inter'] text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-['Inter'] text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {editModalOpen && concertToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 rounded-xl p-8 shadow-lg border border-zinc-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-['Inter'] text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <i className="ri-edit-2-line text-blue-400 text-2xl"></i>
              Edit Concert
            </h3>
            <CreateConcertForm
              onUpdate={handleEditSave}
              initialData={concertToEdit}
              onCancel={handleEditCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-950 font-['Inter']">
      <Sidebar />
      <div className="flex-1 ml-64">
        <AdminHeader />
        <main className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Routes>
              <Route path="dashboard" element={<AdminStats />} />
              <Route path="concerts" element={<AdminConcerts />} />
              <Route path="users" element={<UserList />} />
              <Route path="analytics" element={<AdminStats />} />
              <Route path="verify-tickets" element={<TicketVerification />} />
              <Route index element={<AdminStats />} />
            </Routes>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; 