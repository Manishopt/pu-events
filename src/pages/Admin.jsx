import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { auth, db, googleProvider, storage } from '../config/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, push, set, update, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FaPlus, FaEdit, FaTrash, FaUsers, FaCalendarAlt, FaChartLine, FaCog, FaSignInAlt, FaSearch, FaDownload, FaChevronDown, FaChevronRight, FaUpload, FaImage } from 'react-icons/fa';

const Admin = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: '',
    eligibility: '',
    time: '',
    venue: '',
    cost: 'Free',
    category: 'academic'
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.email.endsWith('@poornima.edu.in')) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch events from Firebase
  useEffect(() => {
    if (user) {
      const eventsRef = ref(db, 'events');
      const unsubscribe = onValue(eventsRef, (snapshot) => {
        const eventsData = snapshot.val();
        if (eventsData) {
          const eventsList = Object.entries(eventsData).map(([id, event]) => ({
            id,
            ...event
          }));
          setEvents(eventsList);

          // Fetch registrations for each event
          eventsList.forEach(event => {
            const regRef = ref(db, `registrations/${event.id}`);
            onValue(regRef, (regSnapshot) => {
              const regData = regSnapshot.val();
              setRegistrations(prev => ({
                ...prev,
                [event.id]: regData ? [regData] : []
              }));
            });
          });
        } else {
          setEvents([]);
          setRegistrations({});
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  // Google Sign In
  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (!result.user.email.endsWith('@poornima.edu.in')) {
        await signOut(auth);
        alert('Only Poornima University (@poornima.edu.in) emails are allowed to access admin panel.');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Failed to sign in. Please try again.');
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Create Event
  const handleCreateEvent = async (e) => {
    e.preventDefault();

    try {
      const eventData = {
        ...formData,
        image: '🎯',
        createdAt: new Date().toISOString(),
        createdBy: user.email
      };

      const eventsRef = ref(db, 'events');
      const newEventRef = push(eventsRef);
      await set(newEventRef, eventData);

      // Reset form
      setFormData({
        title: '',
        date: '',
        description: '',
        eligibility: '',
        time: '',
        venue: '',
        cost: 'Free',
        category: 'academic'
      });

      setShowCreateForm(false);
      alert('Event created successfully!');
    } catch (error) {
      console.error('Create event error:', error);
      alert('Failed to create event. Please try again.');
    }
  };

  // Toggle event expansion
  const toggleEventExpansion = (eventId) => {
    setExpandedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  // Filter events based on selected event
  const filteredEvents = selectedEvent === 'all'
    ? events
    : events.filter(event => event.id === selectedEvent);

  // Get all registrations for display in table format
  const getAllRegistrations = () => {
    const allRegs = [];
    filteredEvents.forEach(event => {
      const eventRegs = registrations[event.id] || [];
      eventRegs.forEach(reg => {
        if (reg && (
          !searchTerm ||
          reg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.regNo?.toLowerCase().includes(searchTerm.toLowerCase())
        )) {
          allRegs.push({
            ...reg,
            eventTitle: event.title,
            eventId: event.id
          });
        }
      });
    });
    return allRegs;
  };

  // Export to CSV
  const exportToCSV = () => {
    const data = getAllRegistrations();
    const csvContent = [
      ['Name', 'Email', 'Registration Number', 'Event', 'Registration Date'],
      ...data.map(reg => [
        reg.name || '',
        reg.email || '',
        reg.regNo || '',
        reg.eventTitle || '',
        reg.registeredAt ? new Date(reg.registeredAt).toLocaleDateString() : ''
      ])
    ];

    const csvString = csvContent.map(row =>
      row.map(field => `"${field}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvString], { type: 'text/csv UNITEDStates:windows-1252' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Toast notification helper
  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Handle file upload to Firebase Storage
  const uploadImage = async (file) => {
    if (!file) return null;

    try {
      const fileRef = storageRef(storage, `events/${Date.now()}_${file.name}`);
      setUploadProgress(10);

      const snapshot = await uploadBytes(fileRef, file);
      setUploadProgress(50);

      const downloadURL = await getDownloadURL(snapshot.ref);
      setUploadProgress(100);

      showToast('Image uploaded successfully!', 'success');
      return downloadURL;
    } catch (error) {
      console.error('Image upload error:', error);
      showToast('Failed to upload image. Please try again.', 'error');
      return null;
    } finally {
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // Handle Edit Event
  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      date: event.date || '',
      description: event.description || '',
      eligibility: event.eligibility || '',
      time: event.time || '',
      venue: event.venue || '',
      cost: event.cost || 'Free',
      category: event.category || 'academic'
    });
    setShowCreateForm(true);
  };

  // Handle Update Event
  const handleUpdateEvent = async (e) => {
    e.preventDefault();

    try {
      const updatedEvent = {
        ...formData,
        updatedAt: new Date().toISOString(),
        updatedBy: user.email,
        // Keep original createdAt and createdBy
        createdAt: editingEvent.createdAt,
        createdBy: editingEvent.createdBy
      };

      const eventRef = ref(db, `events/${editingEvent.id}`);
      await update(eventRef, updatedEvent);

      // Reset form and editing state
      setFormData({
        title: '',
        date: '',
        description: '',
        eligibility: '',
        time: '',
        venue: '',
        cost: 'Free',
        category: 'academic'
      });
      setShowCreateForm(false);
      setEditingEvent(null);

      showToast('Event updated successfully!', 'success');
    } catch (error) {
      console.error('Update event error:', error);
      showToast('Failed to update event. Please try again.', 'error');
    }
  };

  // Handle Delete Event
  const handleDeleteEvent = async (eventId, eventTitle) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${eventTitle}"?\n\nThis will also delete all registrations for this event.`
    );

    if (!confirmDelete) return;

    try {
      // Delete the event
      const eventRef = ref(db, `events/${eventId}`);
      await remove(eventRef);

      // Delete all registrations for this event
      const registrationsRef = ref(db, `registrations/${eventId}`);
      await remove(registrationsRef);

      showToast('Event and all registrations deleted successfully!', 'success');
    } catch (error) {
      console.error('Delete event error:', error);
      showToast('Failed to delete event. Please try again.', 'error');
    }
  };

  // Handle file selection and upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      showToast('Image size should be less than 10MB.', 'error');
      return;
    }

    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      setFormData({ ...formData, image: imageUrl });
    }
  };

  // Determine if we're creating or editing
  const isEditing = editingEvent !== null;

  // Update form submission handler
  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (isEditing) {
      handleUpdateEvent(e);
    } else {
      handleCreateEvent(e);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen pt-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pu-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Not Authenticated - Login Required
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen pt-24">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🔐</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h1>
              <p className="text-gray-600">
                Only Poornima University staff with @poornima.edu.in emails can access this admin panel.
              </p>
            </div>
            <button
              onClick={handleSignIn}
              className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-lg font-medium"
            >
              <FaSignInAlt />
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Panel
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        {/* Admin Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🔧 Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.displayName}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            <span>Sign Out</span>
          </button>
        </div>

        {/* Create Event Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium"
          >
            <FaPlus />
            <span>{showCreateForm ? 'Cancel' : 'Create New Event'}</span>
          </button>
        </div>

        {/* Create/Edit Event Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {isEditing ? 'Edit Event' : 'Create New Event'}
            </h2>

            {/* Upload Progress Bar */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mb-4">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">Uploading image...</p>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Event Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Event description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
              </div>

              {/* Event Banner Upload */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Banner Image (Optional)
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200">
                    <FaUpload />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {formData.image && (
                    <div className="flex items-center space-x-2">
                      <FaImage className="text-green-500" />
                      <span className="text-sm text-gray-600">Image uploaded</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Eligibility</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., All students, Final year students"
                  value={formData.eligibility}
                  onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
                <input
                  type="text"
                  required
                  placeholder="Venue location"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="academic">Academic</option>
                  <option value="career">Career</option>
                  <option value="cultural">Cultural</option>
                  <option value="sports">Sports</option>
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingEvent(null);
                    setFormData({
                      title: '',
                      date: '',
                      description: '',
                      eligibility: '',
                      time: '',
                      venue: '',
                      cost: 'Free',
                      category: 'academic'
                    });
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isEditing ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search & Filter Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search Input */}
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or registration number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Event Filter */}
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-48"
              >
                <option value="all">All Events</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <FaDownload />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Students Registration Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Student Registrations</h2>
            <p className="text-sm text-gray-600 mt-1">
              {getAllRegistrations().length} total registrations
              {searchTerm && ` (filtered by "${searchTerm}")`}
            </p>
          </div>

          {getAllRegistrations().length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">
                {searchTerm ? 'No registrations match your search.' : 'No registrations yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration Number
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getAllRegistrations().map((reg, index) => (
                    <tr key={`${reg.userId || index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{reg.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{reg.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {reg.regNo}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{reg.eventTitle}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(reg.registeredAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Collapsible Events View */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Events Overview</h2>
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleEventExpansion(event.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {expandedEvents.includes(event.id) ? (
                        <FaChevronDown className="text-blue-500" />
                      ) : (
                        <FaChevronRight className="text-blue-500" />
                      )}
                      <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        event.category === 'academic' ? 'bg-blue-100 text-blue-800' :
                        event.category === 'career' ? 'bg-green-100 text-green-800' :
                        event.category === 'cultural' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {event.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        Registrations: {registrations[event.id]?.length || 0}
                      </span>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEvent(event);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Event"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event.id, event.title);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Event"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div><strong>Date:</strong> {event.date}</div>
                    <div><strong>Time:</strong> {event.time}</div>
                    <div><strong>Venue:</strong> {event.venue}</div>
                  </div>
                </div>

                {expandedEvents.includes(event.id) && (
                  <div className="border-t border-gray-200 p-6">
                    <p className="text-gray-600 mb-4">{event.description}</p>
                    <p className="text-sm text-gray-500 mb-4">
                      <strong>Eligibility:</strong> {event.eligibility}
                    </p>

                    {/* Event Registrations */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">
                        Registered Students ({registrations[event.id]?.length || 0})
                      </h4>

                      {registrations[event.id] && registrations[event.id].length > 0 ? (
                        registrations[event.id].map((reg, index) => (
                          <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900">{reg.name}</div>
                              <div className="text-sm text-gray-600">{reg.email}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-mono bg-white px-2 py-1 rounded border">
                                {reg.regNo}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {new Date(reg.registeredAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600 italic text-center p-4">
                          No registrations for this event yet.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 animate-fade-in">
          <div className={`flex items-center ${toast.type === 'success' ? 'text-white' :
            toast.type === 'error' ? 'text-white' :
            'text-gray-900'}`}
            style={{
              backgroundColor: toast.type === 'success' ? '#10b981' :
                               toast.type === 'error' ? '#ef4444' :
                               '#ffffff'
            }}>
            {toast.type === 'success' ? (
              <FaCheckCircle className="text-white mr-2" />
            ) : toast.type === 'error' ? (
              <FaTimes className="text-white mr-2" />
            ) : (
              <FaSignInAlt className="text-blue-500 mr-2" />
            )}
            <p className="font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
