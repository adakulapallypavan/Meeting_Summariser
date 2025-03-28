import React, { useEffect } from 'react';

function TranscriptPreview({ transcript }) {
  useEffect(() => {
    console.log('TranscriptPreview received:', {
      hasTranscript: !!transcript,
      hasFormattedTranscript: !!transcript?.formatted_transcript,
      hasRawTranscript: !!transcript?.transcript,
      hasConfidenceMetrics: !!transcript?.confidence_metrics,
      confidenceMetrics: transcript?.confidence_metrics
    });
  }, [transcript]);

  if (!transcript || (!transcript.formatted_transcript && !transcript.transcript)) {
    return null;
  }

  // Get confidence indicator and class
  const getConfidenceIndicator = (confidence) => {
    if (confidence >= 90) {
      return { symbol: '✓', className: 'text-green-600', badgeClass: 'bg-green-500' };
    } else if (confidence >= 70) {
      return { symbol: '~', className: 'text-yellow-600', badgeClass: 'bg-yellow-500' };
    } else {
      return { symbol: '?', className: 'text-red-600', badgeClass: 'bg-red-500' };
    }
  };

  // Format the transcript lines with confidence indicators
  const renderTranscriptLines = () => {
    if (transcript.formatted_transcript) {
      // If we have pre-formatted transcript lines
      return Array.isArray(transcript.formatted_transcript) 
        ? transcript.formatted_transcript.map((line, index) => {
            // Color-code based on confidence indicators already in the text
            if (line.includes("✓ Speaker")) {
              return <div key={index} className="text-green-600">{line}</div>;
            } else if (line.includes("~ Speaker")) {
              return <div key={index} className="text-yellow-600">{line}</div>;
            } else if (line.includes("? Speaker")) {
              return <div key={index} className="text-red-600">{line}</div>;
            } else {
              return <div key={index}>{line}</div>;
            }
          })
        : <div>{transcript.formatted_transcript}</div>;
    } else if (Array.isArray(transcript.transcript)) {
      // Format from raw transcript segments
      return transcript.transcript.map((segment, index) => {
        const { symbol, className } = getConfidenceIndicator(segment.confidence || 0);
        const timeString = segment.start_time ? `[${segment.start_time}] ` : '';
        
        return (
          <div key={index} className={className}>
            {timeString}{symbol} Speaker {segment.speaker}: {segment.text}
          </div>
        );
      });
    } else if (typeof transcript.transcript === 'string') {
      // Simple string transcript (no confidence data available)
      return <div>{transcript.transcript}</div>;
    }
    
    return null;
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-3 text-gray-800">Transcript Preview</h3>
      
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-auto max-h-64 font-mono text-sm">
        {renderTranscriptLines()}
      </div>
      
      {transcript.confidence_metrics && (
        <div className="mt-4 confidence-metrics">
          {/* Elegant confidence visualization box */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 p-4 overflow-hidden relative">
            {/* Glass-effect overlay */}
            <div className="absolute inset-0 backdrop-blur-sm bg-white/30 z-0"></div>
            
            {/* Header with confidence score badge */}
            <div className="flex justify-between items-center mb-3 relative z-10">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-medium text-gray-800">Transcription Confidence Analysis</h3>
              </div>
              
              <div className={`text-sm px-3 py-1 rounded-full font-medium ${
                transcript.confidence_metrics.average >= 90 ? 'bg-green-100 text-green-800 border border-green-200' :
                transcript.confidence_metrics.average >= 70 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 
                'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {transcript.confidence_metrics.average}% Average
              </div>
            </div>
            
            {/* Improved progress bar */}
            <div className="relative z-10">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
              
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden p-0.5">
                {/* Three-section background */}
                <div className="absolute inset-y-0 left-0 w-full flex h-3">
                  <div className="bg-red-200 h-full w-[30%]"></div>
                  <div className="bg-yellow-200 h-full w-[20%]"></div>
                  <div className="bg-green-200 h-full w-[50%]"></div>
                </div>
                
                {/* Confidence indicator */}
                <div className="relative">
                  <div 
                    className={`h-2 rounded-full ${
                      transcript.confidence_metrics.average >= 90 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                      transcript.confidence_metrics.average >= 70 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
                      'bg-gradient-to-r from-red-400 to-red-600'
                    }`}
                    style={{ width: `${transcript.confidence_metrics.average}%` }}
                  ></div>
                </div>
                
                {/* Tooltip markers */}
                <div 
                  className="absolute h-4 w-1 bg-gray-600 rounded-full top-1/2 transform -translate-y-1/2"
                  style={{ left: `${transcript.confidence_metrics.min}%` }}
                  title={`Minimum: ${transcript.confidence_metrics.min}%`}
                ></div>
                <div 
                  className="absolute h-4 w-1 bg-gray-800 rounded-full top-1/2 transform -translate-y-1/2"
                  style={{ left: `${transcript.confidence_metrics.max}%` }}
                  title={`Maximum: ${transcript.confidence_metrics.max}%`}
                ></div>
              </div>
            </div>
            
            {/* Warning for low confidence if needed */}
            {transcript.confidence_metrics.low_confidence_percentage > 10 && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm flex items-start relative z-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>
                  <strong>{transcript.confidence_metrics.low_confidence_percentage}%</strong> of segments have low confidence. The transcript may contain errors in these sections.
                </span>
              </div>
            )}
            
            {/* Enhanced stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 relative z-10">
              <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                <div className="text-xs text-gray-500">Average</div>
                <div className="font-bold text-gray-800">{transcript.confidence_metrics.average}%</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                <div className="text-xs text-gray-500">Range</div>
                <div className="font-bold text-gray-800">{transcript.confidence_metrics.min}-{transcript.confidence_metrics.max}%</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                <div className="text-xs text-gray-500">Total Segments</div>
                <div className="font-bold text-gray-800">{transcript.confidence_metrics.total_segments || '-'}</div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                <div className="text-xs text-gray-500">Low Confidence</div>
                <div className="font-bold text-gray-800">{transcript.confidence_metrics.low_confidence_count || '-'}</div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex justify-center gap-4 text-xs text-gray-600 mt-3 relative z-10">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-sm mr-1"></span>
                <span>High (90%+)</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-yellow-500 rounded-sm mr-1"></span>
                <span>Medium (70-89%)</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-red-500 rounded-sm mr-1"></span>
                <span>Low (&lt;70%)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TranscriptPreview;