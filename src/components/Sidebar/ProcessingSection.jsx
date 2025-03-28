import React from 'react';

function ProcessingSection() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
        Processing Long Recordings
      </h2>
      <p className="text-sm text-gray-300 mb-4">For meetings longer than 15 minutes, we recommend:</p>
      <ol className="space-y-4 text-sm text-gray-300 list-decimal pl-5">
        <li className="pl-2 hover:text-gray-200 transition-colors">
          Checking the "This is a long recording" option
        </li>
        <li className="pl-2 hover:text-gray-200 transition-colors">
          Being patient during processing (it may take several minutes)
        </li>
        <li className="pl-2 hover:text-gray-200 transition-colors">
          Ensuring your computer doesn't go to sleep during processing
        </li>
      </ol>
    </div>
  );
}

export default ProcessingSection;