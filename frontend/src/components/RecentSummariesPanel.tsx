import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchSummaries } from '../store/slices/summarySlice';
import SummaryDetail from './SummaryDetail';
import type { Summary } from '../store/slices/summarySlice';

const RecentSummariesPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { summaries, loading, error } = useAppSelector(state => state.summary);
  const { user } = useAppSelector(state => state.user);
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);
  const [showAllModal, setShowAllModal] = useState(false);
  const [allSummariesLoaded, setAllSummariesLoaded] = useState(false);

  useEffect(() => {
    dispatch(fetchSummaries({ limit: 3 }));
  }, [dispatch]);

  // Fetch all summaries when opening the modal (if not already loaded)
  const handleShowAll = async () => {
    setShowAllModal(true);
    if (!allSummariesLoaded) {
      await dispatch(fetchSummaries({ limit: 1000 })); // Fetch a large number for demo; use pagination for real apps
      setAllSummariesLoaded(true);
    }
  };

  const handleSummaryClick = (summary: Summary) => {
    setSelectedSummary(summary);
  };

  // const canEdit = (summary: Summary) => {
  //   if (!user) return false;
  //   return (
  //     user.role === 'admin' ||
  //     user.role === 'editor' ||
  //     user.id === (typeof summary.userId === 'string' ? summary.userId : summary.userId._id)
  //   );
  // };
  // const canDelete = canEdit;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h3 className="font-semibold text-lg mb-4 text-black">Recent Summaries</h3>
      {loading && <div className="text-gray-500 mb-2">Loading...</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <ul className="mb-4">
        {summaries.slice(0, 3).map((summary) => (
          <li key={summary._id} className="mb-2 cursor-pointer flex justify-between items-center hover:bg-gray-100 p-2 rounded-md" onClick={() => handleSummaryClick(summary)}>
            <div>
              <div className="font-medium text-gray-800 truncate max-w-xs" title={summary.prompt}>{summary.prompt || 'Untitled Summary'}</div>
              <div className="text-xs text-gray-500">
                {new Date(summary.createdAt).toLocaleString()} &mdash; {summary.wordCount.original} → {summary.wordCount.summary} words
              </div>
            </div>
            <div className="text-xs text-gray-700 font-semibold ml-4 whitespace-nowrap">
              {typeof summary.userId === 'object' ? (
                <>
                  {summary.userId.name}
                  {user && (user.id === summary.userId._id) && <span className="text-purple-600 font-normal"> (You)</span>}
                </>
              ) : 'Unknown User'}
            </div>
          </li>
        ))}
        {!loading && summaries.length === 0 && <li className="text-gray-500">No summaries found.</li>}
      </ul>
      <button
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded transition-colors"
        onClick={handleShowAll}
      >
        View All Summaries &rarr;
      </button>
      {showAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              onClick={() => { setShowAllModal(false); setSelectedSummary(null); }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">All Summaries</h2>
            <ul>
              {summaries.map((summary) => (
                <li
                  key={summary._id}
                  className="mb-2 p-2 rounded hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                  onClick={() => handleSummaryClick(summary)}
                >
                  <div>
                    <div className="font-medium text-gray-800 truncate" title={summary.prompt}>{summary.prompt || 'Untitled Summary'}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(summary.createdAt).toLocaleString()} &mdash; {summary.wordCount.original} → {summary.wordCount.summary} words
                    </div>
                  </div>
                  <div className="text-xs text-gray-700 font-semibold ml-4 whitespace-nowrap">
                    {typeof summary.userId === 'object' ? (
                      <>
                        {summary.userId.name}
                        {user && (user.id === summary.userId._id) && <span className="text-purple-600 font-normal"> (You)</span>}
                      </>
                    ) : 'Unknown User'}
                  </div>
                </li>
              ))}
              {summaries.length === 0 && <li className="text-gray-500">No summaries found.</li>}
            </ul>
          </div>
          {selectedSummary && (
            <SummaryDetail
              summary={selectedSummary}
              onClose={() => setSelectedSummary(null)}
              canEdit={!!user && (user.role === 'admin' || user.role === 'editor' || user.id === (typeof selectedSummary.userId === 'string' ? selectedSummary.userId : selectedSummary.userId._id))}
              canDelete={!!user && (user.role === 'admin' || user.role === 'editor' || user.id === (typeof selectedSummary.userId === 'string' ? selectedSummary.userId : selectedSummary.userId._id))}
            />
          )}
        </div>
      )}
      {selectedSummary && !showAllModal && (
        <SummaryDetail
          summary={selectedSummary}
          onClose={() => setSelectedSummary(null)}
          canEdit={!!user && (user.role === 'admin' || user.role === 'editor' || user.id === (typeof selectedSummary.userId === 'string' ? selectedSummary.userId : selectedSummary.userId._id))}
          canDelete={!!user && (user.role === 'admin' || user.role === 'editor' || user.id === (typeof selectedSummary.userId === 'string' ? selectedSummary.userId : selectedSummary.userId._id))}
        />
      )}
    </div>
  );
};

export default RecentSummariesPanel; 