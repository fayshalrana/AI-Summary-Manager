import React from 'react';
import { FaRegCreditCard } from 'react-icons/fa';

interface NavbarProps {
  credits: number;
}

const Navbar: React.FC<NavbarProps> = ({ credits }) => {
  return (
    <nav className="w-full h-16 flex items-center justify-between px-8 bg-gradient-to-r from-purple-500 to-indigo-500 shadow text-white">
      <div className="flex items-center gap-2 text-2xl font-bold">
        <span className="inline-block w-6 h-6 bg-white rounded mr-2" />
        SmartBrief
      </div>
      <div className="flex items-center gap-2 text-lg font-semibold">
        <FaRegCreditCard className="text-white" />
        <span>{credits} Credits</span>
      </div>
    </nav>
  );
};

export default Navbar; 