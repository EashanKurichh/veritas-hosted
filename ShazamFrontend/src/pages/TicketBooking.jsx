import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { initializePayment, createOrder } from '../services/paymentService';
import LoadingOverlay from '../components/LoadingOverlay';

const TicketBooking = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [ticketData, setTicketData] = useState(null);
  const [concertData, setConcertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuantities, setSelectedQuantities] = useState(() => {
    // Try to restore selected quantities from sessionStorage
    const saved = sessionStorage.getItem(`booking_${uuid}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved booking state:', e);
      }
    }
    return {};
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Calculate total quantity
  const totalQuantity = Object.values(selectedQuantities).reduce((sum, qty) => sum + qty, 0);

  // Calculate selected ticket details
  const selectedTicketDetails = ticketData?.ticketTypes
    ?.filter(type => selectedQuantities[type.typeName] > 0)
    ?.map(type => ({
      ticketType: type.typeName,
      quantity: selectedQuantities[type.typeName],
      price: type.price
    })) || [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'X-Timezone-Offset': '-330',
          'Content-Type': 'application/json'
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Fetch ticket data
        const ticketResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tickets/${uuid}`, {
          headers
        });
        if (!ticketResponse.ok) throw new Error('Failed to fetch ticket data');
        const ticketData = await ticketResponse.json();
        console.log('Fetched ticket data:', ticketData); // Debug log
        
        if (!ticketData.concertId) {
          throw new Error('Ticket data missing concert ID');
        }
        
        setTicketData(ticketData);

        // Fetch concert data using concertId from ticket data
        const concertResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/concerts/${ticketData.concertId}`, {
          headers
        });
        
        if (!concertResponse.ok) {
          throw new Error('Failed to fetch concert data');
        }
        
        const concertData = await concertResponse.json();
        console.log('Fetched concert data:', concertData); // Debug log
        
        if (!concertData || !concertData.name) {
          throw new Error('Invalid concert data received');
        }
        
        setConcertData(concertData);

        // Initialize quantities for each ticket type to 0
        if (ticketData.ticketTypes) {
          const initialQuantities = ticketData.ticketTypes.reduce((acc, type) => ({
            ...acc,
            [type.typeName]: 0
          }), {});
          setSelectedQuantities(prev => Object.keys(prev).length > 0 ? prev : initialQuantities);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uuid]);

  useEffect(() => {
    // Calculate total amount whenever quantities change
    if (ticketData?.ticketTypes) {
      const total = ticketData.ticketTypes.reduce((sum, type) => {
        return sum + (type.price * (selectedQuantities[type.typeName] || 0));
      }, 0);
      setTotalAmount(total);
    }
  }, [selectedQuantities, ticketData]);

  // Save booking state to sessionStorage when quantities change
  useEffect(() => {
    if (Object.keys(selectedQuantities).length > 0) {
      sessionStorage.setItem(`booking_${uuid}`, JSON.stringify(selectedQuantities));
    }
  }, [selectedQuantities, uuid]);

  const handleQuantityChange = (typeName, quantity) => {
    const ticketType = ticketData.ticketTypes.find(t => t.typeName === typeName);
    if (!ticketType) return;

    // Check if there are enough tickets available
    const currentQuantity = selectedQuantities[typeName] || 0;
    const remainingTickets = ticketType.quantity - currentQuantity;
    const requestedChange = quantity - currentQuantity;

    if (requestedChange > remainingTickets) {
      toast.error(`Only ${remainingTickets} tickets available for ${typeName}`);
      return;
    }

    // Calculate total tickets selected across all types
    const totalTickets = Object.entries(selectedQuantities).reduce((sum, [type, qty]) => {
      return type === typeName ? sum : sum + qty;
    }, 0) + quantity;

    // Prevent selecting more than 4 tickets total
    if (totalTickets > 4) {
      toast.error('Maximum 4 tickets allowed per booking');
      return;
    }

    setSelectedQuantities(prev => ({
      ...prev,
      [typeName]: quantity
    }));
  };

  const handleProceedToCheckout = async () => {
    if (!isAuthenticated) {
      setShowSignInPrompt(true);
      return;
    }

    if (totalQuantity === 0) {
      toast.error('Please select at least one ticket');
      return;
    }

    try {
      // Add detailed logging
      console.log('Full concert data:', concertData);
      console.log('Full ticket data:', ticketData);

      // Get concert name from concert data
      if (!concertData || !concertData.name) {
        console.error('Missing concert data:', { concertData, ticketData });
        toast.error('Concert information is missing');
        return;
      }

      // Create order data
      const orderData = {
        amount: totalAmount * 1.18, // Including 18% tax
        email: user?.email,
        name: user?.fullName || 'Concert Goer',
        phone: user?.phone || '',
        concertName: concertData.name, // Use name directly from concertData
        ticketCount: totalQuantity,
        concertId: ticketData.concertId,
        userId: user?.id,
        ticketDetails: selectedTicketDetails
      };

      console.log('Order data being sent:', orderData); // Debug log

      // Add authorization header
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      setIsProcessingPayment(true);
      setLoadingMessage('Initializing payment...');

      // Initialize Razorpay payment
      await initializePayment(orderData, token, navigate, setIsProcessingPayment, setLoadingMessage);
    } catch (error) {
      console.error('Payment initialization failed:', error);
      toast.error('Failed to initialize payment. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  const handleSignInPromptResponse = (proceed) => {
    setShowSignInPrompt(false);
    if (proceed) {
      // Save current URL to sessionStorage before redirecting
      sessionStorage.setItem('redirectAfterSignIn', location.pathname);
      navigate('/signin');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-['Inter'] text-2xl text-white mb-4">Error</h2>
          <p className="text-zinc-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!ticketData) return null;

  if (ticketData.pageType === 'COMING_SOON') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto px-6">
          <i className="ri-ticket-2-line text-6xl text-violet-500 mb-6"></i>
          <h2 className="font-['Inter'] text-3xl font-semibold text-white mb-4">
            Tickets Coming Soon
          </h2>
          <p className="text-zinc-400">
            Stay tuned! Ticket sales for this event haven't started yet.
          </p>
        </div>
      </div>
    );
  }

  if (ticketData.pageType === 'AVAILABLE_LATER') {
    const availableDate = new Date(ticketData.availableFrom);
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto px-6">
          <i className="ri-calendar-line text-6xl text-violet-500 mb-6"></i>
          <h2 className="font-['Inter'] text-3xl font-semibold text-white mb-4">
            Tickets Available Soon
          </h2>
          <p className="text-zinc-400">
            Tickets will be available on{' '}
            <span className="text-white font-medium">
              {availableDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            {' '}at{' '}
            <span className="text-white font-medium">
              {availableDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })} IST
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {isProcessingPayment && <LoadingOverlay message={loadingMessage} />}
      </AnimatePresence>
      
      <div className="min-h-screen bg-zinc-950 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-['Inter'] text-3xl font-semibold text-white mb-8">
            Select Your Tickets
          </h1>

          <div className="grid gap-6 mb-8">
            {ticketData.ticketTypes.map((type) => {
              const currentQuantity = selectedQuantities[type.typeName] || 0;
              const remainingTickets = type.quantity - currentQuantity;
              const maxAvailable = type.quantity;
              const isSoldOut = type.quantity === 0;
              const isSellingFast = remainingTickets > 0 && remainingTickets < 6;

              return (
                <motion.div
                  key={type.typeName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800"
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-['Inter'] text-xl font-medium text-white">
                          {type.typeName}
                        </h3>
                        {isSellingFast && (
                          <span className="bg-red-500/10 text-red-400 text-xs px-2 py-1 rounded-full font-medium animate-pulse">
                            Selling Fast!
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-zinc-400">
                          ₹{type.price.toFixed(2)} per ticket
                        </p>
                        <span className="text-zinc-400">•</span>
                        {isSoldOut ? (
                          <span className="text-red-400">Sold Out</span>
                        ) : isSellingFast ? (
                          <span className="text-yellow-500 font-medium">
                            Last {remainingTickets} remaining!
                          </span>
                        ) : (
                          <span className="text-zinc-400">
                            {remainingTickets} remaining
                          </span>
                        )}
                      </div>
                    </div>
                    {!isSoldOut && (
                      <div className="flex items-center gap-4">
                        <select
                          value={currentQuantity}
                          onChange={(e) => handleQuantityChange(type.typeName, parseInt(e.target.value))}
                          className="bg-zinc-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        >
                          {[...Array(Math.min(maxAvailable + 1, 5))].map((_, i) => (
                            <option key={i} value={i}>{i}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Cart Summary */}
          {totalAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800"
            >
              <h3 className="font-['Inter'] text-xl font-medium text-white mb-4">
                Order Summary
              </h3>
              
              {Object.entries(selectedQuantities).map(([typeName, quantity]) => {
                if (quantity > 0) {
                  const ticketType = ticketData.ticketTypes.find(t => t.typeName === typeName);
                  return (
                    <div key={typeName} className="flex justify-between mb-2">
                      <span className="text-zinc-400">
                        {typeName} × {quantity}
                      </span>
                      <span className="text-white">
                        ₹{(ticketType.price * quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                }
                return null;
              })}
              
              <div className="border-t border-zinc-800 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="text-white">₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Tax (18%)</span>
                  <span className="text-white">₹{(totalAmount * 0.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t border-zinc-800 mt-2">
                  <span className="text-white">Total Amount</span>
                  <span className="text-white">₹{(totalAmount * 1.18).toFixed(2)}</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleProceedToCheckout}
                className="w-full mt-6 bg-violet-600 hover:bg-violet-700 text-white rounded-lg py-3 font-medium transition-colors"
              >
                Proceed to Checkout
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Sign In Prompt Modal */}
        {showSignInPrompt && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900 rounded-2xl p-6 max-w-md mx-4 w-full"
            >
              <h3 className="font-['Inter'] text-xl font-medium text-white mb-4">
                Sign In Required
              </h3>
              <p className="text-zinc-400 mb-6">
                Please sign in to continue with your booking.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleSignInPromptResponse(true)}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg py-2 font-medium transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleSignInPromptResponse(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg py-2 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
};

export default TicketBooking; 