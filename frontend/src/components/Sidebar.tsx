import React from 'react';
import { FaTachometerAlt, FaHistory, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/userSlice';

interface SidebarProps {
  onNavigate: (section: string) => void;
  activeSection: string;
}

const navItems = [
  { label: 'Dashboard', icon: <FaTachometerAlt />, section: 'dashboard' },
  { label: 'History', icon: <FaHistory />, section: 'history' },
  { label: 'Accounts', icon: <FaUser />, section: 'accounts' },
];

/**
 * Sidebar provides navigation for the dashboard sections.
 * @param onNavigate - Handler for navigation item clicks
 * @param activeSection - Currently active section
 */
const Sidebar: React.FC<SidebarProps> = ({ onNavigate, activeSection }) => {
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <aside className="bg-white dark:bg-gray-900 shadow-lg h-screen w-56 flex flex-col py-8 px-4">
      <div className="flex flex-col gap-4">
        {navItems.map(item => (
          <button
            key={item.section}
            onClick={() => onNavigate(item.section)}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-lg font-medium transition-colors
              ${activeSection === item.section ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </button>
        ))}
        
        {/* Logout button for admin users */}
        <div className="mt-auto pt-8 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-lg font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors w-full"
          >
            <span className="text-xl"><FaSignOutAlt /></span>
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 