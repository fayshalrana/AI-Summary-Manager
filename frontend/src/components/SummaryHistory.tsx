import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchSummaries, deleteSummary, setCurrentSummary } from '../store/slices/summarySlice';
import type { Summary } from '../store/slices/summarySlice';
import LoadingSpinner from "./LoadingSpinner.tsx";
import SummaryDetail from './SummaryDetail';

const SummaryHistory = () => {
  const dispatch = useAppDispatch();
  const { summaries, pagination, loading, error } = useAppSelector(state => state.summary);
  const { user } = useAppSelector(state => state.user);

  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch all summaries for all users, regardless of role
    dispatch(fetchSummaries({ page: currentPage, search: searchTerm }));
  }, [dispatch, currentPage, searchTerm]);

  const handleViewSummary = (summary: Summary) => {
    setSelectedSummary(summary);
    setShowDetail(true);
  };

  const handleEditSummary = (summary: Summary) => {
    setSelectedSummary(summary);
    setShowDetail(true);
  };

  const handleDeleteSummary = async (summaryId: string) => {
    if (window.confirm('Are you sure you want to delete this summary?')) {
      await dispatch(deleteSummary(summaryId));
    }
  };

  const canEditSummary = (summary: Summary) => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'editor') return true;
    if (user.role === 'reviewer') return false;
    // user.role === 'user'
    return summary.userId === user.id || (typeof summary.userId === 'object' && summary.userId._id === user.id);
  };

  const canDeleteSummary = (summary: Summary) => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'editor') return true;
    if (user.role === 'reviewer') return false;
    // user.role === 'user'
    return summary.userId === user.id || (typeof summary.userId === 'object' && summary.userId._id === user.id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading summaries: {error}</p>
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No summaries found. Create your first summary to get started!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Search summaries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {pagination && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination.hasNext}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Summaries List */}
      <div className="space-y-4">
        {summaries.map((summary) => (
          <div
            key={summary._id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Summary #{summary._id.slice(-6)}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Original:</span> {summary.wordCount.original} words
                  </p>
                  <p>
                    <span className="font-medium">Summary:</span> {summary.wordCount.summary} words
                    {summary.compressionRatio && (
                      <span className="text-blue-600 ml-2">
                        ({summary.compressionRatio}% compression)
                      </span>
                    )}
                  </p>
                  <p>
                    <span className="font-medium">Provider:</span> {summary.aiProvider === 'gemini' ? 'Gemini' : summary.aiProvider}
                  </p>
                  <p>
                    <span className="font-medium">Created:</span> {formatDate(summary.createdAt)}
                  </p>
                  <p>
                    <span className="font-medium">Credits Used:</span> {summary.creditsUsed}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleViewSummary(summary)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  View
                </button>
                
                {canEditSummary(summary) && (
                  <button
                    onClick={() => handleEditSummary(summary)}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Edit
                  </button>
                )}
                
                {canDeleteSummary(summary) && (
                  <button
                    onClick={() => handleDeleteSummary(summary._id)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            {/* Preview of summary */}
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-700 line-clamp-3">
                {summary.summary}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Detail Modal */}
      {showDetail && selectedSummary && (
        <SummaryDetail
          summary={selectedSummary}
          onClose={() => {
            setShowDetail(false);
            setSelectedSummary(null);
          }}
          canEdit={canEditSummary(selectedSummary)}
          canDelete={canDeleteSummary(selectedSummary)}
        />
      )}
    </div>
  );
};

export default SummaryHistory; 