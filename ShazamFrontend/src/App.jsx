import React, { useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ConcertProvider } from './context/ConcertContext'
import Navbar from './components/Navbar'
import AuthenticatedNavbar from './components/AuthenticatedNavbar'
import { useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ChangePassword from './pages/ChangePassword'
import Charts from './pages/Charts'
import About from './pages/About'
import Help from './pages/Help'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import ConcertList from './components/ConcertList'
import ConcertDetail from './components/ConcertDetail'
import AdminDashboard from './pages/AdminDashboard'
import RecordingPage from './components/recording/RecordingPage'
import TicketBooking from './pages/TicketBooking'
import BookingConfirmation from './pages/BookingConfirmation'
import MusicFacts from './pages/MusicFacts'
import 'remixicon/fonts/remixicon.css'
import { Toaster } from 'react-hot-toast'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/signin" replace />;
  return children;
}

function ProtectedAdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== 'ADMIN') return <Navigate to="/home" replace />;
  return children;
}

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Check if current route is admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Only show navbar if not on admin routes */}
      {!isAdminRoute && (isAuthenticated ? <AuthenticatedNavbar /> : <Navbar />)}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/charts" element={<Charts />} />
        <Route path="/concerts" element={<ConcertList />} />
        <Route path="/concerts/:slug" element={<ConcertDetail />} />
        <Route path="/record" element={<RecordingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/music-facts" element={<MusicFacts />} />
        <Route path="/book-ticket/:uuid" element={<TicketBooking />} />
        <Route path="/booking-confirmation" element={
          <ProtectedRoute>
            <BookingConfirmation />
          </ProtectedRoute>
        } />
        <Route path="/admin/*" element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ConcertProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#27272a',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <AppContent />
        </ConcertProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;