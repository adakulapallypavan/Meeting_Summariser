import axios from 'axios';

// Use relative URLs for API endpoints
const API_BASE_URL = ''; // Empty string for relative URLs

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000,
});

// API functions for meeting summarizer
const meetingSummarizerApi = {
  // Get supported languages
  getLanguages: async function() {
    try {
      const response = await apiClient.get('/api/languages');
      return response.data || [{ code: 'auto', name: 'Auto-detect' }];
    } catch (error) {
      console.error('Failed to fetch languages:', error);
      // Return a default list if API fails
      return [
        { code: 'auto', name: 'Auto-detect' },
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'Hindi' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'zh', name: 'Chinese' },
        { code: 'ja', name: 'Japanese' },
        { code: 'ru', name: 'Russian' },
        { code: 'ar', name: 'Arabic' }
      ];
    }
  },
  
  // Upload audio file
  uploadAudio: async function(file, language = 'auto', isLongRecording = false) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add language if provided - making sure not to send 'auto' to backend
    if (language && language !== 'auto') {
      formData.append('language', language);
    }
    
    // Add long recording flag - ensure it's properly formatted for backend
    formData.append('is_long_recording', isLongRecording);
    
    try {
      const response = await apiClient.post('/api/upload-audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 600000, // 10 minutes for potentially large audio files
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading audio:', error);
      throw error;
    }
  },
  
  // Upload text file
  uploadText: async function(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await apiClient.post('/api/upload-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000,
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading text file:', error);
      throw error;
    }
  },
  
  // Submit transcript for participant extraction
  submitTranscript: async function(transcript, participants = null, language = null) {
    const payload = {
      transcript,
      participants,
      language
    };
    
    try {
      const response = await apiClient.post('/api/extract-participants', payload);
      return response.data;
    } catch (error) {
      console.error('Error extracting participants:', error);
      throw error;
    }
  },
  
  // Generate summary
  generateSummary: async function(transcript, participants, language = null, isLongRecording = false) {
    // Format participants correctly - ensure it's an array
    const formattedParticipants = Array.isArray(participants) 
      ? participants 
      : participants.split(',').map(p => p.trim()).filter(p => p);
    
    // Structure the request according to backend expectations
    const payload = {
      transcript,
      participants: formattedParticipants,
      language: language === 'auto' ? null : language, // Don't send 'auto' to backend
      is_long_recording: isLongRecording
    };
    
    try {
      const response = await apiClient.post('/api/summarize', payload);
      return response.data;
    } catch (error) {
      console.error('Error generating summary:', error);
      throw error;
    }
  },
  
  // Check job status
  checkJobStatus: async function(jobId) {
    if (!jobId) {
      throw new Error('Job ID is required');
    }
    
    try {
      const response = await apiClient.get(`/api/job/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking job status:', error);
      throw error;
    }
  },
  
  // Health check
  checkHealth: async function() {
    try {
      const response = await apiClient.get('/api/health');
      return response.data;
    } catch (error) {
      console.error('API health check failed');
      throw error;
    }
  }
};

export default meetingSummarizerApi;