import React, { useState } from 'react';

interface SummarizationPanelProps {
  onSummarize: (input: string) => void;
  summary: string;
  loading: boolean;
}

/**
 * SummarizationPanel provides a UI for inputting text/URL and displaying the summary result.
 * @param onSummarize - Handler to trigger summarization
 * @param summary - The summary result to display
 * @param loading - Whether summarization is in progress
 */
const SummarizationPanel: React.FC<SummarizationPanelProps> = ({ onSummarize, summary, loading }) => {
  const [input, setInput] = useState('');

  const handleSummarize = (e: React.FormEvent) => {
    e.preventDefault();
    onSummarize(input);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
      <form onSubmit={handleSummarize} className="flex flex-col gap-4">
        <textarea
          className="w-full p-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="Paste text or URL to summarize..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          disabled={loading || !input.trim()}
        >
          {loading ? 'Summarizing...' : 'Summarize'}
        </button>
      </form>
      {summary && (
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-900 rounded text-gray-800 dark:text-gray-100">
          <h3 className="font-semibold mb-2">Summary:</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
};

export default SummarizationPanel; 