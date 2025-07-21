import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import MarqueeStripe from '../components/MarqueeStripe';
import Global200 from '../components/Global200';
import ChartBox from '../components/ChartBox';
import { FaTicketAlt, FaSpotify, FaChartLine } from 'react-icons/fa';
import { BsCalendarEvent, BsCreditCard2Front, BsShieldCheck } from 'react-icons/bs';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: <FaTicketAlt className="w-8 h-8" />,
      title: "Easy Booking",
      description: "Book concert tickets in just a few clicks with our streamlined process"
    },
    {
      icon: <BsCalendarEvent className="w-8 h-8" />,
      title: "Upcoming Events",
      description: "Stay updated with the latest concert schedules and event details"
    },
    {
      icon: <FaSpotify className="w-8 h-8" />,
      title: "Spotify Charts",
      description: "Access real-time global music rankings powered by Spotify's official charts"
    },
    {
      icon: <BsCreditCard2Front className="w-8 h-8" />,
      title: "Secure Payments",
      description: "Safe and secure transactions powered by Razorpay payment gateway"
    },
    {
      icon: <FaChartLine className="w-8 h-8" />,
      title: "Real-time Charts",
      description: "Track trending songs and artists across different regions"
    },
    {
      icon: <BsShieldCheck className="w-8 h-8" />,
      title: "Verified Events",
      description: "All events are verified and backed by our guarantee"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white font-['Inter']">
      {/* Hero Section */}
      <div className="relative h-screen">
        {/* Video Background */}
        <div className="absolute inset-0 overflow-hidden">
          <video 
            className="w-full h-full object-cover"
            autoPlay 
            loop 
            muted 
            playsInline
          >
            <source src="/hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-5xl md:text-7xl font-[ClashDisplay-Semibold] mb-6 leading-tight">
            Experience Music<br />Like Never Before
          </h1>
          <p className="text-xl md:text-2xl text-zinc-300 mb-12 max-w-3xl font-[Inter] leading-relaxed">
            Book tickets for your favorite artists' concerts and discover new music trends with Veritas VI
          </p>
          <div className="flex gap-6">
            <Link
              to="/concerts"
              className="px-8 py-4 bg-violet-600 hover:bg-violet-700 rounded-lg text-lg font-medium transition-all duration-300 hover:scale-105"
            >
              Browse Concerts
            </Link>
            <Link
              to="/charts"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-lg text-lg font-medium transition-all duration-300"
            >
              View Charts
            </Link>
          </div>
        </div>
      </div>

      {/* Marquee Stripe */}
      <MarqueeStripe />

      {/* Featured Charts */}
      <Global200 />

      {/* Features Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-violet-600/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-[ClashDisplay-Semibold] mb-6">
              Why Choose Veritas VI
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-[Inter]">
              Experience the perfect blend of music discovery and concert booking with our premium features
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="group bg-white/5 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-white/10"
              >
                <div className="mb-6 text-violet-400 group-hover:text-violet-300 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-[ClashDisplay-Medium] mb-4 text-white group-hover:text-white/90">
                  {feature.title}
                </h3>
                <p className="text-zinc-400 group-hover:text-zinc-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chart Box */}
      <ChartBox 
        title="Global Charts"
        subtitle="Trending Now"
        description="Discover what's hot in music right now. Updated daily with the latest trends and hits from around the world."
        buttonText="Explore Charts"
      />

      <Footer />
    </div>
  );
};

export default Home; 