import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSignInAlt, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, login, logout } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleAuth = async () => {
    if (user) {
      // Sign out
      const result = await logout();
      if (result.success) {
        navigate('/');
        closeMenu();
      } else {
        alert('Logout failed. Please try again.');
      }
    } else {
      // Sign in
      const result = await login();
      if (result.success) {
        closeMenu();
      } else {
        alert(result.error || 'Login failed. Please try again.');
      }
    }
  };

  // Don't render anything while auth is loading
  if (loading) {
    return null;
  }

  const navLinks = [
    { to: '/', label: 'Home', icon: '🏛' },
    { to: '/events', label: 'Events', icon: '📅' },
    { to: '/admin', label: 'Admin', icon: '⚙' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="w-full bg-pu-blue-600 bg-pu-gradient shadow-pu-lg sticky top-0 z-50 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo/University Name */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-white font-bold text-xl hover:text-blue-200 transition-colors duration-200">
              🎓 Poornima University
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? 'bg-white bg-opacity-20 text-white shadow-lg'
                    : 'text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}

            {/* Auth Section */}
            {user ? (
              <div className="flex items-center space-x-3">
                {/* User Profile Picture */}
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-8 h-8 rounded-full border-2 border-white"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
                    <FaUser className="text-white text-sm" />
                  </div>
                )}

                {/* Logout Button */}
                <button
                  onClick={handleAuth}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleAuth}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200"
              >
                <FaSignInAlt />
                <span>Login with Google</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-white hover:text-blue-200 p-2 transition-colors duration-200"
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 shadow-lg">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMenu}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isActive(link.to)
                      ? 'bg-white bg-opacity-20 text-white shadow-lg'
                      : 'text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}

              {/* Mobile Auth Section */}
              {user ? (
                <div className="flex items-center space-x-3 px-4 py-3">
                  {/* User Profile Picture */}
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full border-2 border-white"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
                      <FaUser className="text-white text-sm" />
                    </div>
                  )}

                  {/* Logout Button */}
                  <button
                    onClick={handleAuth}
                    className="flex items-center space-x-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAuth}
                  className="flex items-center space-x-3 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-200 w-full text-left"
                >
                  <FaSignInAlt />
                  <span>Login with Google</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
