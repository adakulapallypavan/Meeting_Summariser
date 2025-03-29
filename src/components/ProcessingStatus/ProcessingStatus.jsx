import React from 'react';

function ProcessingStatus({ isProcessing, status, progress }) {
  // Determine loading animation based on progress
  const getLoadingIndicator = () => {
    if (progress > 0) {
      // Show progress bar with improved design
      return (
        <div className="w-full mt-3 relative h-3">
          {/* Background track - no gray, just a subtle shadow */}
          <div className="absolute inset-0 w-full h-full rounded-full shadow-inner opacity-30"></div>
          
          {/* Progress fill with gradient */}
          <div 
            className="h-3 rounded-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 shadow-lg transition-all duration-500 relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            {/* Add animated shine effect */}
            <div className="absolute inset-0 w-full h-full shine-effect"></div>
          </div>
          
          {/* Add glow effect around the progress bar */}
          <div 
            className="absolute inset-0 blur-sm bg-gradient-to-r from-blue-400/40 via-indigo-500/40 to-purple-600/40 rounded-full"
            style={{ width: `${progress}%`, opacity: 0.6 }}
          ></div>
          
          {/* Add animated dots that follow the progress */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white shadow-md pulse-dot"
            style={{ left: `calc(${progress}% - 10px)` }}
          ></div>
        </div>
      );
    } else {
      // Show spinner
      return (
        <div className="flex justify-center mt-4">
          <div className="spinner">
            <div className="double-bounce1 bg-gradient-to-r from-blue-400 to-indigo-600"></div>
            <div className="double-bounce2 bg-gradient-to-r from-indigo-400 to-purple-600"></div>
          </div>
        </div>
      );
    }
  };

  // Add this CSS to your global styles or inject it here
  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes shine {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      .shine-effect {
        background: linear-gradient(
          90deg, 
          rgba(255,255,255,0) 0%, 
          rgba(255,255,255,0.3) 50%, 
          rgba(255,255,255,0) 100%
        );
        animation: shine 1.5s infinite;
      }
      
      @keyframes pulse {
        0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
        50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
        100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
      }
      
      .pulse-dot {
        animation: pulse 1.5s infinite ease-in-out;
      }
      
      .spinner {
        width: 40px;
        height: 40px;
        position: relative;
        margin: 10px auto;
      }
      
      .double-bounce1, .double-bounce2 {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        opacity: 0.6;
        position: absolute;
        top: 0;
        left: 0;
        animation: sk-bounce 2.0s infinite ease-in-out;
      }
      
      .double-bounce2 {
        animation-delay: -1.0s;
      }
      
      @keyframes sk-bounce {
        0%, 100% { transform: scale(0.0); }
        50% { transform: scale(1.0); }
      }
      
      .glass-effect {
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Determine status icon based on status text
  const getStatusIcon = () => {
    if (status.includes('successfully') || status.includes('complete')) {
      return (
        <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    } else if (status.includes('error') || status.includes('failed')) {
      return (
        <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    } else if (status.includes('⚠️')) {
      return (
        <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    } else {
      return (
        <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
  };

  // Format multi-line status messages to JSX
  const formatStatusMessage = () => {
    if (!status) return null;
    
    // Parse HTML in the status message (for handling <strong> tags)
    const parseHtml = (htmlString) => {
      if (htmlString.includes('<strong>')) {
        const segments = htmlString.split(/<strong>|<\/strong>/);
        return segments.map((segment, index) => {
          // Every odd index is inside a strong tag
          return index % 2 === 1 ? <strong key={index}>{segment}</strong> : segment;
        });
      }
      return htmlString;
    };
    
    // Split the status message by newlines
    const lines = status.split('\n');
    
    return (
      <>
        {lines.map((line, index) => {
          // Check if line contains confidence info
          if (line.includes('confidence:')) {
            const [label, value] = line.split('confidence:');
            return (
              <div key={index} className="mt-1">
                <span>{label}confidence: </span>
                <span className={
                  parseInt(value) >= 90 ? 'text-green-500 font-medium' : 
                  parseInt(value) >= 70 ? 'text-yellow-500 font-medium' : 
                  'text-red-500 font-medium'
                }>
                  {parseHtml(value)}
                </span>
              </div>
            );
          }
          // Check if line contains warning
          else if (line.includes('⚠️')) {
            return <div key={index} className="text-yellow-500 mt-1">{parseHtml(line)}</div>;
          } 
          // Regular line with HTML parsing
          else {
            return index === 0 ? 
              <div key={index}>{parseHtml(line)}</div> : 
              <div key={index} className="mt-1">{parseHtml(line)}</div>;
          }
        })}
      </>
    );
  };

  if (!status) return null;

  return (
    <div className={`glass-effect rounded-lg p-4 overflow-hidden relative z-0 ${isProcessing ? 'border-blue-500/30' : ''}`}>
      <div className="flex items-start gap-2">
        <div className="mt-1">{getStatusIcon()}</div>
        <div className="text-white-700 flex-1">{formatStatusMessage()}</div>
      </div>
      
      {isProcessing && getLoadingIndicator()}
      
      {progress > 0 && progress < 100 && isProcessing && (
        <div className="flex justify-between items-center text-xs mt-1">
          <div className="text-blue-600 font-medium">Processing</div>
          <div className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
            {progress}% complete
          </div>
        </div>
      )}
    </div>
  );
}

export default ProcessingStatus;