import React, { useState, useEffect } from 'react';

function ParticipantsInput({ participants, setParticipants }) {
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  
  // Check if participants were auto-detected
  useEffect(() => {
    // If participants weren't explicitly set by user, they were auto-detected
    if (participants && participants.includes('Speaker') && !isAutoDetected) {
      setIsAutoDetected(true);
    }
  }, [participants]);

  // Handle participant input changes
  const handleChange = (e) => {
    setParticipants(e.target.value);
    setIsAutoDetected(false); // User is manually editing
  };

  return (
    <div className="rounded-xl p-4 md:p-6 mb-8">
      <label className="block text-gray-900 font-medium mb-2 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-indigo-600">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        Meeting Participants
      </label>
      
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            className="w-full px-4 py-2 border border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none rounded-lg shadow-sm transition-all duration-200"
            placeholder="Enter participant names separated by commas"
            value={participants}
            onChange={handleChange}
          />
          
          {isAutoDetected && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white px-2 py-0.5 rounded-full text-xs flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Auto-detected
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-indigo-800/60 text-sm">
        <p>Enter participant names separated by commas (e.g., "Alice, Bob, Charlie")</p>
        <p className="mt-1">If left empty, the system will attempt to detect participants automatically.</p>
      </div>
      
      {participants && participants.split(',').length > 0 && participants.split(',')[0].trim() !== '' && (
        <div className="mt-4">
          <div className="text-indigo-600 font-medium mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Recognized Participants:
          </div>
          <div className="flex flex-wrap gap-2">
            {participants.split(',').map((participant, index) => (
              <div key={index} className="bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-1 rounded-full text-sm text-white shadow-sm flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-white mr-1.5 opacity-70"></span>
                {participant.trim()}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ParticipantsInput;