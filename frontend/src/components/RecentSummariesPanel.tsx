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

  useEffect(() => {
    dispatch(fetchSummaries({ limit: 3 }));
  }, [dispatch]);

  const handleSummaryClick = (summary: Summary) => {
    setSelectedSummary(summary);
  };

  const canEdit = (summary: Summary) => {
    if (!user) return false;
    return (
      user.role === 'admin' ||
      user.role === 'editor' ||
      user.id === (typeof summary.userId === 'string' ? summary.userId : summary.userId._id)
    );
  };
  const canDelete = canEdit;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h3 className="font-semibold text-lg mb-4">Recent Summaries</h3>
      {loading && <div className="text-gray-500 mb-2">Loading...</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <ul className="mb-4">
        {summaries.slice(0, 3).map((summary) => (
          <li key={summary._id} className="mb-2 cursor-pointer" onClick={() => handleSummaryClick(summary)}>
            <div className="font-medium text-gray-800 truncate max-w-xs" title={summary.prompt}>{summary.prompt || 'Untitled Summary'}</div>
            <div className="text-xs text-gray-500">
              {new Date(summary.createdAt).toLocaleString()} &mdash; {summary.wordCount.original} → {summary.wordCount.summary} words
            </div>
          </li>
        ))}
        {!loading && summaries.length === 0 && <li className="text-gray-500">No summaries found.</li>}
      </ul>
      <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded transition-colors">
        View All Summaries &rarr;
      </button>
      {selectedSummary && (
        <SummaryDetail
          summary={selectedSummary}
          onClose={() => setSelectedSummary(null)}
          canEdit={canEdit(selectedSummary)}
          canDelete={canDelete(selectedSummary)}
        />
      )}
    </div>
  );
};

export default RecentSummariesPanel; 