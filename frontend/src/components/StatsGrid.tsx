import React from 'react';

interface StatsGridProps {
  totalSummaries: number;
  creditsRemaining: number;
  timeSaved: string;
  avgCompression: string;
}

/**
 * StatsGrid displays user statistics in a dashboard grid.
 */
const StatsGrid: React.FC<StatsGridProps> = ({ totalSummaries, creditsRemaining, timeSaved, avgCompression }) => {
  const stats = [
    { label: 'Total Summaries', value: totalSummaries, color: 'border-blue-400' },
    { label: 'Credits Remaining', value: creditsRemaining, color: 'border-orange-400' },
    { label: 'Time Saved', value: timeSaved, color: 'border-green-400' },
    { label: 'Avg. Compression', value: avgCompression, color: 'border-purple-400' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`bg-white rounded-lg shadow p-6 flex flex-col items-center border-t-4 ${stat.color}`}
        >
          <span className="text-gray-500 text-sm mb-1">{stat.label}</span>
          <span className="text-2xl font-bold text-gray-800">
            {stat.label === 'Credits Remaining' && stat.value === Infinity ? 'Unlimited' : stat.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid; 