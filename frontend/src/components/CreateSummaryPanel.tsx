import React, { useState, useRef, useEffect } from 'react';
import type { DragEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createSummaryFromText, createSummaryFromFile } from '../store/slices/summarySlice';
import type { Summary } from '../store/slices/summarySlice';

const TABS = [
  { label: 'Text Input', value: 'text' },
  { label: 'File Upload', value: 'file' },
];

const CreateSummaryPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('text');
  const [prompt, setPrompt] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<Summary | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dispatch = useAppDispatch();
  const { loading, error, currentSummary } = useAppSelector(state => state.summary);

  // Show popup when summary is generated successfully
  useEffect(() => {
    if (currentSummary && !loading) {
      setGeneratedSummary(currentSummary);
      setShowSummaryModal(true);
    }
  }, [currentSummary, loading]);

  const handleTabClick = (tab: string) => setActiveTab(tab);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'text') {
      if (!content.trim()) return;
      await dispatch(createSummaryFromText({ text: content, prompt: prompt.trim() || undefined, provider: 'gemini' }));
      setContent('');
      setPrompt('');
    } else if (activeTab === 'file' && file) {
      await dispatch(createSummaryFromFile({ file, prompt: prompt.trim() || undefined, provider: 'gemini' }));
      setFile(null);
      setPrompt('');
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      setFile(droppedFiles[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex gap-6 border-b mb-4">
        {TABS.map(tab => (
          <button
            key={tab.value}
            className={`pb-2 px-2 border-b-2 font-medium transition-colors ${activeTab === tab.value ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-purple-600 text-white'}`}
            onClick={() => handleTabClick(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {error && (
        <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">{error}</div>
      )}
      <form onSubmit={handleGenerate} className="flex flex-col gap-4">
        <input
          type="text"
          className="w-full p-2 rounded border border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="e.g., Summarize this in 3 bullet points focusing on key insights"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
        {activeTab === 'text' ? (
          <textarea
            className="w-full p-3 rounded border border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
            rows={5}
            placeholder="Paste your content here..."
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        ) : (
          <div className="w-full">
            {!file ? (
              <div
                className={`w-full p-8 border-2 border-dashed rounded-lg text-center transition-all duration-200 cursor-pointer ${
                  isDragOver
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isDragOver ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    <svg className={`w-6 h-6 ${isDragOver ? 'text-purple-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      {isDragOver ? 'Drop your file here' : 'Drag and drop your file here'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">or click to browse</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    Supports: .DOCX, .TXT (Max 10MB)
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
            />
          </div>
        )}
        <button
          type="submit"
          className="bg-black hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
          disabled={loading || (activeTab === 'text' ? !content.trim() : !file)}
        >
          {loading ? 'Generating...' : 'Generate Summary (1 Credit)'}
        </button>
      </form>
      
      {/* Generated Summary Modal */}
      {showSummaryModal && generatedSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Summary Generated Successfully!</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Your summary has been created and saved
                </p>
              </div>
              <button
                className="text-gray-500 hover:text-gray-700 text-2xl p-1"
                onClick={() => { setShowSummaryModal(false); setGeneratedSummary(null); }}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Original Words</div>
                  <div className="text-2xl font-bold text-gray-900">{generatedSummary.wordCount.original}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Summary Words</div>
                  <div className="text-2xl font-bold text-gray-900">{generatedSummary.wordCount.summary}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Compression Ratio</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(((generatedSummary.wordCount.original - generatedSummary.wordCount.summary) / generatedSummary.wordCount.original) * 100)}%
                  </div>
                </div>
              </div>

              {/* AI Provider Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Provider Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Provider</div>
                    <div className="font-medium text-gray-900 capitalize">{generatedSummary.aiProvider}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Model</div>
                    <div className="font-medium text-gray-900">{generatedSummary.model}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Processing Time</div>
                    <div className="font-medium text-gray-900">{generatedSummary.processingTime}ms</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Credits Used</div>
                    <div className="font-medium text-gray-900">{generatedSummary.creditsUsed}</div>
                  </div>
                </div>
              </div>

              {/* Prompt Used */}
              {generatedSummary.prompt && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Prompt Used</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{generatedSummary.prompt}</p>
                  </div>
                </div>
              )}

              {/* Original Text */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Original Text</h3>
                <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto custom-scrollbar">
                  <p className="text-gray-700 whitespace-pre-wrap">{generatedSummary.originalText}</p>
                </div>
              </div>

              {/* Generated Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Generated Summary</h3>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{generatedSummary.summary}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => { setShowSummaryModal(false); setGeneratedSummary(null); }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedSummary.summary);
                    // You could add a toast notification here
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                >
                  Copy Summary
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateSummaryPanel; 