import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

// Preset gradients for admin to choose from
const GRADIENTS = [
  ['from-purple-600', 'to-pink-500'],
  ['from-red-600', 'to-blue-900'],
  ['from-yellow-400', 'to-orange-500'],
  ['from-violet-600', 'to-indigo-500'],
  ['from-green-400', 'to-cyan-500'],
  ['from-fuchsia-600', 'to-rose-400'],
];

// Helper to convert Tailwind color class to real color value
const tailwindColorMap = {
  'from-purple-600': '#8b5cf6',
  'to-pink-500': '#ec4899',
  'from-red-600': '#dc2626',
  'to-blue-900': '#1e3a8a',
  'from-yellow-400': '#facc15',
  'to-orange-500': '#f97316',
  'from-violet-600': '#7c3aed',
  'to-indigo-500': '#6366f1',
  'from-green-400': '#4ade80',
  'to-cyan-500': '#06b6d4',
  'from-fuchsia-600': '#c026d3',
  'to-rose-400': '#fb7185',
};

function getTailwindColor(tw) {
  return tailwindColorMap[tw] || '#fff';
}

const TicketTypeManager = ({ ticketTypes, setTicketTypes }) => {
  const [newType, setNewType] = useState({
    typeName: '',
    price: '',
    quantity: ''
  });
  const [editMode, setEditMode] = useState({});

  const handleAddType = () => {
    if (newType.typeName && newType.price && newType.quantity) {
      setTicketTypes([...ticketTypes, {
        ...newType,
        price: parseFloat(newType.price) || 0,
        quantity: parseInt(newType.quantity) || 0
      }]);
      setNewType({ typeName: '', price: '', quantity: '' });
    }
  };

  const handleRemoveType = (index) => {
    setTicketTypes(ticketTypes.filter((_, i) => i !== index));
  };

  const handleInputChange = (field, value) => {
    setNewType(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditType = (index, field, value) => {
    const updatedTypes = [...ticketTypes];
    updatedTypes[index] = {
      ...updatedTypes[index],
      [field]: field === 'price' ? parseFloat(value) || 0 : 
               field === 'quantity' ? parseInt(value) || 0 : value
    };
    setTicketTypes(updatedTypes);
  };

  const toggleEditMode = (index) => {
    setEditMode(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="space-y-4">
      {ticketTypes.map((type, index) => (
        <div key={index} className="flex items-center gap-4 bg-zinc-800/50 p-4 rounded-lg">
          <div className="flex-1">
            {editMode[index] ? (
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  value={type.typeName}
                  onChange={(e) => handleEditType(index, 'typeName', e.target.value)}
                  className="bg-zinc-900 text-white placeholder-zinc-400 border border-zinc-700 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <input
                  type="number"
                  value={type.price}
                  onChange={(e) => handleEditType(index, 'price', e.target.value)}
                  className="bg-zinc-900 text-white placeholder-zinc-400 border border-zinc-700 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <input
                  type="number"
                  value={type.quantity}
                  onChange={(e) => handleEditType(index, 'quantity', e.target.value)}
                  className="bg-zinc-900 text-white placeholder-zinc-400 border border-zinc-700 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            ) : (
              <>
                <p className="text-white font-medium">{type.typeName}</p>
                <p className="text-zinc-400 text-sm">
                  ₹{type.price} • {type.quantity} tickets
                </p>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => toggleEditMode(index)}
              className="text-blue-400 hover:text-blue-300"
            >
              <i className={editMode[index] ? "ri-save-line" : "ri-edit-line"}></i>
            </button>
            <button
              type="button"
              onClick={() => handleRemoveType(index)}
              className="text-red-400 hover:text-red-300"
            >
              <i className="ri-delete-bin-line"></i>
            </button>
          </div>
        </div>
      ))}

      <div className="grid grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Type Name"
          value={newType.typeName}
          onChange={(e) => handleInputChange('typeName', e.target.value)}
          className="bg-zinc-800 text-white placeholder-zinc-400 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <input
          type="number"
          placeholder="Price (₹)"
          value={newType.price}
          onChange={(e) => handleInputChange('price', e.target.value)}
          className="bg-zinc-800 text-white placeholder-zinc-400 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <input
          type="number"
          placeholder="Quantity"
          value={newType.quantity}
          onChange={(e) => handleInputChange('quantity', e.target.value)}
          className="bg-zinc-800 text-white placeholder-zinc-400 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddType}
        className="w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg py-2 font-medium transition-colors flex items-center justify-center gap-2"
      >
        <i className="ri-add-line"></i>
        Add Ticket Type
      </motion.button>
    </div>
  );
};

const CreateConcertForm = ({ onCreate, onUpdate, initialData, onCancel }) => {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    location: initialData?.location || '',
    date: initialData?.date || '',
    time: initialData?.time || '',
    description: initialData?.description || '',
    shortDescription: initialData?.shortDescription || '',
    artists: initialData?.artists || '',
    image: initialData?.image || '',
    gradient: initialData?.gradient || ['from-violet-600', 'to-indigo-500'],
    ticketPageType: initialData?.ticketPageType || 'COMING_SOON',
    availableFrom: initialData?.availableFrom || '',
    ticketTypes: initialData?.ticketTypes || []
  });
  const [isLoading, setIsLoading] = useState(false);

  const inputClasses = "font-['Inter'] bg-zinc-800 text-white placeholder-zinc-400 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all w-full";
  const labelClasses = "font-['Inter'] text-zinc-300 text-sm font-medium mb-1 block";

  const handleGradientSelect = (gradient) => {
    setForm(f => ({ ...f, gradient }));
  };

  const validateForm = () => {
    const requiredFields = ['name', 'location', 'date', 'time', 'description', 'shortDescription', 'artists', 'image'];
    const missingFields = requiredFields.filter(field => !form[field]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }

    if (form.ticketPageType === 'AVAILABLE_LATER' && !form.availableFrom) {
      toast.error('Please specify when tickets will be available');
      return false;
    }

    if (form.ticketPageType === 'BOOKABLE') {
      if (form.ticketTypes.length === 0) {
        toast.error('Please add at least one ticket type');
        return false;
      }

      // Validate each ticket type
      for (const ticket of form.ticketTypes) {
        if (!ticket.typeName || !ticket.typeName.trim()) {
          toast.error('All ticket types must have a name');
          return false;
        }
        if (!ticket.price || ticket.price <= 0) {
          toast.error('All ticket types must have a valid price greater than 0');
          return false;
        }
        if (!ticket.quantity || ticket.quantity <= 0) {
          toast.error('All ticket types must have a valid quantity greater than 0');
          return false;
        }
      }

      // Check for duplicate ticket type names
      const typeNames = form.ticketTypes.map(t => t.typeName.trim().toLowerCase());
      if (new Set(typeNames).size !== typeNames.length) {
        toast.error('Each ticket type must have a unique name');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    console.log('Submitting form data:', JSON.stringify(form, null, 2));

    setIsLoading(true);
    try {
      if (onUpdate) {
        await onUpdate(form);
      } else {
        await onCreate(form);
      }
    } catch (error) {
      console.error('Error creating/updating concert:', error);
      toast.error(error.message || 'Failed to create concert');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="bg-zinc-800/50 p-6 rounded-lg mb-6 border border-zinc-700/50" onSubmit={handleSubmit}>
      {/* Concert Details Section */}
      <div className="mb-8">
        <h3 className="font-['Inter'] text-lg font-semibold text-white mb-4">Concert Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className={labelClasses}>Concert Name</label>
            <input
              className={inputClasses}
              placeholder="Enter concert name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className={labelClasses}>Location</label>
            <input
              className={inputClasses}
              placeholder="Enter venue location"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className={labelClasses}>Short Description</label>
            <input
              className={inputClasses}
              placeholder="Enter a brief description (displayed in cards)"
              value={form.shortDescription}
              onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className={labelClasses}>Artists</label>
            <input
              className={inputClasses}
              placeholder="Enter performing artists"
              value={form.artists}
              onChange={e => setForm(f => ({ ...f, artists: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="mb-6">
          <label className={labelClasses}>Full Description</label>
          <textarea
            className={`${inputClasses} min-h-[100px]`}
            placeholder="Enter detailed concert description"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className={labelClasses}>Date</label>
            <input
              type="date"
              className={inputClasses}
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className={labelClasses}>Time</label>
            <input
              type="time"
              className={inputClasses}
              value={form.time}
              onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className={labelClasses}>Image URL</label>
            <input
              className={inputClasses}
              placeholder="Enter concert image URL"
              value={form.image}
              onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelClasses}>Gradient Colors</label>
            <div className="flex gap-4">
              <select
                className={inputClasses}
                value={form.gradient[0]}
                onChange={e => setForm(f => ({ ...f, gradient: [e.target.value, f.gradient[1]] }))}
              >
                <option value="from-violet-600">Violet</option>
                <option value="from-purple-600">Purple</option>
                <option value="from-red-600">Red</option>
                <option value="from-yellow-400">Yellow</option>
                <option value="from-blue-600">Blue</option>
                <option value="from-green-600">Green</option>
              </select>
              <select
                className={inputClasses}
                value={form.gradient[1]}
                onChange={e => setForm(f => ({ ...f, gradient: [f.gradient[0], e.target.value] }))}
              >
                <option value="to-indigo-500">Indigo</option>
                <option value="to-pink-500">Pink</option>
                <option value="to-blue-900">Blue</option>
                <option value="to-orange-500">Orange</option>
                <option value="to-teal-500">Teal</option>
                <option value="to-emerald-500">Emerald</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Section */}
      <div className="mb-8">
        <h3 className="font-['Inter'] text-lg font-semibold text-white mb-4">Ticket Options</h3>
        <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="radio"
                id="coming-soon"
                value="COMING_SOON"
                checked={form.ticketPageType === 'COMING_SOON'}
                onChange={e => setForm(f => ({ ...f, ticketPageType: e.target.value }))}
                className="text-violet-500 focus:ring-violet-500"
              />
              <label htmlFor="coming-soon" className="text-white">Coming Soon</label>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="radio"
                id="available-later"
                value="AVAILABLE_LATER"
                checked={form.ticketPageType === 'AVAILABLE_LATER'}
                onChange={e => setForm(f => ({ ...f, ticketPageType: e.target.value }))}
                className="text-violet-500 focus:ring-violet-500"
              />
              <label htmlFor="available-later" className="text-white">Available Later</label>
            </div>

            {form.ticketPageType === 'AVAILABLE_LATER' && (
              <div className="pl-8">
                <input
                  type="datetime-local"
                  value={form.availableFrom}
                  onChange={e => setForm(f => ({ ...f, availableFrom: e.target.value }))}
                  className={inputClasses}
                  required
                />
              </div>
            )}

            <div className="flex items-center gap-4">
              <input
                type="radio"
                id="manage-tickets"
                value="BOOKABLE"
                checked={form.ticketPageType === 'BOOKABLE'}
                onChange={e => setForm(f => ({ ...f, ticketPageType: e.target.value, ticketTypes: [] }))}
                className="text-violet-500 focus:ring-violet-500"
              />
              <label htmlFor="manage-tickets" className="text-white">Manage Tickets</label>
            </div>

            {form.ticketPageType === 'BOOKABLE' && (
              <div className="pl-8">
                <TicketTypeManager
                  ticketTypes={form.ticketTypes || []}
                  setTicketTypes={types => setForm(f => ({ ...f, ticketTypes: types }))}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-zinc-700 text-zinc-200 hover:bg-zinc-600 font-['Inter'] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-['Inter'] font-medium text-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {onUpdate ? 'Saving...' : 'Creating...'}
            </>
          ) : (
            <>
              <i className={onUpdate ? "ri-save-line" : "ri-add-line"}></i>
              {onUpdate ? 'Save Changes' : 'Create Concert'}
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
};

export default CreateConcertForm; 