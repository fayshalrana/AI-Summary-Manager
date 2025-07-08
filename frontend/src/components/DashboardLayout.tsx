import React from 'react';
import Navbar from './Navbar';
import WelcomeHeader from './WelcomeHeader';
import StatsGrid from './StatsGrid';
import CreateSummaryPanel from './CreateSummaryPanel';
import RecentSummariesPanel from './RecentSummariesPanel';
import CreditManagementPanel from './CreditManagementPanel';

const DashboardLayout: React.FC = () => {
  // Placeholder stats
  const totalSummaries = 12;
  const creditsRemaining = 5;
  const timeSaved = '2.5h';
  const avgCompression = '75%';

  return (
    <div className="min-h-screen w-screen bg-gradient-to-b from-purple-100 to-blue-50 flex flex-col">
      <Navbar />
      <div className="max-w-screen mx-auto w-full px-4 flex-1">
        <WelcomeHeader />
        <StatsGrid
          totalSummaries={totalSummaries}
          creditsRemaining={creditsRemaining}
          timeSaved={timeSaved}
          avgCompression={avgCompression}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CreateSummaryPanel />
          </div>
          <div className="flex flex-col gap-8">
            <RecentSummariesPanel />
            <CreditManagementPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout; 