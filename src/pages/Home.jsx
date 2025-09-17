import React, { useState } from 'react';
import { FaGlobe, FaInstagram, FaLinkedinIn, FaCheck, FaEnvelope, FaPaperPlane } from 'react-icons/fa';
import Navbar from '../components/Navbar';

const Home = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();

    if (!email) {
      alert('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    // Simulate API call (replace with actual newsletter service)
    setTimeout(() => {
      setIsSubscribed(true);
      setIsLoading(false);

      // Reset after success message
      setTimeout(() => {
        setEmail('');
        setIsSubscribed(false);
      }, 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section - Full Width */}
      <section
        className="w-full relative flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "linear-gradient(135deg, rgba(37, 99, 235, 0.4), rgba(29, 78, 216, 0.3)), url('https://images.unsplash.com/photo-1598939647269-34394e6ab9a7?ixlib=rb-4.0.3&fit=crop&w=1920&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative z-10 text-center px-6 max-w-6xl mx-auto w-full animate-fade-in">
          {/* University Name */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-8 bg-gradient-to-r from-blue-400 via-pu-primary to-pu-secondary bg-clip-text text-transparent leading-tight drop-shadow-permanent">
            Poornima University
          </h1>
          {/* Subtitle */}
          <p className="text-lg md:text-xl lg:text-2xl text-gray-200 font-medium mb-16 leading-relaxed max-w-4xl mx-auto drop-shadow-permanent animate-slide-up">
            Stay Updated with Workshops, Seminars & Events
          </p>
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center max-w-2xl mx-auto animate-scale-in">
            <a
              href="/events"
              className="w-full sm:w-auto px-12 py-6 bg-blue-600 text-white font-bold text-lg rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 border-2 border-blue-400 hover:border-blue-300 text-center font-semibold animate-pulse"
            >
              📅 View Events
            </a>
            <a
              href="/admin"
              className="w-full sm:w-auto px-12 py-6 bg-white text-pu-blue-800 font-bold text-lg rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 border-2 border-gray-300 hover:border-pu-primary text-center font-semibold"
            >
              🔐 Admin Login
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Poornima University?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Empowering minds through innovative education and enriching experiences.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-5xl mb-4">🎓</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Education</h3>
              <p className="text-gray-600">World-class faculty and modern facilities for exceptional learning.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Diverse Programs</h3>
              <p className="text-gray-600">Wide range of undergraduate and graduate programs to choose from.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-5xl mb-4">🌟</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Innovation Hub</h3>
              <p className="text-gray-600">Center for creativity, research, and technological advancement.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Stay Updated <FaPaperPlane className="inline ml-2" />
          </h2>
          <p className="text-xl mb-8 text-white max-w-2xl mx-auto">
            Get notified about upcoming events and opportunities at Poornima University
          </p>

          {/* Subscription Form */}
          <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <FaEnvelope className="absolute left-4 top-4 text-gray-400 z-10" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 rounded-lg transition-all duration-300 ${
                    isSubscribed
                      ? 'bg-green-100 text-green-600 border border-green-300'
                      : 'text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-white'
                  }`}
                  disabled={isSubscribed || isLoading}
                  required
                />
                {isSubscribed && (
                  <FaCheck className="absolute right-4 top-4 text-green-500" />
                )}
              </div>
              <button
                type="submit"
                disabled={isSubscribed || isLoading}
                className={`px-8 py-4 rounded-lg font-semibold transition-all duration-300 ${
                  isSubscribed
                    ? 'bg-green-500 text-white cursor-not-allowed'
                    : isLoading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-white text-blue-600 hover:bg-gray-100 hover:shadow-lg'
                } transform hover:scale-105`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Subscribing...
                  </div>
                ) : isSubscribed ? (
                  <div className="flex items-center">
                    <FaCheck className="mr-2" />
                    Subscribed!
                  </div>
                ) : (
                  <div className="flex items-center">
                    Subscribe
                    <FaPaperPlane className="ml-2" />
                  </div>
                )}
              </button>
            </div>
            <p className="text-white text-sm mt-4 opacity-90">
              We respect your privacy. No spam, only relevant updates about events and opportunities.
            </p>
          </form>
        </div>
      </section>

      {/* Footer - Full Width, Dark Background, React Icons */}
      <footer className="w-full bg-gray-900 text-white py-16 mt-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold mb-4">Poornima University</h3>
              <p className="text-gray-400 leading-relaxed">
                Empowering students with quality education and innovative learning experiences.
              </p>
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <a href="/events" className="block text-gray-400 hover:text-white transition-colors duration-200">Events</a>
                <a href="/admin" className="block text-gray-400 hover:text-white transition-colors duration-200">Admin Portal</a>
              </div>
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <div className="flex justify-center md:justify-start space-x-4">
                <a
                  href="https://www.poornima.edu.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-all duration-200 transform hover:scale-110 group"
                  aria-label="Official Website"
                >
                  <FaGlobe className="w-6 h-6" />
                  <span className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">Official Website</span>
                </a>
                <a
                  href="https://instagram.com/poornima_university"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center hover:from-pink-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-110 group"
                  aria-label="Instagram"
                >
                  <FaInstagram className="w-6 h-6" />
                  <span className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">Instagram</span>
                </a>
                <a
                  href="https://www.linkedin.com/school/poornima-university/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-800 transition-all duration-200 transform hover:scale-110 group"
                  aria-label="LinkedIn"
                >
                  <FaLinkedinIn className="w-6 h-6" />
                  <span className="absolute bottom-full mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-700 text-center">
            <p className="text-gray-400">&copy; 2025 Poornima University. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
