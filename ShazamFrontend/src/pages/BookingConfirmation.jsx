import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

// Create axios instance with default config
const api = axios.create({
  baseURL: '${import.meta.env.VITE_BACKEND_URL}',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

const RUPEE_SYMBOL = '\u20B9'; // Unicode for Rupee symbol

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const params = new URLSearchParams(location.search);
        let orderId = params.get('orderId');
        
        if (!orderId) {
          orderId = sessionStorage.getItem('lastSuccessfulOrder');
          if (!orderId) {
            console.error('No order ID found in URL or sessionStorage');
            setError('No order ID found');
            setLoading(false);
            return;
          }
        }

        console.log('Fetching order details for orderId:', orderId);

        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found');
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const response = await api.get(
          `/api/payments/order/${orderId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        // Log the response data for debugging
        console.log('API Response:', response.data);

        // Validate the response data
        const data = response.data;
        if (!data) {
          throw new Error('No data received from API');
        }

        // Log individual fields for debugging
        console.log('Data fields:', {
          orderId: data.orderId,
          concertName: data.concertName,
          amount: data.amount,
          tickets: data.tickets,
          userEmail: data.userEmail,
          userName: data.userName
        });

        // More lenient validation
        if (!data.orderId) {
          console.error('Missing orderId in response');
        }
        if (!data.concertName) {
          console.error('Missing concertName in response');
        }
        if (typeof data.amount === 'undefined') {
          console.error('Missing amount in response');
        }
        if (!Array.isArray(data.tickets)) {
          console.error('Missing or invalid tickets array in response');
        }

        // Set the data even if some fields are missing
        setOrderDetails({
          orderId: data.orderId || orderId, // Fallback to the orderId we used in the request
          concertName: data.concertName || 'Concert',
          amount: typeof data.amount === 'number' ? data.amount : 
                 typeof data.amount === 'string' ? parseFloat(data.amount) : 0,
          tickets: Array.isArray(data.tickets) ? data.tickets : [],
          userEmail: data.userEmail || 'Not provided',
          userName: data.userName || 'Not provided'
        });

        setError(null);
        sessionStorage.removeItem('lastSuccessfulOrder');
      } catch (error) {
        console.error('Error in fetchOrderDetails:', error);
        console.error('Full error object:', {
          message: error.message,
          stack: error.stack,
          response: error.response?.data
        });
        setError(error.message || 'Failed to load booking details');
        toast.error('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [location.search, navigate]);

  const generateAndDownloadPDF = async (content) => {
    try {
      // Validate content before generating PDF
      if (!content || typeof content !== 'object') {
        throw new Error('Invalid content for PDF generation');
      }

      const { orderId, concertName, amount, userEmail, userName, tickets } = content;

      // Validate required fields
      if (!orderId || !concertName || typeof amount !== 'number' || !Array.isArray(tickets)) {
        throw new Error('Missing required data for PDF generation');
      }

      const doc = new jsPDF();
      
      // Add logo or header
      doc.setFontSize(22);
      doc.setTextColor(102, 102, 255);
      doc.text('Veritas', 20, 20);
      
      // Add concert details
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text('Booking Confirmation', 20, 40);
      
      doc.setFontSize(12);
      doc.text(`Order ID: ${orderId}`, 20, 60);
      doc.text(`Concert: ${concertName}`, 20, 70);
      doc.text(`Amount Paid: INR ${amount.toFixed(2)}`, 20, 80);
      doc.text(`Name: ${userName || 'N/A'}`, 20, 90);
      doc.text(`Email: ${userEmail || 'N/A'}`, 20, 100);
      
      // Add ticket details
      doc.setFontSize(14);
      doc.text('Your Tickets:', 20, 120);
      
      let yOffset = 140;
      
      // Generate QR codes and add tickets
      for (const ticket of tickets) {
        // Generate QR code
        const qrCodeDataUrl = await QRCode.toDataURL(ticket.code);
        
        // Add ticket type and code
        doc.setFontSize(12);
        doc.text(`Ticket Type: ${ticket.type}`, 20, yOffset);
        doc.text(`Ticket Code: ${ticket.code}`, 20, yOffset + 10);
        
        // Add QR code
        doc.addImage(qrCodeDataUrl, 'PNG', 20, yOffset + 20, 30, 30);
        
        yOffset += 70; // Move down for next ticket
        
        // Add new page if needed
        if (yOffset > 250) {
          doc.addPage();
          yOffset = 20;
        }
      }
      
      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(10);
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text('This is an electronically generated document.', 20, doc.internal.pageSize.height - 20);
      }
      
      // Save the PDF
      doc.save(`tickets-${orderId}.pdf`);
      toast.success('Tickets downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate tickets PDF');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 py-16 text-white">
      <div className="max-w-2xl mx-auto px-6">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mx-auto mb-4"></div>
              <p className="text-zinc-400">Loading your booking details...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-lg">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-error-warning-line text-3xl text-red-500"></i>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">Something went wrong</h2>
              <p className="text-zinc-400 mb-6">{error}</p>
              <button
                onClick={() => navigate('/')}
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-6 py-2 font-medium transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        ) : !orderDetails ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-lg">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-information-line text-3xl text-yellow-500"></i>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">No Order Found</h2>
              <p className="text-zinc-400 mb-6">We couldn't find any booking details. Please try again or contact support.</p>
              <button
                onClick={() => navigate('/')}
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-6 py-2 font-medium transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 rounded-2xl p-8 border border-zinc-800"
          >
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                <i className="ri-check-line text-3xl text-green-500"></i>
              </div>
            </div>

            {/* Thank You Message */}
            <h1 className="font-['Inter'] text-3xl font-semibold text-white text-center mb-2">
              Thank You for Your Purchase!
            </h1>
            <p className="text-zinc-400 text-center mb-8">
              Your tickets have been confirmed and sent to your email.
            </p>

            {/* Order Details */}
            <div className="space-y-6">
              {/* Concert Info */}
              <div className="bg-zinc-900 rounded-xl p-6">
                <h3 className="font-['Inter'] text-xl font-medium text-white mb-4">
                  Order Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Order ID</span>
                    <span className="text-white font-mono">{orderDetails.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Concert</span>
                    <span className="text-white">{orderDetails.concertName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Amount Paid</span>
                    <span className="text-white">₹{(Number(orderDetails.amount) || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Ticket Details */}
              <div className="bg-zinc-900 rounded-xl p-6">
                <h3 className="font-['Inter'] text-xl font-medium text-white mb-4">
                  Your Tickets
                </h3>
                <div className="space-y-4">
                  {Array.isArray(orderDetails.tickets) && orderDetails.tickets.map((ticket, index) => (
                    <div key={index} className="bg-zinc-800 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-zinc-300">{ticket.type}</span>
                        <span className="text-violet-400 font-mono">{ticket.code}</span>
                      </div>
                      <p className="text-sm text-zinc-500">
                        Present this code at the venue for entry
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Confirmation */}
              <div className="bg-zinc-900 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <i className="ri-mail-line text-2xl text-violet-500"></i>
                  <div>
                    <h3 className="font-['Inter'] text-lg font-medium text-white">
                      Email Confirmation Sent
                    </h3>
                    <p className="text-zinc-400 text-sm">
                      We've sent your tickets to {orderDetails.userEmail}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const content = {
                    orderId: orderDetails.orderId,
                    concertName: orderDetails.concertName,
                    amount: Number(orderDetails.amount) || 0,
                    userEmail: orderDetails.userEmail,
                    userName: orderDetails.userName,
                    tickets: orderDetails.tickets || []
                  };
                  generateAndDownloadPDF(content);
                }}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg py-3 font-medium transition-colors"
              >
                Download Tickets
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/')}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg py-3 font-medium transition-colors"
              >
                Back to Home
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BookingConfirmation; 