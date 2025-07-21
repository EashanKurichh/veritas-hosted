import React from 'react';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-[ClashDisplay-Semibold] text-white mb-8">Terms of Service</h1>
        <div className="prose prose-invert prose-zinc max-w-none">
          <p className="text-zinc-300 mb-6">Last updated: March 2025</p>
          
          <section className="mb-12">
            <h2 className="text-2xl font-[ClashDisplay-Medium] text-white mb-4">Agreement to Terms</h2>
            <p className="text-zinc-300 mb-4">
              By accessing or using Veritas VI, you agree to be bound by these Terms of Service and all applicable laws and regulations.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-[ClashDisplay-Medium] text-white mb-4">Use of Service</h2>
            <ul className="list-disc text-zinc-300 ml-6 space-y-2">
              <li>You must be at least 18 years old to use our services</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>Ticket purchases are final and non-refundable unless stated otherwise</li>
              <li>Resale of tickets is prohibited without explicit permission</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-[ClashDisplay-Medium] text-white mb-4">Ticket Booking</h2>
            <ul className="list-disc text-zinc-300 ml-6 space-y-2">
              <li>All ticket prices are in Indian Rupees (INR)</li>
              <li>Booking confirmations will be sent to your registered email</li>
              <li>Digital tickets must be presented at the venue</li>
              <li>Event dates and times are subject to change</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-[ClashDisplay-Medium] text-white mb-4">Intellectual Property</h2>
            <p className="text-zinc-300 mb-4">
              All content on Veritas VI, including logos, designs, and software, is protected by copyright and other intellectual property rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-[ClashDisplay-Medium] text-white mb-4">Contact</h2>
            <p className="text-zinc-300">
              For any questions about these Terms, please contact us at{' '}
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

export default TermsOfService; 