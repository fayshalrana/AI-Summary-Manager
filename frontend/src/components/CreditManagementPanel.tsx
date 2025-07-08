import React from 'react';

const CreditManagementPanel: React.FC = () => {
  const creditsRemaining = 5;
  const usedThisMonth = 7;
  const totalCredits = 12;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h3 className="font-semibold text-lg mb-4 text-black">Credit Management</h3>
      <div className="flex flex-col gap-2 text-gray-700">
        <div className="flex justify-between">
          <span>Credits Remaining</span>
          <span className="font-bold">{creditsRemaining}</span>
        </div>
        <div className="flex justify-between">
          <span>Used this month</span>
          <span className="font-bold">{usedThisMonth}</span>
        </div>
        <div className="flex justify-between">
          <span>Total credits</span>
          <span className="font-bold">{totalCredits}</span>
        </div>
      </div>
    </div>
  );
};

export default CreditManagementPanel; 