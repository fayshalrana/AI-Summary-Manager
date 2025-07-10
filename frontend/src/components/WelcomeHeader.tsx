import React from 'react';

const WelcomeHeader: React.FC = () => (
  <div className="text-center mt-10 mb-8">
    <h1 className="text-[50px] leading-[48px] lg:leading-[88px] md:text-[64px] font-bold mb-2 text-black">
      Welcome to <span className="text-purple-600">SmartBrief</span>
    </h1>
    <p className="text-lg text-gray-600 font-semibold">
      Transform lengthy content into concise, actionable summaries with AI
    </p>
  </div>
);

export default WelcomeHeader; 