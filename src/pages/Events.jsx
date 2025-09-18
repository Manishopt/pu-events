import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { db } from '../config/firebase';
import { ref, onValue, push, set } from 'firebase/database';
import { FaCalendarAlt, FaCheckCircle, FaTimes, FaSignInAlt, FaEnvelope, FaPaperPlane, FaCheck } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    regNo: ''
  });
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Fetch events from Firebase
  useEffect(() => {
    const eventsRef = ref(db, 'events');

    const unsubscribe = onValue(eventsRef, (snapshot) => {
      const eventsData = snapshot.val();
      if (eventsData) {
        const eventsList = Object.entries(eventsData).map(([id, event]) => ({
          id,
          ...event
        }));
        setEvents(eventsList);
      } else {
        // Load sample events if none exist
        setSampleEvents();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setSampleEvents = () => {
    const sampleEvents = [
      {
        id: '1',
        title: 'AI & Machine Learning Workshop',
        description: 'Dive deep into the world of AI and ML with hands-on projects and expert guidance from industry professionals.',
        date: 'Dec 15, 2024',
        time: '2:00 PM',
        venue: 'Computer Lab 101',
        eligibility: 'All students',
        category: 'academic',
        cost: 'Free',
        image: '🎯'
      },
      {
        id: '2',
        title: 'Career Guidance Seminar',
        description: 'Get insights on career paths, job market trends, and interview tips from successful alumni.',
        date: 'Dec 20, 2024',
        time: '10:00 AM',
        venue: 'Auditorium',
        eligibility: 'Final year students',
        category: 'career',
        cost: 'Free',
        image: '�'
      },
      {
        id: '3',
        title: 'Cultural Dance Competition',
        description: 'Showcase your talent in traditional and contemporary dance forms with exciting prizes.',
        date: 'Dec 25, 2024',
        time: '6:00 PM',
        venue: 'Main Stage',
        eligibility: 'All students',
        category: 'cultural',
        cost: '$5',
        image: '🎨'
      }
    ];

    // Save sample events to Firebase
    const eventsRef = ref(db, 'events');
    sampleEvents.forEach(event => {
      const newEventRef = push(eventsRef);
      set(newEventRef, event);
    });

    setEvents(sampleEvents);
  };

  const handleRegister = (event) => {
    if (!isAuthenticated) {
      // Redirect to login or show message
      showToast('Please login to register for events.', 'login');
      setTimeout(() => {
        navigate('/');
      }, 2000);
      return;
    }

    setSelectedEvent(event);

    // Pre-fill form with Google Auth data
    if (user) {
      setFormData({
        name: user.displayName || '',
        email: user.email || '',
        regNo: ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        regNo: ''
      });
    }

    setIsModalOpen(true);
  };

  const checkExistingRegistration = async (eventId, userId) => {
    return new Promise((resolve) => {
      const registrationRef = ref(db, `registrations/${eventId}`);
      onValue(registrationRef, (snapshot) => {
        const registrations = snapshot.val();
        if (registrations && registrations[userId]) {
          // User is already registered
          resolve(true);
        } else {
          resolve(false);
        }
      }, { onlyOnce: true });
    });
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();

    try {
      // Generate user ID from auth
      const userId = user?.uid || Date.now().toString();

      // Check if user is already registered
      const alreadyRegistered = await checkExistingRegistration(selectedEvent.id, userId);

      if (alreadyRegistered) {
        showToast('You are already registered for this event!', 'error');
        return;
      }

      // Save registration with proper userId
      const registrationRef = ref(db, `registrations/${selectedEvent.id}/${userId}`);

      const registrationData = {
        ...formData,
        userId: userId,
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        googleAuthUser: user ? true : false,
        registeredAt: new Date().toISOString()
      };

      await set(registrationRef, registrationData);

      // Show success toast
      showToast('Registration successful! Check your email for confirmation.', 'success');

      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        regNo: ''
      });
      setIsModalOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Registration error:', error);
      showToast('Registration failed. Please try again.', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    const timeout = type === 'login' ? 2000 : 3000; // Shorter duration for login redirect
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, timeout);
  };

  const formFields = [
    { name: 'name', type: 'text', placeholder: 'Full Name', label: 'Name' },
    { name: 'email', type: 'email', placeholder: 'youremail@pu.edu.in', label: 'Email' },
    { name: 'regNo', type: 'text', placeholder: '2024/19029', label: 'Registration Number' }
  ];

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

  // Filter events by category
  const getFilteredEvents = () => {
    if (selectedCategory === 'all') {
      return events;
    }
    return events.filter(event => event.category?.toLowerCase() === selectedCategory.toLowerCase());
  };

  const handleCategoryClick = (categoryTitle) => {
    if (categoryTitle === 'Academic') {
      setSelectedCategory('academic');
    } else if (categoryTitle === 'Career') {
      setSelectedCategory('career');
    } else if (categoryTitle === 'Cultural') {
      setSelectedCategory('cultural');
    } else if (categoryTitle === 'Sports') {
      setSelectedCategory('sports');
    }
  };

  const getCategoryName = () => {
    if (selectedCategory === 'all') return '';
    if (selectedCategory === 'academic') return 'Academic';
    if (selectedCategory === 'career') return 'Career';
    if (selectedCategory === 'cultural') return 'Cultural';
    if (selectedCategory === 'sports') return 'Sports';
    return '';
  };

  if (loading) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
        <div className="flex items-center justify-center min-h-screen pt-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 pt-24">
        <div className="text-center mb-12 bg-gradient-to-r from-pu-blue-50 to-white rounded-3xl p-12 shadow-pu-lg">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-poppins">
            📅 University Events
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Stay updated with the latest workshops, seminars, conferences, and cultural events at Poornima University.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <div className="bg-pu-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              {events.length} Events Available
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="mb-16">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {selectedCategory === 'all' ? 'Upcoming Events' : `${getCategoryName()} Events`}
            </h2>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <span>Show All Events</span>
                <span className="text-lg">←</span>
              </button>
            )}
          </div>
          {getFilteredEvents().length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">
                {selectedCategory === 'all'
                  ? 'No events available at the moment.'
                  : `No ${getCategoryName().toLowerCase()} events available.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {getFilteredEvents().map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl shadow-pu-lg hover:shadow-pu-xl transition-all duration-300 overflow-hidden hover:scale-105 transform animate-fade-in border border-gray-200"
                >
                  <div className="h-48 bg-pu-gradient flex items-center justify-center relative overflow-hidden">
                    {event.image && event.image.startsWith('http') ? (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : (
                      <span className="text-7xl opacity-90">{event.image}</span>
                    )}
                    <div className="absolute bottom-4 left-4">
                      <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-xs font-medium">
                        📅 {event.date}
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 font-poppins">{event.title}</h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">{event.description}</p>
                    <div className="flex items-center text-sm text-pu-blue-600 mb-4 font-medium">
                      <span>👥 {event.eligibility}</span>
                    </div>

                    {isAuthenticated ? (
                      <button
                        onClick={() => handleRegister(event)}
                        className="w-full px-6 py-3 bg-pu-gradient text-white rounded-xl hover:bg-pu-secondary transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Register Now
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          showToast('Redirecting to login...', 'info');
                          setTimeout(() => {
                            navigate('/admin');
                          }, 1000);
                        }}
                        className="w-full px-4 py-3 bg-pu-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <FaSignInAlt className="inline mr-2" />
                        Login to Register
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categories Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Event Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🎯', title: 'Academic', desc: 'Workshops & Seminars', key: 'academic' },
              { icon: '💼', title: 'Career', desc: 'Job Fairs & Placement', key: 'career' },
              { icon: '🎨', title: 'Cultural', desc: 'Music & Dance Events', key: 'cultural' },
              { icon: '🏆', title: 'Sports', desc: 'Competitions & Tournaments', key: 'sports' }
            ].map((category, index) => (
              <div
                key={index}
                onClick={() => handleCategoryClick(category.title)}
                className={`text-center p-6 rounded-xl shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category.key
                    ? 'bg-blue-500 text-white shadow-xl ring-2 ring-blue-300'
                    : 'bg-white hover:shadow-xl border-2 hover:border-blue-200'
                }`}
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className={`text-lg font-semibold mb-2 ${
                  selectedCategory === category.key ? 'text-white' : 'text-gray-900'
                }`}>
                  {category.title}
                </h3>
                <p className={`text-sm ${
                  selectedCategory === category.key ? 'text-blue-100' : 'text-gray-600'
                }`}>
                  {category.desc}
                </p>
              </div>
            ))}
          </div>
          {selectedCategory !== 'all' && (
            <div className="text-center mt-6">
              <button
                onClick={() => setSelectedCategory('all')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                🏠 View All Events
              </button>
            </div>
          )}
        </div>

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
      </div>

      {/* Modal */}
      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Register for Event</h2>
            <p className="text-gray-600 mb-4">Event: {selectedEvent.title}</p>

            <form onSubmit={handleSubmitRegistration} className="space-y-4">
              {formFields.map((field) => (
                <div key={field.name}>
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <input
                    id={field.name}
                    type={field.type}
                    required
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>
              ))}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-500' :
          toast.type === 'error' ? 'bg-red-500' :
          toast.type === 'info' ? 'bg-blue-500' :
          'bg-gray-500'
        }`}>
          <div className="flex items-center">
            {toast.type === 'success' ? (
              <FaCheckCircle className="text-white mr-2" />
            ) : toast.type === 'error' ? (
              <FaTimes className="text-white mr-2" />
            ) : toast.type === 'info' ? (
              <FaSignInAlt className="text-white mr-2" />
            ) : (
              <span className="text-white mr-2">ℹ️</span>
            )}
            <p className="text-white font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
