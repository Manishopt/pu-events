import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { db } from '../config/firebase';
import { ref, onValue, push, set } from 'firebase/database';
import { FaCalendarAlt, FaCheckCircle, FaTimes, FaSignInAlt } from 'react-icons/fa';
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
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Upcoming Events</h2>
          {events.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">No events available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
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
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => showToast('Please login to register for events.', 'login')}
                          className="w-full px-4 py-3 bg-gray-400 text-white rounded-xl font-medium opacity-60 cursor-not-allowed shadow-md"
                        >
                          <FaSignInAlt className="inline mr-2" />
                          Login to Register
                        </button>
                        <p className="text-xs text-pu-blue-600 text-center font-medium">
                          Authentication required
                        </p>
                      </div>
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
              { icon: '🎯', title: 'Academic', desc: 'Workshops & Seminars' },
              { icon: '💼', title: 'Career', desc: 'Job Fairs & Placement' },
              { icon: '🎨', title: 'Cultural', desc: 'Music & Dance Events' },
              { icon: '🏆', title: 'Sports', desc: 'Competitions & Tournaments' }
            ].map((category, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.title}</h3>
                <p className="text-gray-600 text-sm">{category.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-6">Get notified about upcoming events and opportunities</p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200">
              Subscribe
            </button>
          </div>
        </div>
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
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          <div className="flex items-center">
            {toast.type === 'success' ? (
              <FaCheckCircle className="text-white mr-2" />
            ) : (
              <FaTimes className="text-white mr-2" />
            )}
            <p className="text-white font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
