import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Help = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    type: 'general',
    message: ''
  });

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send this to a backend
    // For now, we'll just show a success message
    toast.success('Thank you for your feedback!');
    setShowFeedbackModal(false);
    setFeedbackForm({ type: 'general', message: '' });
  };

  const faqs = {
    general: [
      {
        question: "What is Veritas VI?",
        answer: "Veritas VI is a concert booking and music discovery platform that helps you find and book tickets for your favorite artists while staying updated with the latest music trends."
      },
      {
        question: "How do I create an account?",
        answer: "Click on the 'Sign Up' button in the top right corner, fill in your details, and verify your email address to create your account."
      },
      {
        question: "Is my payment information secure?",
        answer: "Yes, all payments are processed securely through Razorpay, a trusted payment gateway that uses industry-standard encryption."
      }
    ],
    booking: [
      {
        question: "How do I book concert tickets?",
        answer: "Browse available concerts, select your preferred event, choose your seats, and proceed to checkout using our secure payment system."
      },
      {
        question: "Can I cancel my ticket?",
        answer: "Ticket cancellation policies vary by event. Please check the specific event's terms and conditions for cancellation details."
      },
      {
        question: "How do I get my tickets?",
        answer: "After successful payment, digital tickets will be sent to your registered email address and will also be available in your account."
      }
    ],
    technical: [
      {
        question: "The website is not loading properly",
        answer: "Try clearing your browser cache and cookies, or use a different browser. If the issue persists, please contact our support team."
      },
      {
        question: "I can't access my account",
        answer: "Use the 'Forgot Password' option to reset your password. If you're still having trouble, contact our support team for assistance."
      },
      {
        question: "Payment failed but money was deducted",
        answer: "Don't worry! Failed transaction amounts are automatically refunded within 5-7 business days. Contact us if you don't receive the refund."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-[ClashDisplay-Semibold] text-white mb-6">Help & Support</h1>
          <p className="text-xl text-zinc-300 max-w-3xl mx-auto font-[Inter]">
            Find answers to common questions or get in touch with our support team.
          </p>
        </div>

        {/* Quick Contact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 text-center">
            <i className="ri-mail-line text-4xl text-violet-400 mb-4"></i>
            <h3 className="text-xl font-[ClashDisplay-Medium] text-white mb-2">Email Support</h3>
            <p className="text-zinc-400 mb-4">Get help via email</p>
            <a 
              href="mailto:veritas.vi.help@gmail.com" 
              className="text-violet-400 hover:text-violet-300 transition-colors"
            >
              veritas.vi.help@gmail.com
            </a>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 text-center">
            <i className="ri-customer-service-line text-4xl text-violet-400 mb-4"></i>
            <h3 className="text-xl font-[ClashDisplay-Medium] text-white mb-2">Phone Support</h3>
            <p className="text-zinc-400 mb-4">Available 9 AM - 6 PM IST</p>
            <span className="text-violet-400">+91 (555) 123-4567</span>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 text-center">
            <i className="ri-feedback-line text-4xl text-violet-400 mb-4"></i>
            <h3 className="text-xl font-[ClashDisplay-Medium] text-white mb-2">Send Feedback</h3>
            <p className="text-zinc-400 mb-4">Help us improve our service</p>
            <button 
              onClick={() => setShowFeedbackModal(true)}
              className="inline-block px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
            >
              Submit Feedback
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8">
          <h2 className="text-2xl font-[ClashDisplay-Medium] text-white mb-8">Frequently Asked Questions</h2>
          
          {/* FAQ Categories */}
          <div className="flex flex-wrap gap-4 mb-8">
            {Object.keys(faqs).map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeSection === section
                    ? 'bg-violet-600 text-white'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                }`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {faqs[activeSection].map((faq, index) => (
              <div
                key={index}
                className="border border-zinc-800 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-white font-medium">{faq.question}</span>
                  <i className={`ri-arrow-down-s-line text-zinc-400 transition-transform ${
                    expandedFaq === index ? 'rotate-180' : ''
                  }`}></i>
                </button>
                <AnimatePresence>
                  {expandedFaq === index && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 text-zinc-300 border-t border-zinc-800">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback Modal */}
        <AnimatePresence>
          {showFeedbackModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-zinc-900 rounded-xl p-8 max-w-lg w-full mx-4 border border-zinc-700"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-[ClashDisplay-Medium] text-white">Send Feedback</h3>
                  <button 
                    onClick={() => setShowFeedbackModal(false)}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    <i className="ri-close-line text-2xl"></i>
                  </button>
                </div>

                <form onSubmit={handleFeedbackSubmit}>
                  <div className="mb-4">
                    <label className="block text-zinc-300 mb-2">Feedback Type</label>
                    <select
                      value={feedbackForm.type}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, type: e.target.value })}
                      className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2 border border-zinc-700 focus:outline-none focus:border-violet-500"
                    >
                      <option value="general">General Feedback</option>
                      <option value="bug">Report a Bug</option>
                      <option value="feature">Feature Request</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="block text-zinc-300 mb-2">Your Message</label>
                    <textarea
                      value={feedbackForm.message}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                      className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2 border border-zinc-700 focus:outline-none focus:border-violet-500 h-32 resize-none"
                      placeholder="Tell us what you think..."
                      required
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setShowFeedbackModal(false)}
                      className="px-4 py-2 text-zinc-300 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Help; 