import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getCurrentUser } from '../store/slices/userSlice';
import { fetchSummaries, fetchAIModels, fetchFileTypes } from '../store/slices/summarySlice';
import Header from './Header';
import AuthForm from './AuthForm';
import SummaryHistory from './SummaryHistory';
import CreateSummary from './CreateSummary';
import LoadingSpinner from './LoadingSpinner';

const SmartBriefApp = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading: authLoading, user } = useAppSelector(state => state.user);
  const { loading: summaryLoading } = useAppSelector(state => state.summary);

  useEffect(() => {
    // Check if user is authenticated on app load
    if (isAuthenticated) {
      dispatch(getCurrentUser());
      dispatch(fetchSummaries());
      dispatch(fetchAIModels());
      dispatch(fetchFileTypes());
    }
  }, [dispatch, isAuthenticated]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">SmartBrief</h1>
              <p className="text-gray-600">AI-Powered Text Summarization</p>
            </div>
            <AuthForm />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Summary</h2>
              <CreateSummary />
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Summary History</h2>
              {summaryLoading ? (
                <LoadingSpinner />
              ) : (
                <SummaryHistory />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Info</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Name:</span>
                  <p className="font-medium">{user?.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Email:</span>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Role:</span>
                  <p className="font-medium capitalize">{user?.role}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Credits:</span>
                  <p className="font-medium text-blue-600">{user?.credits}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Total Summaries:</span>
                  <span className="font-medium">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">This Month:</span>
                  <span className="font-medium">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Credits Used:</span>
                  <span className="font-medium">-</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartBriefApp; 