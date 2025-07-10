import React, { useState, useRef, useEffect } from 'react';
import { FaRegCreditCard, FaSignOutAlt } from 'react-icons/fa';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { FaUserNinja } from "react-icons/fa6";
import { logout } from '../store/slices/userSlice';
import toast from 'react-hot-toast';

const Navbar: React.FC = () => {
  const { user } = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    toast.success('Logged out successfully!');
    dispatch(logout());
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <nav className="sticky top-0 z-50 w-full h-16 flex items-center justify-between px-4 md:px-8 bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg text-white">
      <div className="flex items-center gap-2 text-[20px] md:text-2xl font-bold">
        <img src="/smartbrief-logo-purple.png" alt="SmartBrief Logo" className="w-[30px] h-[30px] md:w-10 md:h-10" />
        <p>Smart<span className="text-black">Brief</span></p>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Credits Display */}
        {user?.role !== 'admin' && (
        <div className="flex items-center gap-2">
          <FaRegCreditCard className="text-white hidden md:block" />
          <span className="text-sm md:text-base">
            ${user?.credits ?? 0} Credits
          </span>
        </div>
        )}

        {/* User Dropdown */}
        <div ref={dropdownRef} className="relative">
          {/* User Icon Button */}
          <button 
            onClick={toggleDropdown}
            className="flex items-center justify-center w-10 h-10 !bg-white hover:!bg-black group rounded-full !p-0 focus:outline-none focus:rign-0 border-none focus:shadow-none transition-all duration-300 ease-in-out"
          >
           <FaUserNinja className='text-black w-7 h-7 group-hover:text-white'/>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-lg">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{user?.name || 'User'}</div>
                    <div className="text-sm text-gray-500">{user?.email || 'user@example.com'}</div>
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div className="px-4 py-2">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium text-gray-900 capitalize">{user?.role || 'user'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Credits:</span>
                    <span className="font-medium text-gray-900">
                      {user?.role === 'admin' ? 'Unlimited' : `${user?.credits || 0}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Member since:</span>
                    <span className="font-medium text-gray-900">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              {user?.role !== 'admin' && (
                <div className="px-4 py-2 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-left text-white rounded-md transition-colors duration-300 hover:scale-95 transition-all"
                  >
                    <FaSignOutAlt className="text-purple-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 