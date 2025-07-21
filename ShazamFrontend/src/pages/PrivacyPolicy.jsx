import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-[ClashDisplay-Semibold] text-white mb-8">Privacy Policy</h1>
        <div className="prose prose-invert prose-zinc max-w-none">
          <p className="text-zinc-300 mb-6">Last updated: March 2025</p>
          
          <section className="mb-12">
            <h2 className="text-2xl font-[ClashDisplay-Medium] text-white mb-4">Introduction</h2>
            <p className="text-zinc-300 mb-4">
              At Veritas VI, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our concert booking and music discovery platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-[ClashDisplay-Medium] text-white mb-4">Information We Collect</h2>
            <ul className="list-disc text-zinc-300 ml-6 space-y-2">
              <li>Account information (name, email, password)</li>
              <li>Booking details for concert tickets</li>
              <li>Payment information (processed securely through Razorpay)</li>
              <li>Usage data and preferences</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-[ClashDisplay-Medium] text-white mb-4">How We Use Your Information</h2>
            <ul className="list-disc text-zinc-300 ml-6 space-y-2">
              <li>Process your concert ticket bookings</li>
              <li>Send booking confirmations and updates</li>
              <li>Improve our services and user experience</li>
              <li>Provide customer support</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-[ClashDisplay-Medium] text-white mb-4">Data Security</h2>
            <p className="text-zinc-300 mb-4">
              We implement industry-standard security measures to protect your personal information. All payment processing is handled securely by Razorpay.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-[ClashDisplay-Medium] text-white mb-4">Contact Us</h2>
            <p className="text-zinc-300">
              If you have any questions about our Privacy Policy, please contact us at{' '}
              <a href="mailto:veritas.vi.help@gmail.com" className="text-violet-400 hover:text-violet-300">
                veritas.vi.help@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 