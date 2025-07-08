import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateSummary, deleteSummary } from '../store/slices/summarySlice';
import type { Summary } from '../store/slices/summarySlice';
import LoadingSpinner from './LoadingSpinner';

interface SummaryDetailProps {
  summary: Summary;
  onClose: () => void;
  canEdit: boolean;
  canDelete: boolean;
}

const SummaryDetail = ({ summary, onClose, canEdit, canDelete }: SummaryDetailProps) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.summary);
  const { user } = useAppSelector(state => state.user);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    prompt: summary.prompt,
    provider: summary.aiProvider,
    model: summary.model
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = async () => {
    await dispatch(updateSummary({
      summaryId: summary._id,
      prompt: editData.prompt,
      provider: editData.provider as 'openai' | 'gemini',
      model: editData.model
    }));
    
    if (!error) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this summary? This action cannot be undone.')) {
      await dispatch(deleteSummary(summary._id));
      if (!error) {
        onClose();
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatProcessingTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Summary Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Statistics</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Original:</span> {summary.wordCount.original} words</p>
                <p><span className="font-medium">Summary:</span> {summary.wordCount.summary} words</p>
                {summary.compressionRatio && (
                  <p><span className="font-medium">Compression:</span> {summary.compressionRatio}%</p>
                )}
                <p><span className="font-medium">Credits Used:</span> {summary.creditsUsed}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">AI Information</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Provider:</span> {summary.aiProvider}</p>
                <p><span className="font-medium">Model:</span> {summary.model}</p>
                <p><span className="font-medium">Processing Time:</span> {formatProcessingTime(summary.processingTime)}</p>
                <p><span className="font-medium">Status:</span> <span className="capitalize">{summary.status}</span></p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Timestamps</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Created:</span> {formatDate(summary.createdAt)}</p>
                <p><span className="font-medium">Updated:</span> {formatDate(summary.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Original Text */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Original Text</h3>
            <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{summary.originalText}</p>
            </div>
          </div>

          {/* Summary */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Summary</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-800 whitespace-pre-wrap">{summary.summary}</p>
            </div>
          </div>

          {/* Prompt */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Prompt Used</h3>
            {isEditing ? (
              <textarea
                name="prompt"
                value={editData.prompt}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">{summary.prompt}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Close
            </button>

            {canEdit && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
              >
                {isEditing ? 'Cancel Edit' : 'Edit'}
              </button>
            )}

            {isEditing && (
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Updating...' : 'Update Summary'}
              </button>
            )}

            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryDetail; 