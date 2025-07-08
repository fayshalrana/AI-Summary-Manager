import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { getAllUsers, updateUserCredits } from '../store/slices/userSlice';
import type { User } from '../store/slices/userSlice';
import Navbar from './Navbar';
import WelcomeHeader from './WelcomeHeader';
import StatsGrid from './StatsGrid';
import CreateSummaryPanel from './CreateSummaryPanel';
import RecentSummariesPanel from './RecentSummariesPanel';
import CreditManagementPanel from './CreditManagementPanel';
import Sidebar from './Sidebar';

const DashboardLayout: React.FC = () => {
  const { user, users } = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditValue, setCreditValue] = useState(0);

  useEffect(() => {
    if (user?.role === 'admin') {
      dispatch(getAllUsers());
    }
  }, [user, dispatch]);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setCreditValue(user.credits);
    setShowCreditModal(true);
  };

  const handleCreditUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedUser) {
      await dispatch(updateUserCredits({ userId: selectedUser._id || selectedUser.id, credits: creditValue }));
      setShowCreditModal(false);
      setSelectedUser(null);
    }
  };

  // Placeholder stats
  const totalSummaries = 12;
  const creditsRemaining = user?.role === 'admin' ? Infinity : user?.credits ?? 0;
  const timeSaved = '2.5h';
  const avgCompression = '75%';

  return (
    <div className="min-h-screen w-screen bg-gradient-to-b from-purple-100 to-blue-50 flex flex-col">
      <Navbar />
      <div className="max-w-screen mx-auto w-full px-4 flex-1 flex">
        {user?.role === 'admin' && (
          <Sidebar onNavigate={setActiveSection} activeSection={activeSection} />
        )}
        <div className={user?.role === 'admin' ? 'flex-1 pl-8' : 'flex-1'}>
          <WelcomeHeader />
          <StatsGrid
            totalSummaries={totalSummaries}
            creditsRemaining={creditsRemaining}
            timeSaved={timeSaved}
            avgCompression={avgCompression}
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CreateSummaryPanel />
            </div>
            <div className="flex flex-col gap-8">
              <RecentSummariesPanel />
              {user?.role === 'admin' && users ? (
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                  <h3 className="font-semibold text-lg mb-4 text-black">All Users</h3>
                  <ul>
                    {users.filter(u => u.role !== 'admin').map(u => (
                      <li key={u._id || u.id} className="mb-2 flex justify-between items-center hover:bg-gray-100 p-2 rounded-md cursor-pointer" onClick={() => handleUserClick(u)}>
                        <p className='text-black font-bold'>{u.name}-{u.role} <span className="capitalize block font-normal">{u.email}</span></p>
                        <p className="text-sm text-gray-500">Credits: {u.credits}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <CreditManagementPanel />
              )}
            </div>
          </div>
        </div>
      </div>
      {showCreditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl p-1"
              onClick={() => { setShowCreditModal(false); setSelectedUser(null); }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-black">Update Credits for {selectedUser.name}</h2>
            <form onSubmit={handleCreditUpdate} className="flex flex-col gap-4">
              <label className="text-gray-700 font-medium">Credits</label>
              <input
                type="number"
                min={0}
                value={creditValue}
                onChange={e => setCreditValue(Number(e.target.value))}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Update Credits
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout; 