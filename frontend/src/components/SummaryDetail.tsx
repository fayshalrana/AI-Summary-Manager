import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateSummary, deleteSummary } from '../store/slices/summarySlice';
import type { Summary } from '../store/slices/summarySlice';
import toast from 'react-hot-toast';
// import LoadingSpinner from './LoadingSpinner';

interface SummaryDetailProps {
  summary: Summary;
  onClose: () => void;
  canEdit: boolean;
  canDelete: boolean;
}

const SummaryDetail = ({ summary, onClose, canEdit, canDelete }: SummaryDetailProps) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.summary);
  // const { user } = useAppSelector(state => state.user);

  // Show error toast when there's an error
  React.useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
    const loadingToast = toast.loading('Updating summary...');
    try {
      const result = await dispatch(updateSummary({
        summaryId: summary._id,
        prompt: editData.prompt,
        provider: editData.provider as 'openai' | 'gemini',
        model: editData.model
      }));
      if (result.meta && result.meta.requestStatus === 'fulfilled') {
        toast.success('Summary updated successfully!', { id: loadingToast });
        setIsEditing(false);
      } else {
        toast.error('Failed to update summary. Please try again.', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Failed to update summary. Please try again.', { id: loadingToast });
    }
  };

  const handleDelete = async () => {
    const loadingToast = toast.loading('Deleting summary...');
    try {
      const result = await dispatch(deleteSummary(summary._id));
      if (result.meta && result.meta.requestStatus === 'fulfilled') {
        toast.success('Summary deleted successfully!', { id: loadingToast });
        setShowDeleteModal(false);
        onClose();
      } else {
        toast.error('Failed to delete summary. Please try again.', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Failed to delete summary. Please try again.', { id: loadingToast });
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
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Summary Details
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-red-700 border-transparent bg-purple-50 hover:!bg-red-200 px-3 py-1 focus:outline-none transition-colors transition-transform duration-300 ease-in-out !border-2 hover:!border-red-800 !py-[8px] !px-[8px]"
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
                <p className='text-black'><span className="font-medium">Original:</span> {summary.wordCount.original} words</p>
                <p className='text-black'><span className="font-medium">Summary:</span> {summary.wordCount.summary} words</p>
                {summary.compressionRatio && (
                  <p className='text-black'><span className="font-medium">Compression:</span> {summary.compressionRatio}%</p>
                )}
                <p className='text-black'><span className="font-medium">Credits Used:</span> {summary.creditsUsed}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">AI Information</h3>
              <div className="space-y-1 text-sm">
                <p className='text-black'><span className="font-medium">Provider:</span> {summary.aiProvider}</p>
                <p className='text-black'><span className="font-medium">Model:</span> {summary.model}</p>
                <p className='text-black'><span className="font-medium">Processing Time:</span> {formatProcessingTime(summary.processingTime)}</p>
                <p className='text-black'><span className="font-medium">Status:</span> <span className="capitalize">{summary.status}</span></p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Timestamps</h3>
              <div className="space-y-1 text-sm">
                <p className='text-black'><span className="font-medium">Created:</span> {formatDate(summary.createdAt)}</p>
                <p className='text-black'><span className="font-medium">Updated:</span> {formatDate(summary.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Original Text */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Original Text</h3>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-300 max-h-40 overflow-y-auto custom-scrollbar">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{summary.originalText}</p>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="flex items-center mb-3">
              <h3 className="font-semibold text-gray-900 mr-2">Summary</h3>
              <button
                type="button"
                className="ml-auto px-2 py-1 text-xs bg-blue-100 text-white rounded hover:bg-blue-200 transition-colors"
                onClick={() => {
                  if (navigator && navigator.clipboard) {
                    navigator.clipboard.writeText(summary.summary);
                    toast.success('Summary copied to clipboard!');
                  }
                }}
                title="Copy summary to clipboard"
              >
                Copy
              </button>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-gray-300">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
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
              className="text-white hover:text-purple-700 border-transparent bg-purple-50 hover:!bg-purple-200 px-3 py-1 focus:outline-none transition-colors transition-transform duration-300 ease-in-out !border-2 hover:!border-purple-800"
            >
              Close
            </button>

            {canEdit && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-white hover:text-red-700 border-transparent bg-purple-50 hover:!bg-purple-200 px-3 py-1 focus:outline-none transition-colors transition-transform duration-300 ease-in-out !border-2 hover:!border-red-800"
              >
                {isEditing ? 'Cancel Edit' : 'Edit'}
              </button>
            )}

            {isEditing && (
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="text-white hover:text-green-700 border-transparent bg-purple-50 hover:!bg-green-200 px-3 py-1 focus:outline-none transition-colors transition-transform duration-300 ease-in-out !border-2 hover:!border-green-800"
              >
                {loading ? 'Updating...' : 'Update Summary'}
              </button>
            )}

            {canDelete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={loading}
                className="text-white hover:text-red-700 border-transparent bg-purple-50 hover:!bg-red-200 px-3 py-1 focus:outline-none transition-colors transition-transform duration-300 ease-in-out !border-2 hover:!border-red-800"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Delete Summary</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete this summary? This action will permanently remove the summary and cannot be undone.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-white hover:text-red-700 border-transparent bg-purple-50 hover:!bg-purple-200 px-3 py-1 focus:outline-none transition-colors transition-transform duration-300 ease-in-out !border-2 hover:!border-red-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 text-white hover:text-red-700 border-transparent bg-purple-50 hover:!bg-red-200 px-3 py-1 focus:outline-none transition-colors transition-transform duration-300 ease-in-out !border-2 hover:!border-red-800"
              >
                {loading ? 'Deleting...' : 'Delete Summary'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryDetail; 