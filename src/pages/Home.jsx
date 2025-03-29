import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import InputMethodSelector from '../components/InputMethod/InputMethodSelector';
import AudioUpload from '../components/AudioUpload/AudioUpload';
import TextInput from '../components/TextInput/TextInput';
import TextUpload from '../components/TextUpload/TextUpload';
import ParticipantsInput from '../components/ParticipantsInput/ParticipantsInput';
import AdditionalContextInput from '../components/AdditionalContextInput/AdditionalContextInput';
import SummaryView from '../components/Summary/SummaryView';
import ProcessingStatus from '../components/ProcessingStatus/ProcessingStatus';
import TranscriptPreview from '../components/TranscriptPreview/TranscriptPreview';
import meetingSummarizerApi from '../api/meetingSummarizerApi';
import TipsSection from '../components/Sidebar/TipsSection';

function Home() {
  // State Management
  const [inputMethod, setInputMethod] = useState('audio');
  const [isLongRecording, setIsLongRecording] = useState(false);
  const [participants, setParticipants] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [transcript, setTranscript] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('auto');
  const [currentJobId, setCurrentJobId] = useState(null);
  const [supportedLanguages, setSupportedLanguages] = useState([]);
  const fileInputRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Real data from API
  const [summary, setSummary] = useState(null);
  
  // Add a loading state for languages
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(true);
  
  // Fetch supported languages on component mount
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setIsLoadingLanguages(true);
        const languages = await meetingSummarizerApi.getLanguages();
        setSupportedLanguages(languages);
      } catch (error) {
        console.error('Failed to fetch languages:', error);
        // Set a default language option if API fails
        setSupportedLanguages([{ code: 'auto', name: 'Auto-detect' }]);
      } finally {
        setIsLoadingLanguages(false);
      }
    };
    
    fetchLanguages();
    
    // Perform a health check
    const checkApiHealth = async () => {
      try {
        await meetingSummarizerApi.checkHealth();
      } catch (error) {
        console.error('API health check failed:', error);
        setError('Cannot connect to the API server. Please check your backend is running.');
      }
    };
    
    checkApiHealth();
    
    // Cleanup interval on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Handle input method change
  useEffect(() => {
    // Clear state when changing input methods
    setUploadedFile(null);
    setTranscript('');
    setParticipants('');
    setAdditionalContext('');
    setShowSummary(false);
    setError(null);
    setIsProcessing(false);
    setProcessingStatus('');
    setProcessingProgress(0);
    // Reset language to auto when changing input methods
    setLanguage('auto');
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
  }, [inputMethod]);

  // Start polling for job status
  const startJobPolling = (jobId) => {
    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    setCurrentJobId(jobId);
    setProcessingStatus('Job started. Please wait while we process your request...');
    
    // Start polling immediately instead of waiting for the first interval
    checkJobStatus(jobId);
    
    // Then set up the interval for subsequent checks
    pollingIntervalRef.current = setInterval(() => checkJobStatus(jobId), 1000);
  };

  // Separate the status checking logic into its own function
  const checkJobStatus = async (jobId) => {
    try {
      console.log(`[${new Date().toISOString()}] Checking status for job: ${jobId}`);
      const status = await meetingSummarizerApi.checkJobStatus(jobId);
      
      console.log(`[${new Date().toISOString()}] Job status update:`, {
        jobId,
        status: status.status,
        progress: status.progress || 0
      });
      
      setProcessingProgress(status.progress || 0);
      setProcessingStatus(status.message || 'Processing...');
      
      if (status.status === 'completed') {
        console.log(`[${new Date().toISOString()}] Job completed successfully:`, jobId);
        
        // Debug log for entire status result
        console.log('Complete status object:', status);
        
        // Debug log for confidence metrics
        console.log('Raw confidence metrics:', status.result?.confidence_metrics);
        
        // Debug log for metadata preparation
        const debugMetadata = {
          language: status.result?.metadata?.language || status.result?.language || 'auto-detected',
          languageName: status.result?.metadata?.language_name || 
            supportedLanguages.find(l => l.code === status.result?.language)?.name,
          totalDurationMinutes: status.result?.metadata?.total_duration_minutes,
          participantCount: status.result?.metadata?.participant_count,
          chunksAnalyzed: status.result?.metadata?.chunks_analyzed,
          confidenceMetrics: status.result?.confidence_metrics
        };
        
        console.log('Prepared metadata:', debugMetadata);
        
        // Debug log specifically for confidence values
        if (status.result?.confidence_metrics) {
          console.log('Confidence details:', {
            average: status.result.confidence_metrics.average,
            min: status.result.confidence_metrics.min,
            max: status.result.confidence_metrics.max,
            lowConfidencePercentage: status.result.confidence_metrics.low_confidence_percentage,
            totalSegments: status.result.confidence_metrics.total_segments
          });
        } else {
          console.log('No confidence metrics found in result');
        }

        // Check if the data is nested differently than expected
        console.log('Confidence metrics path check:', {
          directPath: status.result?.confidence_metrics?.average,
          nestedInMetadata: status.result?.metadata?.confidence_metrics?.average,
          fullResult: status.result
        });

        // Log the complete result data
        console.log(`[${new Date().toISOString()}] Complete job results:`, {
          transcript: status.result?.transcript,
          formatted_transcript: status.result?.formatted_transcript,
          speakers: status.result?.speakers,
          language: status.result?.language,
          language_name: status.result?.language_name,
          confidence_metrics: status.result?.confidence_metrics,
          metadata: status.result?.metadata,
          meeting_summary: status.result?.meeting_summary,
          speaker_summaries: status.result?.speaker_summaries,
          action_items: status.result?.action_items
        });

        console.log('API response:', status);

        clearInterval(pollingIntervalRef.current);
        
        // Extract transcript if this was audio processing
        if (status.result && status.result.transcript) {
          let formattedTranscript = '';
          
          // Handle different transcript formats
          if (Array.isArray(status.result.formatted_transcript)) {
            formattedTranscript = status.result.formatted_transcript.join('\n');
          } else if (Array.isArray(status.result.transcript)) {
            // Format transcript from segments
            formattedTranscript = status.result.transcript.map(segment => 
              `Speaker ${segment.speaker}: ${segment.text}`
            ).join('\n');
          } else if (typeof status.result.transcript === 'string') {
            formattedTranscript = status.result.transcript;
          }
          
          setTranscript(formattedTranscript);
          
          // Get participants from the transcript
          let participantsList = [];
          
          if (status.result.speakers) {
            participantsList = status.result.speakers;
          } else if (Array.isArray(status.result.transcript)) {
          const speakers = new Set();
          status.result.transcript.forEach(segment => {
              if (segment.speaker) {
            speakers.add(`Speaker ${segment.speaker}`);
              }
            });
            participantsList = Array.from(speakers);
          }
          
          if (participantsList.length > 0) {
            setParticipants(participantsList.join(', '));
          }
          
          // Set language if available
          if (status.result.language) {
            setLanguage(status.result.language);
          }
          
          // Log confidence metrics for debugging
          if (status.result.confidence_metrics) {
            console.log('Audio processing confidence metrics:', {
              average: status.result.confidence_metrics.average,
              min: status.result.confidence_metrics.min,
              max: status.result.confidence_metrics.max,
              low_percentage: status.result.confidence_metrics.low_confidence_percentage
            });
          } else {
            console.log('No confidence metrics available in audio processing result');
          }
          
          // Build a detailed processing completion message
          let completionMessage = `Audio processed successfully!`;
          
          // Add language info
          if (status.result.language) {
            const detectedLanguage = status.result.language;
            // Use language_name when available (matching original implementation)
            const languageDisplay = status.result.language_name || 
              supportedLanguages.find(l => l.code === detectedLanguage)?.name || 
              detectedLanguage;
            
            completionMessage += ` Language: ${languageDisplay} (${detectedLanguage})`;
          }
          
          // Add confidence metrics if available
          if (status.result.confidence_metrics && status.result.confidence_metrics.average) {
            const avgConfidence = status.result.confidence_metrics.average;
            completionMessage += `\nAverage transcription confidence: <strong>${avgConfidence}%</strong>`;
            
            // Add warning for low confidence
            if (status.result.confidence_metrics.low_confidence_percentage > 20) {
              completionMessage += `\n⚠️ ${status.result.confidence_metrics.low_confidence_percentage}% of segments have low confidence`;
            }
          }
          
          setProcessingStatus(completionMessage);
          
          // Store the transcript data for TranscriptPreview
          const transcriptConfidenceMetrics = status.result.confidence_metrics;
          console.log('Setting initial confidence metrics:', transcriptConfidenceMetrics);
          
          setSummary({
            transcript: status.result,
            confidence_metrics: transcriptConfidenceMetrics
          });
        }
        
        // If the job result contains summary data
        if (status.result && status.result.meeting_summary) {
          // Process the summary data
          try {
            // Save the existing confidence metrics before we potentially overwrite them
            const existingConfidenceMetrics = summary?.confidence_metrics;
            console.log('Existing confidence metrics before summary generation:', existingConfidenceMetrics);
            
            // Calculate confidence level using the same logic
            const avgConfidence = status.result.confidence_metrics?.average || existingConfidenceMetrics?.average;
            const confidenceLevel = 
              avgConfidence >= 90 ? '🟢 High' :
              avgConfidence >= 70 ? '🟡 Medium' :
              '🔴 Low';

            // Prepare metadata with enhanced confidence metrics
            const metadata = {
              language: status.result.metadata?.language || status.result.language || 'auto-detected',
              languageName: status.result.metadata?.language_name || 
                supportedLanguages.find(l => l.code === status.result.language)?.name,
              totalDurationMinutes: status.result.metadata?.total_duration_minutes,
              participantCount: status.result.metadata?.participant_count,
              chunksAnalyzed: status.result.metadata?.chunks_analyzed,
              // Direct access to confidence_metrics - not nested in metadata
              confidenceMetrics: status.result.confidence_metrics || existingConfidenceMetrics
            };
            
            console.log('Prepared metadata with confidence metrics:', metadata.confidenceMetrics);
            
            // Process speaker summaries with confidence information
            const speakerContributions = Object.entries(status.result.speaker_summaries || {}).map(([name, data]) => {
              // Calculate average confidence for this speaker if data is available
              let speakerConfidence = null;
              if (status.result.transcript && Array.isArray(status.result.transcript)) {
                const speakerSegments = status.result.transcript.filter(s => `Speaker ${s.speaker}` === name);
                if (speakerSegments.length > 0) {
                  const confidences = speakerSegments
                    .filter(s => s.confidence !== undefined && s.confidence !== null)
                    .map(s => s.confidence);
                  
                  if (confidences.length > 0) {
                    speakerConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
                  }
                }
              }
              
              return {
                name,
                summary: data.brief_summary || '',
                keyContributions: data.key_contributions || [],
                actionItems: data.action_items || [],
                questionsRaised: data.questions_raised || [],
                confidence: speakerConfidence
              };
            });
            
            // Use the confidence metrics from either the API response or the existing summary
            const finalConfidenceMetrics = status.result.confidence_metrics || existingConfidenceMetrics;
            
            console.log('Final confidence metrics for summary:', finalConfidenceMetrics);
            
            setSummary({
              meetingSummary: status.result.meeting_summary.summary || '',
              keyPoints: status.result.meeting_summary.key_points || [],
              decisions: status.result.meeting_summary.decisions || [],
              actionItems: (status.result.action_items || []).map(item => ({
                title: item.action || '',
                assignee: item.assignee || 'Unassigned',
                dueDate: item.due_date || 'Not specified',
                priority: item.priority || 'Medium'
              })),
              speakerContributions: speakerContributions,
              metadata: metadata,
              // Add confidence_metrics directly to match TranscriptPreview expectations
              confidence_metrics: finalConfidenceMetrics,
              transcript: status.result
            });
            
            setShowSummary(true);
            setProcessingStatus('Summary generated successfully!');
          } catch (err) {
            console.error("Error processing summary data:", err);
            setError("Error processing summary data: " + err.message);
          }
        }
        
        setIsProcessing(false);
      } 
      else if (status.status === 'failed') {
        console.log(`[${new Date().toISOString()}] Job failed:`, jobId);
        clearInterval(pollingIntervalRef.current);
        setError(`Error: ${status.message || 'Processing failed'}`);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error checking job status:`, error);
      setProcessingStatus('Checking status... Please wait.');
    
    if (error.message && error.message.includes('Network Error')) {
    clearInterval(pollingIntervalRef.current);
      setError('Network error while checking status. Please try again.');
      setIsProcessing(false);
    }
  }
};

  // File upload handler with FastAPI integration
  
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
  
    if (file) {
    setUploadedFile(file);
    setError(null);
    
    try {
      setIsProcessing(true);
      setProcessingStatus('Uploading file...');
      setProcessingProgress(10);
      setShowSummary(false);
      setSummary(null);
      
      let response;
      
      if (inputMethod === 'audio') {
        console.log(`[${new Date().toISOString()}] Starting audio upload for: ${file.name}`);
        response = await meetingSummarizerApi.uploadAudio(
          file, 
          language, 
          isLongRecording
        );
        
        console.log(`[${new Date().toISOString()}] Initial upload response:`, response);
        
        if (response && response.job_id) {
          console.log(`[${new Date().toISOString()}] Starting job polling for ID: ${response.job_id}`);
          setProcessingStatus('File uploaded. Processing will start soon.');
          startJobPolling(response.job_id);
        } else {
          throw new Error('No job ID received from server');
        }
      } else if (inputMethod === 'uploadText') {
        // Upload text file to backend
        console.log("Attempting to upload text file:", file.name);
        response = await meetingSummarizerApi.uploadText(file);
        
        console.log('Text upload response:', response);
        
        // Set the transcript from the response
        if (response && response.transcript) {
          setTranscript(response.transcript);
          
          // Set participants if available in the response
          if (response.participants && response.participants.length > 0) {
            setParticipants(response.participants.join(', '));
          }
          
          setProcessingStatus('Text file processed successfully!');
          setProcessingProgress(100);
          setIsProcessing(false);
        } else {
          setError('No transcript found in the uploaded file.');
          setIsProcessing(false);
        }
        }
      } catch (error) {
        console.error('Upload failed:', error);
      
      // Show a more user-friendly error message
      let errorMessage = 'Upload failed: ';
      
      if (error.message && error.message.includes('Network Error')) {
        errorMessage += 'Cannot connect to the server. Please check your network connection and make sure the API server is running.';
      } else if (error.response && error.response.status === 413) {
        errorMessage += 'File is too large. Please try a smaller file.';
      } else if (error.response && error.response.data && error.response.data.detail) {
        errorMessage += error.response.data.detail;
      } else {
        errorMessage += error.message || 'Unknown error occurred';
      }
      
      setError(errorMessage);
      setIsProcessing(false);
    }
  }
};

  // Replace your current handleDrop function with this one
  const handleDrop = async (event) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
    // IMMEDIATELY update the UI to show the file was dropped
    setUploadedFile(file);
    setError(null);
    
    // Then process in the background
      try {
        setIsProcessing(true);
        setProcessingStatus('Uploading file...');
      setProcessingProgress(10);
      setShowSummary(false);
      setSummary(null);
      
      let response;
      
      // Check if this is an audio or text file upload
      if (inputMethod === 'audio') {
        // Upload audio file to backend
        console.log("Attempting to upload audio file (drop):", file.name);
        response = await meetingSummarizerApi.uploadAudio(
          file, 
          language, 
          isLongRecording
        );
        
        console.log("Upload audio response (drop):", response);
        
        // Check if we received a job ID and start polling regardless of initial status
        if (response && response.job_id) {
          setProcessingStatus('File uploaded. Processing will start soon.');
          startJobPolling(response.job_id);
        } else {
          throw new Error('No job ID received from server');
        }
      } else if (inputMethod === 'uploadText') {
        // Upload text file to backend
        console.log("Attempting to upload text file (drop):", file.name);
        response = await meetingSummarizerApi.uploadText(file);
        
        console.log('Text upload response (drop):', response);
        
        // Set the transcript from the response
        if (response && response.transcript) {
          setTranscript(response.transcript);
          
          // Set participants if available in the response
          if (response.participants && response.participants.length > 0) {
            setParticipants(response.participants.join(', '));
          }
          
          setProcessingStatus('Text file processed successfully!');
          setProcessingProgress(100);
          setIsProcessing(false);
        } else {
          setError('No transcript found in the uploaded file.');
          setIsProcessing(false);
        }
        }
      } catch (error) {
        console.error('Upload failed:', error);
      
      // Show a more user-friendly error message
      let errorMessage = 'Upload failed: ';
      
      if (error.message && error.message.includes('Network Error')) {
        errorMessage += 'Cannot connect to the server. Please check your network connection and make sure the API server is running.';
      } else if (error.response && error.response.status === 413) {
        errorMessage += 'File is too large. Please try a smaller file.';
      } else if (error.response && error.response.data && error.response.data.detail) {
        errorMessage += error.response.data.detail;
      } else {
        errorMessage += error.message || 'Unknown error occurred';
      }
      
      setError(errorMessage);
      setIsProcessing(false);
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = () => {
    // Clear current file and reset states
    setUploadedFile(null);
    setIsProcessing(false);
    setProcessingStatus('');
    setProcessingProgress(0);
    setShowSummary(false);
    setSummary(null);
    setError(null);
    
    // Clear any active polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
  };

  const handleGenerateSummary = async () => {
    try {
      console.log('========== GENERATING SUMMARY ==========');
      console.log('Additional context:', additionalContext);
      
      setIsProcessing(true);
      setShowSummary(false);
      setSummary(null);
      setError(null);
      setProcessingStatus('Preparing to generate summary...');
      setProcessingProgress(5);
      
      let response;
      
      // For both audio and text inputs
      if (transcript) {
        const participantsList = participants 
          ? participants.split(',').map(p => p.trim())
          : [];
          
        // Try to extract participants if none are provided
        if (participantsList.length === 0) {
          try {
            setProcessingStatus('Extracting participants from transcript...');
            setProcessingProgress(10);
            
            const extractedParticipants = await meetingSummarizerApi.submitTranscript(transcript);
            
            if (Array.isArray(extractedParticipants) && extractedParticipants.length > 0) {
              setParticipants(extractedParticipants.join(', '));
              
              setProcessingStatus(`Generating summary with ${extractedParticipants.length} participants...`);
              setProcessingProgress(20);
              
              // Store additionalContext in a variable before sending
              const contextToSend = additionalContext.trim();
              
              console.log('Data being sent to backend for summary generation:', {
                transcript,
                participants: extractedParticipants,
                language,
                isLongRecording,
                additionalContext: contextToSend,
              });
            
              response = await meetingSummarizerApi.generateSummary(
                transcript,
                extractedParticipants,
                language,
                isLongRecording,
                contextToSend
              );
            } else {
              throw new Error('Could not identify participants. Please enter participants manually.');
            }
          } catch (error) {
            console.error('Participant extraction error:', error);
            throw new Error('Could not identify participants. Please enter participants manually.');
          }
        } else {
          // Use provided participants
          setProcessingStatus(`Generating summary with ${participantsList.length} participants: ${participantsList.join(', ')}`);
          setProcessingProgress(20);
        
          // Store additionalContext in a variable before sending
          const contextToSend = additionalContext.trim();
          
          console.log('Data being sent to backend for summary generation:', {
            transcript,
            participants: participantsList,
            language,
            isLongRecording,
            additionalContext: contextToSend,
          });

          response = await meetingSummarizerApi.generateSummary(
            transcript,
            participantsList,
            language,
            isLongRecording,
            contextToSend
          );
        }
      } else {
        throw new Error('No transcript available. Please upload audio or enter text first.');
      }
      
      console.log("Summary generation response:", response);
      
      // If we get a job ID, start polling for results
      if (response && response.job_id) {
        setProcessingStatus('Summary generation started. This may take a few minutes...');
        startJobPolling(response.job_id);
      } else if (response && response.meeting_summary) {
        // If we got the summary immediately without a job
        try {
          // Save the existing confidence metrics before we potentially overwrite them
          const existingConfidenceMetrics = summary?.confidence_metrics;
          console.log('Existing confidence metrics before summary generation:', existingConfidenceMetrics);
          
          // Prepare metadata with confidence metrics if available
          const metadata = {
            language: response.metadata?.language || language || 'auto-detected',
            languageName: response.metadata?.language_name || 
              supportedLanguages.find(l => l.code === (response.metadata?.language || language))?.name,
            totalDurationMinutes: response.metadata?.total_duration_minutes,
            participantCount: response.metadata?.participant_count || participantsList.length,
            chunksAnalyzed: response.metadata?.chunks_analyzed,
            confidenceMetrics: response.confidence_metrics || existingConfidenceMetrics
          };
          
          console.log('Prepared metadata with confidence metrics:', metadata.confidenceMetrics);
          
          // Process speaker summaries with any available confidence information
          const speakerContributions = Object.entries(response.speaker_summaries || {}).map(([name, data]) => {
            // Calculate average confidence for this speaker if data is available
            let speakerConfidence = null;
            
            if (response.transcript && Array.isArray(response.transcript)) {
              const speakerSegments = response.transcript.filter(s => `Speaker ${s.speaker}` === name);
              if (speakerSegments.length > 0) {
                const confidences = speakerSegments
                  .filter(s => s.confidence !== undefined && s.confidence !== null)
                  .map(s => s.confidence);
                
                if (confidences.length > 0) {
                  speakerConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
                }
              }
            }
            
            return {
              name,
              summary: data.brief_summary || '',
              keyContributions: data.key_contributions || [],
              actionItems: data.action_items || [],
              questionsRaised: data.questions_raised || [],
              confidence: speakerConfidence
            };
          });
          
          // Use the confidence metrics from either the API response or the existing summary
          const finalConfidenceMetrics = response.confidence_metrics || existingConfidenceMetrics;
          
          console.log('Final confidence metrics for summary:', finalConfidenceMetrics);
          
          setSummary({
            meetingSummary: response.meeting_summary.summary || '',
            keyPoints: response.meeting_summary.key_points || [],
            decisions: response.meeting_summary.decisions || [],
            actionItems: (response.action_items || []).map(item => ({
              title: item.action || '',
              assignee: item.assignee || 'Unassigned',
              dueDate: item.due_date || 'Not specified',
              priority: item.priority || 'Medium'
            })),
            speakerContributions: speakerContributions,
            metadata: metadata,
            // Add confidence_metrics directly to match TranscriptPreview
            confidence_metrics: finalConfidenceMetrics,
            transcript: response
          });
          
          setShowSummary(true);
          setProcessingStatus('Summary generated successfully!');
          setProcessingProgress(100);
        setIsProcessing(false);
        } catch (err) {
          console.error("Error processing summary data:", err);
          setError("Error processing summary data: " + err.message);
        }
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      setError('Error generating summary: ' + (error.message || 'An unknown error occurred'));
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  useEffect(() => {
    console.log('SummaryView received summary:', {
      hasMetadata: !!summary?.metadata,
      hasConfidenceMetrics: !!summary?.metadata?.confidenceMetrics,
      confidenceAverage: summary?.metadata?.confidenceMetrics?.average
    });
  }, [summary]);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] mt-0">
      
      {/* Sidebar - fixed width, scrollable */}
        <div className="w-80 min-w-64 bg-gray-50">
          <TipsSection />
        </div>
        
        {/* Main content area */}
      <div className="flex-1 overflow-auto">
  <div className="px-4 md:px-8 lg:px-12 py-4">
    <div className="max-w-4xl mx-auto">

      {/* Input Method Selector */}
      <InputMethodSelector 
        inputMethod={inputMethod}
        setInputMethod={setInputMethod}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* File Upload Section */}
            <div className="bg-white shadow-md rounded-xl p-6 mb-8">
        {inputMethod === 'audio' ? (
          <>
            <AudioUpload
              isLongRecording={isLongRecording}
              setIsLongRecording={setIsLongRecording}
              uploadedFile={uploadedFile}
              handleFileUpload={handleFileUpload}
              handleDrop={handleDrop}
              handleDragOver={handleDragOver}
              handleDragLeave={handleDragLeave}
              isDragging={isDragging}
              removeFile={removeFile}
              fileInputRef={fileInputRef}
              formatFileSize={formatFileSize}
              language={language}
              setLanguage={setLanguage}
              supportedLanguages={supportedLanguages}
              isLoadingLanguages={isLoadingLanguages}
            />
            {uploadedFile && (
              <div className="mt-6 space-y-4">
                {/* Show transcript preview when available, regardless of processing state */}
                {transcript && (
                  <TranscriptPreview 
                    transcript={{ 
                      transcript: transcript,
                      ...(summary?.transcript && summary.transcript),
                      confidence_metrics: summary?.confidence_metrics
                    }} 
                  />
                )}
                
                {/* Only show generate button if not processing and summary is not shown yet */}
                {transcript && !isProcessing && !showSummary && (
                  <>
                    <AdditionalContextInput
                      additionalContext={additionalContext}
                      setAdditionalContext={setAdditionalContext}
                    />
                    
                    <button 
                      className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 w-full"
                      onClick={handleGenerateSummary}
                    >
                      Generate Summary
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        ) : inputMethod === 'uploadText' ? (
                <>
          <TextUpload
            uploadedFile={uploadedFile}
            handleFileUpload={handleFileUpload}
            handleDrop={handleDrop}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            isDragging={isDragging}
            removeFile={removeFile}
            fileInputRef={fileInputRef}
            formatFileSize={formatFileSize}
            isProcessing={isProcessing}
          />
                  {/* Show participants input only for text uploads */}
                  {uploadedFile && (
                    <div className="mt-4 space-y-4">
                      <ParticipantsInput
                        participants={participants}
                        setParticipants={setParticipants}
                      />
                      
                      {/* Keep ProcessingStatus inside a container */}
                      <div className="bg-white rounded-lg">
                        <ProcessingStatus 
                          isProcessing={isProcessing}
                          status={processingStatus}
                          progress={processingProgress}
                        />
                      </div>
                      
                      {transcript && (
                        <>
                          {/* Always display transcript preview when available */}
                          <TranscriptPreview 
                            transcript={{ 
                              transcript: transcript,
                              ...(summary?.transcript && summary.transcript),
                              confidence_metrics: summary?.confidence_metrics
                            }} 
                          />
                          
                          {/* Only show generate button if not processing and summary not shown yet */}
                          {!isProcessing && !showSummary && (
                            <>
                              <AdditionalContextInput
                                additionalContext={additionalContext}
                                setAdditionalContext={setAdditionalContext}
                              />
                              
                              <button 
                                className="mt-4 bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 w-full"
                                onClick={handleGenerateSummary}
                              >
                                Generate Summary
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </>
        ) : (
          <>
            <TextInput
              transcript={transcript}
              setTranscript={setTranscript}
              inputMethod={inputMethod}
            />
            {transcript && (
              <div className="mt-4">
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-gray-700 text-sm mb-1">Language (optional)</label>
                    <select
                      className="border border-gray-300 rounded-lg py-2 px-3 w-full"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                            <option value="auto">Auto-detect</option>
                            {supportedLanguages && supportedLanguages.length > 0 && 
                              supportedLanguages
                              .filter(lang => lang.code !== 'auto')
                              .map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                              ))
                            }
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm mb-1">Long Recording</label>
                    <div className="flex items-center h-[42px]">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={isLongRecording}
                          onChange={(e) => setIsLongRecording(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer peer-focus:ring-blue-300"></div>
                      </label>
                    </div>
                  </div>
                </div>

                      {/* Show participants input only for text inputs */}
                      <ParticipantsInput
                        participants={participants}
                        setParticipants={setParticipants}
                      />

                {/* Keep ProcessingStatus inside a container */}
                <div className="bg-white rounded-lg">
                  <ProcessingStatus 
                    isProcessing={isProcessing}
                    status={processingStatus}
                    progress={processingProgress}
                  />
                </div>
                
                {transcript && (
                  <>
                    {/* Always display transcript preview when available */}
                    <TranscriptPreview 
                      transcript={{ 
                        transcript: transcript,
                        ...(summary?.transcript && summary.transcript),
                        confidence_metrics: summary?.confidence_metrics
                      }} 
                    />
                    
                    {/* Only show generate button if not processing and summary not shown yet */}
                    {!isProcessing && !showSummary && (
                      <>
                        <AdditionalContextInput
                          additionalContext={additionalContext}
                          setAdditionalContext={setAdditionalContext}
                        />
                        
                        <button 
                          className="mt-4 bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 w-full"
                          onClick={handleGenerateSummary}
                        >
                          Generate Summary
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Summary View */}
      {showSummary && summary && (
  <>
    <SummaryView 
      summary={summary} 
      isEditable={true}
    />
                
               
              </>
      )}
    </div>
  </div>
</div>
</main>
  );
}

export default Home;