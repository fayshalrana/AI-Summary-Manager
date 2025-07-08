import React from 'react';
import { FaRegCreditCard } from 'react-icons/fa';
import { useAppSelector } from '../store/hooks';

const Navbar: React.FC = () => {
  const { user } = useAppSelector(state => state.user);

  return (
    <nav className="w-full h-16 flex items-center justify-between px-8 bg-gradient-to-r from-purple-500 to-indigo-500 shadow text-white">
      <div className="flex items-center gap-2 text-2xl font-bold">
        <span className="inline-block w-6 h-6 bg-white rounded mr-2" />
        SmartBrief
      </div>
      <div className="flex items-center gap-6 text-lg font-semibold">
        <div className="flex items-center gap-2">
          <FaRegCreditCard className="text-white" />
          <span>{user?.credits ?? 0} Credits</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/80">Role:</span>
          <span className="capitalize">{user?.role ?? '-'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/80">Welcome,</span>
          <span>{user?.name ?? '-'}</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 