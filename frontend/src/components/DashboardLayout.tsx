import React, { useEffect, useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { getAllUsers, updateUserCredits, updateUserRole, clearJustRegistered } from '../store/slices/userSlice';
import { fetchSummaries } from '../store/slices/summarySlice';
import type { User } from '../store/slices/userSlice';
import type { Summary } from '../store/slices/summarySlice';
import toast from 'react-hot-toast';
import Navbar from './Navbar';
import WelcomeHeader from './WelcomeHeader';
import StatsGrid from './StatsGrid';
import CreateSummaryPanel from './CreateSummaryPanel';
import RecentSummariesPanel from './RecentSummariesPanel';
import Sidebar from './Sidebar';
import { HiX } from 'react-icons/hi';

const DashboardLayout: React.FC = () => {
  const { user, users, justRegistered } = useAppSelector(state => state.user);
  const { summaries, loading: summariesLoading } = useAppSelector(state => state.summary);
  const dispatch = useAppDispatch();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);
  const [creditValue, setCreditValue] = useState(0);
  const [roleValue, setRoleValue] = useState<'user' | 'editor' | 'reviewer'>('user');
  const hasShownWelcome = useRef(false);

  // Show welcome notification when user has just registered
  useEffect(() => {
    if (justRegistered && user && !hasShownWelcome.current) {
      hasShownWelcome.current = true;
      toast.success(
        `Welcome to SmartBrief, ${user.name}! 🎉\nYour account has been created successfully and you have ${user.credits} credits to start summarizing.`,
        {
          duration: 6000,
          style: {
            background: '#10B981',
            color: '#fff',
            fontSize: '14px',
            lineHeight: '1.5',
          },
        }
      );
      dispatch(clearJustRegistered());
    }
  }, [justRegistered, user]);

  // Reset the welcome flag when user changes (logout/login)
  useEffect(() => {
    if (!user) {
      hasShownWelcome.current = false;
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'admin') {
      dispatch(getAllUsers());
    }
  }, [user, dispatch]);


  // Initial fetch for dashboard stats
  useEffect(() => {
    if (user && !summaries.length) {
      dispatch(fetchSummaries({ limit: 100 }));
    }
  }, [user, dispatch, summaries.length]);

  useEffect(() => {
    if (showCreditModal && selectedUser && users) {
      const freshUser = users.find(u => (u._id || u.id) === (selectedUser._id || selectedUser.id));
      if (freshUser && freshUser.role !== roleValue) {
        setRoleValue(freshUser.role as 'user' | 'editor' | 'reviewer');
      }
    }
  }, [users, selectedUser, showCreditModal]);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setCreditValue(user.credits);
    setRoleValue(user.role as 'user' | 'editor' | 'reviewer');
    setShowCreditModal(true);
  };

  const handleSummaryClick = (summary: Summary) => {
    setSelectedSummary(summary);
    setShowSummaryModal(true);
  };

  const handleCreditUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedUser) {
      const loadingToast = toast.loading('Updating user information...');
      try {
        await dispatch(updateUserCredits({ userId: selectedUser._id || selectedUser.id, credits: creditValue }));
        if (selectedUser.role !== roleValue) {
          await dispatch(updateUserRole({ userId: selectedUser._id || selectedUser.id, role: roleValue }));
        }
        await dispatch(getAllUsers());
        toast.success('User information updated successfully!', { id: loadingToast });
        setShowCreditModal(false);
        setSelectedUser(null);
      } catch (error) {
        toast.error('Failed to update user information. Please try again.', { id: loadingToast });
      }
    }
  };

  // const handleRoleUpdate = async (user: User, newRole: 'user' | 'admin' | 'editor' | 'reviewer') => {
  //   if ((user._id || user.id) && user.role !== newRole) {
  //     await dispatch(updateUserRole({ userId: user._id || user.id, role: newRole }));
  //   }
  // };

  // Calculate stats from actual data
  const totalSummaries = summaries?.length || 0;
  const creditsRemaining = user?.role === 'admin' ? Infinity : user?.credits ?? 0;
  
  // Calculate time saved based on average processing time

  const timeSavedMs = summaries?.reduce((total, summary) => {
    const originalWords = summary.wordCount.original;
    const summaryWords = summary.wordCount.summary;
    return total + ((originalWords - summaryWords) * 2000);
  }, 0) || 0;
  const timeSaved = timeSavedMs > 0 ? `${Math.round(timeSavedMs / 1000 / 60)}m` : '0m';
  
  // Calculate average compression ratio
  const totalCompression = summaries?.reduce((total, summary) => {
    const originalWords = summary.wordCount.original;
    const summaryWords = summary.wordCount.summary;
    if (originalWords > 0) {
      return total + ((originalWords - summaryWords) / originalWords) * 100;
    }
    return total;
  }, 0) || 0;
  const avgCompression = summaries?.length ? `${Math.round(totalCompression / summaries.length)}%` : '0%';

  return (
    <div className="min-h-screen w-screen bg-gradient-to-b from-purple-100 to-blue-50 flex flex-col">
      <Navbar />
      <div className="max-w-screen mx-auto w-full flex-1 flex">
        {user?.role === 'admin' && (
          <Sidebar onNavigate={setActiveSection} activeSection={activeSection} />
        )}
        <div className={user?.role === 'admin' ? 'flex-1 pr-8 pl-[250px]' : 'flex-1 px-8'}>
          <WelcomeHeader />
          <StatsGrid
            totalSummaries={totalSummaries}
            creditsRemaining={creditsRemaining}
            timeSaved={timeSaved}
            avgCompression={avgCompression}
          />
          
          {activeSection === 'dashboard' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <CreateSummaryPanel />
              </div>
              <div className="flex flex-col gap-8">
                <RecentSummariesPanel />
              </div>
            </div>
          ) : activeSection === 'accounts' && user?.role === 'admin' ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <div className="text-sm text-gray-500">
                  Total Users: {users?.filter(u => u.role !== 'admin').length || 0}
                </div>
              </div>
              
              {users ? (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Credits
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.filter(u => u.role !== 'admin').map((userItem, index) => (
                        <tr key={userItem._id || userItem.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-purple-600">
                                    {userItem.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                                <div className="text-sm text-gray-500">ID: {userItem._id || userItem.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{userItem.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              userItem.role === 'admin' ? 'bg-red-100 text-red-800' :
                              userItem.role === 'editor' ? 'bg-blue-100 text-blue-800' :
                              userItem.role === 'reviewer' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {userItem.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">{userItem.credits}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleUserClick(userItem)}
                              className="text-white hover:text-red-700 border-transparent bg-purple-50 hover:!bg-purple-200 px-3 py-1 focus:outline-none transition-colors transition-transform duration-300 ease-in-out !border-2 hover:!border-red-800"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500">Loading users...</div>
                </div>
              )}
            </div>
          ) : activeSection === 'history' ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Summary History</h2>
                <div className="text-sm text-gray-500">
                  Total Summaries: {summaries?.length || 0}
                </div>
              </div>
              
              {summariesLoading ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">Loading summaries...</div>
                </div>
              ) : summaries ? (
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Summary
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Word Count
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Provider
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {summaries.map((summary, index) => {
                        const userName = typeof summary.userId === 'object' ? summary.userId.name : 'Unknown User';
                        const userEmail = typeof summary.userId === 'object' ? summary.userId.email : 'Unknown Email';
                        
                        return (
                          <tr 
                            key={summary._id} 
                            className={`hover:bg-gray-50 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                            onClick={() => handleSummaryClick(summary)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <span className="text-sm font-medium text-purple-600">
                                      {userName.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{userName}</div>
                                  <div className="text-sm text-gray-500">{userEmail}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate" title={summary.summary}>
                                {summary.summary}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                <div>Original: {summary.wordCount.original}</div>
                                <div>Summary: {summary.wordCount.summary}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                summary.aiProvider === 'openai' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {summary.aiProvider}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(summary.createdAt).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(summary.createdAt).toLocaleTimeString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                summary.status === 'completed' ? 'bg-green-100 text-green-800' :
                                summary.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {summary.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500">No summaries found</div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <CreateSummaryPanel />
              </div>
              <div className="flex flex-col gap-8">
                <RecentSummariesPanel />
              </div>
            </div>
          )}
        </div>
      </div>
      {showCreditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 relative">
            <button
              className="absolute top-5 right-2 text-white hover:text-red-700 border-transparent bg-purple-50 hover:!bg-red-200 px-3 py-1 focus:outline-none transition-colors transition-transform duration-300 ease-in-out !border-2 hover:!border-red-800"
              onClick={() => { setShowCreditModal(false); setSelectedUser(null); }}
              aria-label="Close"
            >
              <HiX />
            </button>
            <h2 className="text-xl font-bold mb-4 text-black">Update C&R for {selectedUser?.name}</h2>
            <form onSubmit={handleCreditUpdate} className="flex flex-col gap-4">
              <label className="text-gray-700 font-medium">Credits</label>
              <input
                type="number"
                min={0}
                value={creditValue}
                onChange={e => setCreditValue(Number(e.target.value))}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
              <label className="text-gray-700 font-medium">Role</label>
              <select
                value={roleValue}
                onChange={e => setRoleValue(e.target.value as 'user' | 'editor' | 'reviewer')}
                className="border border-gray-300 rounded px-2 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">User</option>
                <option value="editor">Editor</option>
                <option value="reviewer">Reviewer</option>
              </select>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Update
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Summary Details Modal */}
      {showSummaryModal && selectedSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Summary Details</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Created by {typeof selectedSummary.userId === 'object' ? selectedSummary.userId.name : 'Unknown User'}
                </p>
              </div>
              <button
                className="text-white hover:text-red-700 text-2xl p-1 hover:!bg-red-100 focus:outline-none transition-colors transition-transform duration-300 ease-in-out hover:!border-2 hover:!border-red-800"
                onClick={() => { setShowSummaryModal(false); setSelectedSummary(null); }}
                aria-label="Close"
              >
                <HiX/>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Original Words</div>
                  <div className="text-2xl font-bold text-gray-900">{selectedSummary.wordCount.original}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Summary Words</div>
                  <div className="text-2xl font-bold text-gray-900">{selectedSummary.wordCount.summary}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Compression Ratio</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(((selectedSummary.wordCount.original - selectedSummary.wordCount.summary) / selectedSummary.wordCount.original) * 100)}%
                  </div>
                </div>
              </div>

              {/* AI Provider Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Provider Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Provider</div>
                    <div className="font-medium text-gray-900 capitalize">{selectedSummary.aiProvider}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Model</div>
                    <div className="font-medium text-gray-900">{selectedSummary.model}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Processing Time</div>
                    <div className="font-medium text-gray-900">{selectedSummary.processingTime}ms</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Credits Used</div>
                    <div className="font-medium text-gray-900">{selectedSummary.creditsUsed}</div>
                  </div>
                </div>
              </div>

              {/* Prompt */}
              {selectedSummary.prompt && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Prompt Used</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedSummary.prompt}</p>
                  </div>
                </div>
              )}

              {/* Original Text */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Original Text</h3>
                <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto custom-scrollbar">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedSummary.originalText}</p>
                </div>
              </div>

              {/* Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Generated Summary</h3>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedSummary.summary}</p>
                </div>
              </div>

              {/* Metadata */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Metadata</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(selectedSummary.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Updated:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(selectedSummary.updatedAt).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedSummary.status === 'completed' ? 'bg-green-100 text-green-800' :
                      selectedSummary.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedSummary.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">ID:</span>
                    <span className="ml-2 text-gray-900 font-mono text-xs">{selectedSummary._id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout; 