import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Save, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function SummaryView({ summary, isEditable = true }) {
  // State for editable content
  const [editMode, setEditMode] = useState(false);
  const [editedSummary, setEditedSummary] = useState({
    meetingSummary: '',
    keyPoints: [],
    decisions: [],
    actionItems: [],
    speakerContributions: []
  });
  const summaryContentRef = useRef(null);

  // Initialize editedSummary with the original summary when it changes
  useEffect(() => {
    if (summary) {
      setEditedSummary({
        meetingSummary: summary.meetingSummary || '',
        keyPoints: summary.keyPoints || [],
        decisions: summary.decisions || [],
        actionItems: summary.actionItems || [],
        speakerContributions: summary.speakerContributions || []
      });
    }
  }, [summary]);

  if (!summary) {
    return <div className="text-gray-400">No summary available yet.</div>;
  }

  // Toggle edit mode
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  // Function to determine priority color
  const getPriorityColor = (priority) => {
    const priorityLower = priority.toLowerCase();
    if (priorityLower === 'high') return 'text-red-700 bg-red-100 border-red-200';
    if (priorityLower === 'medium') return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    return 'text-green-700 bg-green-100 border-green-200';
  };

  // Function to handle edits to the main summary
  const handleSummaryChange = (e) => {
    setEditedSummary({
      ...editedSummary,
      meetingSummary: e.target.value
    });
  };

  // Function to handle edits to key points
  const handleKeyPointChange = (index, value) => {
    const updatedKeyPoints = [...editedSummary.keyPoints];
    updatedKeyPoints[index] = value;
    setEditedSummary({
      ...editedSummary,
      keyPoints: updatedKeyPoints
    });
  };

  // Function to handle edits to decisions
  const handleDecisionChange = (index, value) => {
    const updatedDecisions = [...editedSummary.decisions];
    updatedDecisions[index] = value;
    setEditedSummary({
      ...editedSummary,
      decisions: updatedDecisions
    });
  };

  // Function to handle edits to action items
  const handleActionItemChange = (index, field, value) => {
    const updatedActionItems = [...editedSummary.actionItems];
    updatedActionItems[index] = {
      ...updatedActionItems[index],
      [field]: value
    };
    setEditedSummary({
      ...editedSummary,
      actionItems: updatedActionItems
    });
  };

  // Function to handle edits to speaker contributions
  const handleSpeakerChange = (speakerIndex, field, value, subIndex = null) => {
    const updatedSpeakers = [...editedSummary.speakerContributions];
    
    if (subIndex !== null && Array.isArray(updatedSpeakers[speakerIndex][field])) {
      // Handle array fields like keyContributions
      const updatedArray = [...updatedSpeakers[speakerIndex][field]];
      updatedArray[subIndex] = value;
      updatedSpeakers[speakerIndex] = {
        ...updatedSpeakers[speakerIndex],
        [field]: updatedArray
      };
    } else {
      // Handle direct fields like summary
      updatedSpeakers[speakerIndex] = {
        ...updatedSpeakers[speakerIndex],
        [field]: value
      };
    }
    
    setEditedSummary({
      ...editedSummary,
      speakerContributions: updatedSpeakers
    });
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

  // Access confidence metrics from either direct path or through metadata
  const confidenceMetrics = summary.confidence_metrics || summary.metadata?.confidenceMetrics;

  // Generate PDF from the summary content
  const generatePDF = async () => {
    if (!summaryContentRef.current) return;
    
    try {
      // Set temporary styles for better PDF rendering
      const originalStyles = [];
      const elementsToModify = summaryContentRef.current.querySelectorAll('textarea');
      elementsToModify.forEach(el => {
        originalStyles.push({
          element: el,
          height: el.style.height
        });
        // Make textareas fit content
        el.style.height = `${el.scrollHeight}px`;
      });
      
      const canvas = await html2canvas(summaryContentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      // Reset the styles
      originalStyles.forEach(item => {
        item.element.style.height = item.height;
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // If content is too large for one page, handle paging
      if (imgHeight * ratio > pdfHeight - 20) {
        let remainingHeight = imgHeight * ratio;
        let currentPage = 0;
        
        while (remainingHeight > 0) {
          currentPage++;
          remainingHeight -= (pdfHeight - 20);
          
          if (remainingHeight > 0) {
            pdf.addPage();
            pdf.addImage(
              imgData, 
              'PNG', 
              imgX, 
              -(pdfHeight - 20) * currentPage + 10, 
              imgWidth * ratio, 
              imgHeight * ratio
            );
          }
        }
      }
      
      pdf.save('meeting-summary.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 md:p-6 mb-8 border border-gray-200">
      {/* Header with edit/save button */}
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Meeting Summary</h3>
        <div className="flex gap-2">
          {isEditable && (
            <button 
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                editMode 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
              }`}
              onClick={toggleEditMode}
            >
              {editMode ? (
                <>
                  <Save size={16} /> Save
                </>
              ) : (
                <>
                  <Edit2 size={16} /> Edit
                </>
              )}
            </button>
          )}
          <button 
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 transition-colors"
            onClick={generatePDF}
          >
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>

      {/* Meeting metadata display */}
      {summary.metadata && (
        <div className="text-sm text-gray-500 mb-4 flex flex-wrap gap-4">
          {summary.metadata.totalDurationMinutes && (
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Duration:</span> {formatDuration(summary.metadata.totalDurationMinutes)}
            </span>
          )}
          
          {summary.metadata.participantCount && (
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-medium">Participants:</span> {summary.metadata.participantCount}
            </span>
          )}
          
          {confidenceMetrics && (
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
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
          
          {summary.metadata.language && (
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span className="font-medium">Language:</span> {summary.metadata.languageName || summary.metadata.language}
            </span>
          )}
        </div>
      )}

      {/* Summary content container with ref for PDF export */}
      <div ref={summaryContentRef} className="space-y-6">
        {/* Main summary section */}
        <div className="text-gray-700 mb-6 p-4 rounded-lg border border-gray-200">
          {editMode ? (
            <textarea
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[150px]"
              value={editedSummary.meetingSummary}
              onChange={handleSummaryChange}
            />
          ) : (
            <p className="whitespace-pre-wrap">{editedSummary.meetingSummary}</p>
          )}
          
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

        {/* Key Points and Decisions Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium mb-3 text-gray-800">Key Points</h4>
            {editMode ? (
              <ul className="space-y-2">
                {editedSummary.keyPoints && editedSummary.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 mt-2">•</span>
                    <textarea
                      className="flex-grow p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={point}
                      onChange={(e) => handleKeyPointChange(index, e.target.value)}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {editedSummary.keyPoints && editedSummary.keyPoints.length > 0 ? (
                  editedSummary.keyPoints.map((point, index) => (
                    <li key={index} className="whitespace-pre-wrap">{point}</li>
                  ))
                ) : (
                  <li className="text-gray-500">No key points identified</li>
                )}
              </ul>
            )}

            <h4 className="text-lg font-medium mb-3 mt-6 text-gray-800">Decisions Made</h4>
            {editMode ? (
              <ul className="space-y-2">
                {editedSummary.decisions && editedSummary.decisions.map((decision, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 mt-2">•</span>
                    <textarea
                      className="flex-grow p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={decision}
                      onChange={(e) => handleDecisionChange(index, e.target.value)}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {editedSummary.decisions && editedSummary.decisions.length > 0 ? (
                  editedSummary.decisions.map((decision, index) => (
                    <li key={index} className="whitespace-pre-wrap">{decision}</li>
                  ))
                ) : (
                  <li className="text-gray-500">No decisions identified</li>
                )}
              </ul>
            )}
          </div>

          {/* Action Items Section */}
          <div>
            <h4 className="text-lg font-medium mb-3 text-gray-800">Action Items</h4>
            {!editedSummary.actionItems || editedSummary.actionItems.length === 0 ? (
              <p className="text-gray-500">No action items identified</p>
            ) : (
              <div className="space-y-3">
                {editedSummary.actionItems.map((item, index) => (
                  <div key={index} className="action-item border border-gray-200 rounded-lg overflow-hidden">
                    <div className="flex items-center px-4 py-3 bg-gray-50 border-b border-gray-200">
                      {editMode ? (
                        <textarea
                          className="flex-grow p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={item.title}
                          onChange={(e) => handleActionItemChange(index, 'title', e.target.value)}
                        />
                      ) : (
                        <div className="font-medium text-gray-800 flex-grow whitespace-pre-wrap">{item.title}</div>
                      )}
                      
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${getPriorityColor(item.priority)}`}>
                        {editMode ? (
                          <select
                            value={item.priority}
                            onChange={(e) => handleActionItemChange(index, 'priority', e.target.value)}
                            className="bg-transparent border-none p-0 focus:outline-none focus:ring-0"
                          >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </select>
                        ) : (
                          item.priority
                        )}
                      </div>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-sm mb-1">
                        <strong>Assignee:</strong>
                        {editMode ? (
                          <input
                            type="text"
                            className="ml-2 p-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={item.assignee}
                            onChange={(e) => handleActionItemChange(index, 'assignee', e.target.value)}
                          />
                        ) : (
                          ` ${item.assignee}`
                        )}
                      </p>
                      <p className="text-sm">
                        <strong>Due Date:</strong>
                        {editMode ? (
                          <input
                            type="text"
                            className="ml-2 p-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={item.dueDate}
                            onChange={(e) => handleActionItemChange(index, 'dueDate', e.target.value)}
                          />
                        ) : (
                          ` ${item.dueDate}`
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Speaker Contributions Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Speaker Contributions</h3>
          <div className="space-y-4">
            {editedSummary.speakerContributions && editedSummary.speakerContributions.length > 0 ? (
              editedSummary.speakerContributions.map((speaker, index) => {
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
                      <h4 className="text-lg font-medium text-blue-600">
                        {editMode ? (
                          <input
                            type="text"
                            className="p-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={speaker.name}
                            onChange={(e) => handleSpeakerChange(index, 'name', e.target.value)}
                          />
                        ) : (
                          speaker.name
                        )}
                      </h4>
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
                    
                    <div className="mb-3">
                      <strong>Summary:</strong>{' '}
                      {editMode ? (
                        <textarea
                          className="w-full mt-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={speaker.summary}
                          onChange={(e) => handleSpeakerChange(index, 'summary', e.target.value)}
                        />
                      ) : (
                        <span className="whitespace-pre-wrap">{speaker.summary}</span>
                      )}
                    </div>
                
                    {speaker.keyContributions && speaker.keyContributions.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-sm font-medium text-gray-600 mb-1">Key Contributions:</h5>
                        {editMode ? (
                          <ul className="space-y-2 pl-2">
                            {speaker.keyContributions.map((contribution, subIndex) => (
                              <li key={subIndex} className="flex items-start">
                                <span className="mr-2 mt-2">•</span>
                                <textarea
                                  className="flex-grow p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  value={contribution}
                                  onChange={(e) => handleSpeakerChange(index, 'keyContributions', e.target.value, subIndex)}
                                />
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm pl-2">
                            {speaker.keyContributions.map((contribution, subIndex) => (
                              <li key={subIndex} className="whitespace-pre-wrap">{contribution}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                    
                    {speaker.actionItems && speaker.actionItems.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-sm font-medium text-gray-600 mb-1">Action Items:</h5>
                        {editMode ? (
                          <ul className="space-y-2 pl-2">
                            {speaker.actionItems.map((action, subIndex) => (
                              <li key={subIndex} className="flex items-start">
                                <span className="mr-2 mt-2">•</span>
                                <textarea
                                  className="flex-grow p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  value={action}
                                  onChange={(e) => handleSpeakerChange(index, 'actionItems', e.target.value, subIndex)}
                                />
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm pl-2">
                            {speaker.actionItems.map((action, subIndex) => (
                              <li key={subIndex} className="whitespace-pre-wrap">{action}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                    
                    {speaker.questionsRaised && speaker.questionsRaised.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-600 mb-1">Questions Raised:</h5>
                        {editMode ? (
                          <ul className="space-y-2 pl-2">
                            {speaker.questionsRaised.map((question, subIndex) => (
                              <li key={subIndex} className="flex items-start">
                                <span className="mr-2 mt-2">•</span>
                                <textarea
                                  className="flex-grow p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  value={question}
                                  onChange={(e) => handleSpeakerChange(index, 'questionsRaised', e.target.value, subIndex)}
                                />
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm pl-2">
                            {speaker.questionsRaised.map((question, subIndex) => (
                              <li key={subIndex} className="whitespace-pre-wrap">{question}</li>
                            ))}
                          </ul>
                        )}
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
      </div>
    </div>
  );
}

export default SummaryView;