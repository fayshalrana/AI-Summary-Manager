import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createSummaryFromText, createSummaryFromFile, fetchAIModels, fetchFileTypes } from '../store/slices/summarySlice';
import { clearError } from '../store/slices/summarySlice';
import LoadingSpinner from './LoadingSpinner';

const CreateSummary = () => {
  const dispatch = useAppDispatch();
  const { loading, error, aiModels, supportedFileTypes } = useAppSelector(state => state.summary);
  const { user } = useAppSelector(state => state.user);

  const [inputMethod, setInputMethod] = useState<'text' | 'file'>('text');
  const [formData, setFormData] = useState({
    text: '',
    prompt: 'Summarize the following text in a clear and concise manner:',
    provider: 'openai' as 'openai' | 'gemini',
    model: 'gpt-3.5-turbo'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    dispatch(fetchAIModels());
    dispatch(fetchFileTypes());
  }, [dispatch]);

  useEffect(() => {
    // Update model when provider changes
    if (formData.provider === 'openai') {
      setFormData(prev => ({ ...prev, model: 'gpt-3.5-turbo' }));
    } else {
      setFormData(prev => ({ ...prev, model: 'gemini-pro' }));
    }
  }, [formData.provider]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) {
      dispatch(clearError());
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
    
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (inputMethod === 'text') {
      if (!formData.text.trim()) {
        return;
      }
      await dispatch(createSummaryFromText(formData));
    } else {
      if (!selectedFile) {
        return;
      }
      await dispatch(createSummaryFromFile({
        file: selectedFile,
        prompt: formData.prompt,
        provider: formData.provider,
        model: formData.model
      }));
    }

    // Reset form on success
    if (!error) {
      setFormData({
        text: '',
        prompt: 'Summarize the following text in a clear and concise manner:',
        provider: 'openai',
        model: 'gpt-3.5-turbo'
      });
      setSelectedFile(null);
    }
  };

  const getAvailableModels = () => {
    if (!aiModels) return [];
    return aiModels[formData.provider] || [];
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Input Method Toggle */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setInputMethod('text')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              inputMethod === 'text'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Text Input
          </button>
          <button
            type="button"
            onClick={() => setInputMethod('file')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              inputMethod === 'file'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            File Upload
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Text Input */}
        {inputMethod === 'text' && (
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
              Text to Summarize
            </label>
            <textarea
              id="text"
              name="text"
              value={formData.text}
              onChange={handleInputChange}
              required
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter the text you want to summarize..."
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.text.length} characters, {formData.text.split(/\s+/).filter(word => word.length > 0).length} words
            </p>
          </div>
        )}

        {/* File Upload */}
        {inputMethod === 'file' && (
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
              Upload File
            </label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              accept=".txt,.docx"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
            {supportedFileTypes && (
              <p className="text-sm text-gray-500 mt-1">
                Supported formats: {supportedFileTypes.map(t => t.extension).join(', ')}
              </p>
            )}
          </div>
        )}

        {/* Custom Prompt */}
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
            Custom Prompt (Optional)
          </label>
          <textarea
            id="prompt"
            name="prompt"
            value={formData.prompt}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter a custom prompt for summarization..."
          />
        </div>

        {/* AI Provider Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-2">
              AI Provider
            </label>
            <select
              id="provider"
              name="provider"
              value={formData.provider}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="openai">OpenAI</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
              Model
            </label>
            <select
              id="model"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {getAvailableModels().map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Credit Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800">
                <strong>Cost:</strong> 1 credit per summarization
              </p>
              <p className="text-sm text-blue-600">
                Your current balance: <strong>{user?.credits} credits</strong>
              </p>
            </div>
            {user && user.credits < 1 && (
              <div className="text-red-600 text-sm font-medium">
                Insufficient credits
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || user?.credits < 1 || (inputMethod === 'text' && !formData.text.trim()) || (inputMethod === 'file' && !selectedFile)}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <LoadingSpinner />
              <span className="ml-2">Creating Summary...</span>
            </div>
          ) : (
            'Create Summary'
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateSummary; 