import React, { useEffect } from 'react';

function SummaryView({ viewMode, setViewMode, summary }) {
  if (!summary) {
    return <div className="text-gray-400">No summary available yet.</div>;
  }

  // Function to determine priority color
  const getPriorityColor = (priority) => {
    const priorityLower = priority.toLowerCase();
    if (priorityLower === 'high') return 'text-red-700 bg-red-100 border-red-200';
    if (priorityLower === 'medium') return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    return 'text-green-700 bg-green-100 border-green-200';
  };

  // Format duration in minutes to a readable string
  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  useEffect(() => {
    console.log('SummaryView received summary data:', {
      hasMetadata: !!summary?.metadata,
      hasConfidenceMetricsInMetadata: !!summary?.metadata?.confidenceMetrics,
      confidenceAverageInMetadata: summary?.metadata?.confidenceMetrics?.average,
      hasDirectConfidenceMetrics: !!summary?.confidence_metrics,
      directConfidenceAverage: summary?.confidence_metrics?.average,
      fullConfidenceMetrics: summary?.confidence_metrics,
      metadataConfidenceMetrics: summary?.metadata?.confidenceMetrics,
      entireMetadata: summary?.metadata
    });
  }, [summary]);

  // Access confidence metrics from either direct path or through metadata
  const confidenceMetrics = summary.confidence_metrics || summary.metadata?.confidenceMetrics;

  return (
    <div className="bg-white rounded-xl shadow p-4 md:p-6 mb-8 border border-gray-200">
      {/* Tab selector */}
      <div className="flex gap-2 mb-6">
        <button
          className={`${viewMode === 'meeting' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} px-4 py-2 rounded-lg transition-colors`}
          onClick={() => setViewMode('meeting')}
        >
          Meeting Summary
        </button>
        <button
          className={`${viewMode === 'speakers' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} px-4 py-2 rounded-lg transition-colors`}
          onClick={() => setViewMode('speakers')}
        >
          Speaker Contributions
        </button>
      </div>

      {/* Meeting Summary View */}
      {viewMode === 'meeting' && (
        <div>
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Meeting Summary</h3>
            {summary.metadata && (
              <div className="text-sm text-gray-500">
                <span className="font-medium">Duration:</span> {formatDuration(summary.metadata.totalDurationMinutes)}
                {summary.metadata.participantCount && (
                  <span className="ml-4">
                    <span className="font-medium">Participants:</span> {summary.metadata.participantCount}
                  </span>
                )}
                {confidenceMetrics && (
                  <span className="ml-4">
                    <span className="font-medium">Transcription Confidence:</span>{' '}
                    <span className={`${
                      confidenceMetrics.average >= 90 ? 'text-green-700' :
                      confidenceMetrics.average >= 70 ? 'text-yellow-700' : 
                      'text-red-700'
                    }`}>
                      {confidenceMetrics.average}%
                    </span>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="text-gray-700 mb-6 p-4 rounded-lg border border-gray-200">
            <p className="whitespace-pre-wrap">{summary.meetingSummary}</p>
            
            {/* Add confidence information below the summary */}
            {confidenceMetrics && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium mr-2">Transcription Confidence:</span>
                  <span className={`px-2 py-0.5 rounded ${
                    confidenceMetrics.average >= 90 ? 'text-green-700 bg-green-100' :
                    confidenceMetrics.average >= 70 ? 'text-yellow-700 bg-yellow-100' : 
                    'text-red-700 bg-red-100'
                  }`}>
                    {confidenceMetrics.average}% average
                  </span>
                  {confidenceMetrics.low_confidence_percentage > 10 && (
                    <span className="ml-2 text-yellow-600">
                      ⚠️ {confidenceMetrics.low_confidence_percentage}% low confidence segments
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium mb-3 text-gray-800">Key Points</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {summary.keyPoints && summary.keyPoints.length > 0 ? (
                  summary.keyPoints.map((point, index) => (
                    <li key={index} className="whitespace-pre-wrap">{point}</li>
                  ))
                ) : (
                  <li className="text-gray-500">No key points identified</li>
                )}
              </ul>

              <h4 className="text-lg font-medium mb-3 mt-6 text-gray-800">Decisions Made</h4>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {summary.decisions && summary.decisions.length > 0 ? (
                  summary.decisions.map((decision, index) => (
                    <li key={index} className="whitespace-pre-wrap">{decision}</li>
                  ))
                ) : (
                  <li className="text-gray-500">No decisions identified</li>
                )}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-3 text-gray-800">Action Items</h4>
              {!summary.actionItems || summary.actionItems.length === 0 ? (
                <p className="text-gray-500">No action items identified</p>
              ) : (
                <div className="space-y-3">
                  {summary.actionItems.map((item, index) => (
                    <div key={index} className="action-item border border-gray-200 rounded-lg overflow-hidden">
                      <div className="flex items-center px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <div className="font-medium text-gray-800 flex-grow whitespace-pre-wrap">{item.title}</div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </div>
                      </div>
                      <div className="px-4 py-3">
                        <p className="text-sm mb-1"><strong>Assignee:</strong> {item.assignee}</p>
                        <p className="text-sm"><strong>Due Date:</strong> {item.dueDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
        {/* Metadata section below action items */}
        {summary.metadata && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            {console.log('Summary Metadata:', summary.metadata)}
            {console.log('Direct Confidence Metrics:', summary.confidence_metrics)}
            <h4 className="text-lg font-medium mb-3 text-gray-800">Meeting Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Main metrics row - always show these three items in a row */}
              <div>
                <p className="text-sm text-gray-600">Language</p>
                <p className="font-medium">{summary.metadata.languageName || summary.metadata.language || 'Not specified'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Participants</p>
                <p className="font-medium">{summary.metadata.participantCount || 'Not specified'}</p>
              </div>
              
              {confidenceMetrics ? (
                <div>
                  <p className="text-sm text-gray-600">Transcription Confidence</p>
                  <p className={`font-medium ${
                    confidenceMetrics.average >= 90 ? 'text-green-700' :
                    confidenceMetrics.average >= 70 ? 'text-yellow-700' : 
                    'text-red-700'
                  }`}>
                    {confidenceMetrics.average}% average
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600">Transcription Confidence</p>
                  <p className="font-medium">Not available</p>
                </div>
              )}
              
              {/* Additional metadata items */}
              {summary.metadata.totalDurationMinutes && (
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium">{formatDuration(summary.metadata.totalDurationMinutes)}</p>
                </div>
              )}
              
              {summary.metadata.chunksAnalyzed && (
                <div>
                  <p className="text-sm text-gray-600">Chunks Analyzed</p>
                  <p className="font-medium">{summary.metadata.chunksAnalyzed}</p>
                </div>
              )}
            </div>
            
            {/* Enhanced confidence metrics display */}
            {confidenceMetrics && (
              <div className="mt-6">
                <h5 className="text-md font-medium mb-2 text-gray-700">Transcription Quality Analysis</h5>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 p-4 overflow-hidden relative">
                  {/* Glass-effect overlay */}
                  <div className="absolute inset-0 backdrop-blur-sm bg-white/30 z-0"></div>
                  
                  {/* Header with confidence score badge */}
                  <div className="flex justify-between items-center mb-3 relative z-10">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="font-medium text-gray-800">Confidence Metrics</h3>
                    </div>
                    
                    <div className={`text-sm px-3 py-1 rounded-full font-medium ${
                      confidenceMetrics.average >= 90 ? 'bg-green-100 text-green-800 border border-green-200' :
                      confidenceMetrics.average >= 70 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 
                      'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {confidenceMetrics.average}% Average
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
                            confidenceMetrics.average >= 90 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                            confidenceMetrics.average >= 70 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
                            'bg-gradient-to-r from-red-400 to-red-600'
                          }`}
                          style={{ width: `${confidenceMetrics.average}%` }}
                        ></div>
                      </div>
                      
                      {/* Tooltip markers */}
                      <div 
                        className="absolute h-4 w-1 bg-gray-600 rounded-full top-1/2 transform -translate-y-1/2"
                        style={{ left: `${confidenceMetrics.min}%` }}
                        title={`Minimum: ${confidenceMetrics.min}%`}
                      ></div>
                      <div 
                        className="absolute h-4 w-1 bg-gray-800 rounded-full top-1/2 transform -translate-y-1/2"
                        style={{ left: `${confidenceMetrics.max}%` }}
                        title={`Maximum: ${confidenceMetrics.max}%`}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Warning for low confidence if needed */}
                  {confidenceMetrics.low_confidence_percentage > 10 && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm flex items-start relative z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>
                        <strong>{confidenceMetrics.low_confidence_percentage}%</strong> of segments have low confidence. The transcript may contain errors in these sections.
                      </span>
                    </div>
                  )}
                  
                  {/* Enhanced stats grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 relative z-10">
                    <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                      <div className="text-xs text-gray-500">Average</div>
                      <div className="font-bold text-gray-800">{confidenceMetrics.average}%</div>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                      <div className="text-xs text-gray-500">Range</div>
                      <div className="font-bold text-gray-800">{confidenceMetrics.min}-{confidenceMetrics.max}%</div>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                      <div className="text-xs text-gray-500">Total Segments</div>
                      <div className="font-bold text-gray-800">{confidenceMetrics.total_segments || '-'}</div>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                      <div className="text-xs text-gray-500">Low Confidence</div>
                      <div className="font-bold text-gray-800">{confidenceMetrics.low_confidence_count || '-'}</div>
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
        )}
        </div>
      )}

      {/* Speaker Contributions View */}
      {viewMode === 'speakers' && (
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Speaker Contributions</h3>
          <div className="space-y-4">
            {summary.speakerContributions && summary.speakerContributions.length > 0 ? (
              summary.speakerContributions.map((speaker, index) => {
                // Calculate average confidence for this speaker
                let speakerConfidence = null;
                if (summary.transcript?.transcript) {
                  const speakerSegments = summary.transcript.transcript.filter(
                    s => `Speaker ${s.speaker}` === speaker.name
                  );
                  if (speakerSegments.length > 0) {
                    const confidences = speakerSegments
                      .filter(s => s.confidence !== undefined && s.confidence !== null)
                      .map(s => s.confidence);
                    
                    if (confidences.length > 0) {
                      speakerConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
                    }
                  }
                }

                return (
                  <div key={index} className="speaker-item p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center mb-2">
                      <h4 className="text-lg font-medium text-blue-600">{speaker.name}</h4>
                      {speakerConfidence !== null && (
                        <span className={`ml-2 text-sm px-2 py-0.5 rounded ${
                          speakerConfidence >= 90 ? 'text-green-700 bg-green-100' :
                          speakerConfidence >= 70 ? 'text-yellow-700 bg-yellow-100' : 
                          'text-red-700 bg-red-100'
                        }`}>
                          {speakerConfidence.toFixed(1)}% confidence
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3 whitespace-pre-wrap"><strong>Summary:</strong> {speaker.summary}</p>
                
                {speaker.keyContributions && speaker.keyContributions.length > 0 && (
                  <div className="mb-3">
                        <h5 className="text-sm font-medium text-gray-600 mb-1">Key Contributions:</h5>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm pl-2">
                      {speaker.keyContributions.map((contribution, idx) => (
                            <li key={idx} className="whitespace-pre-wrap">{contribution}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {speaker.actionItems && speaker.actionItems.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-sm font-medium text-gray-600 mb-1">Action Items:</h5>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm pl-2">
                          {speaker.actionItems.map((action, idx) => (
                            <li key={idx} className="whitespace-pre-wrap">{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {speaker.questionsRaised && speaker.questionsRaised.length > 0 && (
                  <div>
                        <h5 className="text-sm font-medium text-gray-600 mb-1">Questions Raised:</h5>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm pl-2">
                          {speaker.questionsRaised.map((question, idx) => (
                            <li key={idx} className="whitespace-pre-wrap">{question}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
                );
              })
            ) : (
              <p className="text-gray-500">No speaker contributions available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SummaryView;