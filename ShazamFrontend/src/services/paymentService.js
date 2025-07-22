import axios from 'axios';
import { toast } from 'react-hot-toast';

const SERVER_URL = '${import.meta.env.VITE_BACKEND_URL}';

// Create axios instance with default config
const api = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const createOrder = async (orderData, token) => {
  try {
    const response = await api.post(
      '/api/payments/create-order',
      orderData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to create order:', error);
    throw error;
  }
};

export const initializePayment = async (orderData, token, navigate, setLoading, setLoadingMessage) => {
  try {
    console.log('Initializing payment with data:', orderData);
    const order = await createOrder(orderData, token);
    if (!order.success) {
      throw new Error(order.message || 'Failed to create order');
    }

    console.log('Order created successfully:', order);

    const options = {
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      name: 'Veritas VI',
      description: `Tickets for ${orderData.concertName}`,
      image: '/logoSolid.png',
      order_id: order.orderId,
      handler: function(response) {
        console.log('Payment successful, preparing verification...', response);
        handlePaymentSuccess(response, orderData, token, navigate, setLoading, setLoadingMessage);
      },
      prefill: order.prefill || {},
      theme: {
        color: '#6366f1'
      },
      modal: {
        ondismiss: function() {
          console.log('Payment modal dismissed');
          setLoading(false);
          toast.error('Payment cancelled. Please try again.');
        },
        escape: false,
        backdropClose: false
      }
    };

    console.log('Opening Razorpay modal with options:', options);
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    console.error('Payment initialization failed:', error);
    setLoading(false);
    toast.error('Failed to initialize payment. Please try again.');
    throw error;
  }
};

const handlePaymentSuccess = async (response, orderData, token, navigate, setLoading, setLoadingMessage) => {
  try {
    setLoading(true);
    setLoadingMessage('Verifying payment...');
    console.log('Starting payment verification...');
    
    const verificationData = {
      orderId: response.razorpay_order_id,
      paymentId: response.razorpay_payment_id,
      signature: response.razorpay_signature,
      concertId: orderData.concertId,
      concertName: orderData.concertName,
      email: orderData.email,
      name: orderData.name,
      phone: orderData.phone,
      ticketCount: orderData.ticketCount,
      amount: orderData.amount,
      ticketDetails: orderData.ticketDetails
    };

    console.log('Sending verification request:', verificationData);

    const verificationResponse = await api.post(
      '/api/payments/verify',
      verificationData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('Verification response received:', verificationResponse.data);

    if (verificationResponse.data.success) {
      console.log('Payment verified successfully, preparing to redirect...');
      toast.success('✅ Payment Successful!');
      
      // Store the order ID in sessionStorage
      sessionStorage.setItem('lastSuccessfulOrder', response.razorpay_order_id);
      
      setLoadingMessage('Payment successful! Redirecting to confirmation page...');
      
      // Add a small delay before redirecting
      setTimeout(() => {
        console.log('Redirecting to confirmation page...');
        navigate(`/booking-confirmation?orderId=${response.razorpay_order_id}`);
      }, 1500);
    } else {
      console.error('Payment verification failed:', verificationResponse.data);
      setLoading(false);
      toast.error('Payment verification failed. Please contact support.');
    }
  } catch (error) {
    console.error('Error in handlePaymentSuccess:', error);
    setLoading(false);
    toast.error('Payment verification failed. Please contact support.');
  }
}; 