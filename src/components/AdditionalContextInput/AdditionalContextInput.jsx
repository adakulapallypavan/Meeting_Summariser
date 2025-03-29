import React from 'react';

function AdditionalContextInput({ additionalContext, setAdditionalContext }) {
  return (
    <div className="rounded-xl p-4 md:p-6 mb-8">
      <label className="block text-gray-900 font-medium mb-2 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-indigo-600">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        Additional Context <span className="text-gray-500 text-sm ml-1">(optional)</span>
      </label>
      
      <div className="mb-4">
        <textarea
          className="w-full px-4 py-2 border border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none rounded-lg shadow-sm transition-all duration-200"
          placeholder="Enter any additional details you want to include in the summary..."
          value={additionalContext}
          onChange={(e) => setAdditionalContext(e.target.value)}
          rows={3}
        />
      </div>
      
      <div className="text-indigo-800/60 text-sm">
        <p>Provide any additional context that might help with generating a more accurate meeting summary.</p>
        <p className="mt-1">Examples: meeting purpose, project background, special topics discussed.</p>
      </div>
    </div>
  );
}

export default AdditionalContextInput; 