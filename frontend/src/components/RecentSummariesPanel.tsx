import React from 'react';

const recentSummaries = [
  {
    title: 'Market Research Report',
    time: '2 hours ago',
    words: '1,200 → 300 words',
  },
  {
    title: 'Technical Documentation',
    time: '1 day ago',
    words: '800 → 200 words',
  },
  {
    title: 'News Article Analysis',
    time: '2 days ago',
    words: '1,500 → 400 words',
  },
];

const RecentSummariesPanel: React.FC = () => (
  <div className="bg-white rounded-lg shadow p-6 mb-8">
    <h3 className="font-semibold text-lg mb-4">Recent Summaries</h3>
    <ul className="mb-4">
      {recentSummaries.map((summary, idx) => (
        <li key={idx} className="mb-2">
          <div className="font-medium text-gray-800">{summary.title}</div>
          <div className="text-xs text-gray-500">{summary.time} &mdash; {summary.words}</div>
        </li>
      ))}
    </ul>
    <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded transition-colors">
      View All Summaries &rarr;
    </button>
  </div>
);

export default RecentSummariesPanel; 