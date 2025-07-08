import React from 'react';
import { FaRegCreditCard } from 'react-icons/fa';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/userSlice';

const Navbar: React.FC = () => {
  const { user } = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="w-full h-16 flex items-center justify-between px-8 bg-gradient-to-r from-purple-500 to-indigo-500 shadow text-white">
      <div className="flex items-center gap-2 text-2xl font-bold">
        <span className="inline-block w-6 h-6 bg-white rounded mr-2" />
        SmartBrief
      </div>
      <div className="flex items-center gap-6 text-lg font-semibold">
        <div className="flex items-center gap-2">
          <FaRegCreditCard className="text-white" />
          <span>
            {user?.role === 'admin' ? 'No Limit' : `${user?.credits ?? 0} Credits`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/80">Role:</span>
          <span className="capitalize">{user?.role ?? '-'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/80">Welcome,</span>
          <span>{user?.name ?? '-'}</span>
        </div>
        <button
          onClick={handleLogout}
          className="ml-4 px-4 py-1 bg-white/20 hover:bg-white/30 text-white rounded transition-colors text-base font-medium"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar; 