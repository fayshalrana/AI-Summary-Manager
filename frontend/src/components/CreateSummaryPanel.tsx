import React, { useState } from 'react';

const TABS = [
  { label: 'Text Input', value: 'text' },
  { label: 'File Upload', value: 'file' },
];

const CreateSummaryPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('text');
  const [prompt, setPrompt] = useState('');
  const [content, setContent] = useState('');

  const handleTabClick = (tab: string) => setActiveTab(tab);
  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: trigger summary generation
    alert('Summary generated!');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex gap-6 border-b mb-4">
        {TABS.map(tab => (
          <button
            key={tab.value}
            className={`pb-2 px-2 border-b-2 font-medium transition-colors ${activeTab === tab.value ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-purple-600'}`}
            onClick={() => handleTabClick(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>
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
          <input
            type="file"
            className="w-full p-2 rounded border border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
            // Placeholder: handle file upload
          />
        )}
        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50"
          disabled={activeTab === 'text' ? !content.trim() : false}
        >
          Generate Summary (1 Credit)
        </button>
      </form>
    </div>
  );
};

export default CreateSummaryPanel; 