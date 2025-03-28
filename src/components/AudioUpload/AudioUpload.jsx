import React, { useState, useRef, useEffect } from 'react';

function AudioUpload({
  isLongRecording,
  setIsLongRecording,
  uploadedFile,
  handleFileUpload,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  isDragging,
  removeFile,
  fileInputRef,
  formatFileSize,
  language,
  setLanguage,
  supportedLanguages,
  isLoadingLanguages
}) {
  // Add state for audio player
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef(null);
  
  // Update audio URL when file changes
  useEffect(() => {
    if (uploadedFile && audioRef.current) {
      const fileURL = URL.createObjectURL(uploadedFile);
      audioRef.current.src = fileURL;
      
      // Clean up URL on unmount
      return () => {
        URL.revokeObjectURL(fileURL);
      };
    }
  }, [uploadedFile]);
  
  // Handle play/pause
  const togglePlayPause = (e) => {
    e.stopPropagation(); // Prevent triggering parent click
    
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error("Error playing audio:", error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Handle time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  // Handle loaded metadata
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };
  
  // Handle seek
  const handleSeek = (e) => {
    e.stopPropagation(); // Prevent triggering parent click
    const progressBar = e.currentTarget;
    const boundingRect = progressBar.getBoundingClientRect();
    const seekPosition = (e.clientX - boundingRect.left) / boundingRect.width;
    
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      audioRef.current.currentTime = seekPosition * audioRef.current.duration;
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  // Format time in seconds to MM:SS
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "00:00";
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full animate-fade-in max-w-lg mx-auto">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-gray-500 text-sm mb-1">
            Audio Language
          </label>
          <select
            className="border border-gray-300 rounded-lg p-2 w-full"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isLoadingLanguages}
          >
            {isLoadingLanguages ? (
              <option value="">Loading languages...</option>
            ) : (
              <>
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
              </>
            )}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-gray-500 text-sm mb-1">
            Recording Length
          </label>
          <div className="radio-group">
            <label
              className={`radio-item ${!isLongRecording ? 'bg-gray-200 text-gray-800' : 'text-gray-500'}`}
              data-state={!isLongRecording ? "checked" : "unchecked"}
            >
              <input
                type="radio"
                className="sr-only"
                name="recording-length"
                checked={!isLongRecording}
                onChange={() => setIsLongRecording(false)}
              />
              <span>Standard</span>
            </label>
            <label
              className={`radio-item ${isLongRecording ? 'bg-gray-200 text-gray-800' : 'text-gray-500'}`}
              data-state={isLongRecording ? "checked" : "unchecked"}
            >
              <input
                type="radio"
                className="sr-only"
                name="recording-length"
                checked={isLongRecording}
                onChange={() => setIsLongRecording(true)}
              />
              <span>Long (15min+)</span>
            </label>
          </div>
        </div>
      </div>

      {!uploadedFile ? (
        <div
          className={`border-2 border-dashed border-blue-300 rounded-lg p-6 text-center ${
            isDragging ? 'bg-gray-50' : ''
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current.click()}
        >
          <div className="flex flex-col items-center">
            {/* Mic Icon */}
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-500"
              >
                <path d="M12 1v11a4 4 0 0 0 4 4h0a4 4 0 0 0 4-4V7" />
                <path d="M5 10v4a7 7 0 0 0 14 0v-4" />
                <line x1="12" x2="12" y1="19" y2="23" />
                <line x1="8" x2="16" y1="23" y2="23" />
              </svg>
            </div>
            {/* Text */}
            <p className="text-gray-700 font-medium text-lg">
              Upload Audio File
            </p>
            <p className="text-gray-500 text-sm">
              Drag and drop your audio file here, or click to browse. We support MP3, WAV, and M4A files.
            </p>
            {/* Upload Button */}
            <button className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 shadow-md hover:bg-blue-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" x2="12" y1="3" y2="15" />
              </svg>
              Browse Files
            </button>
            {/* Hidden File Input */}
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".wav,.mp3,.m4a"
            />
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-300 rounded-lg p-5 flex flex-col shadow-sm hover:shadow-md transition-shadow">
          {/* File info and remove button */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center flex-1 min-w-0">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mr-3 shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M17.5 22h.5c.5 0 1-.2 1.4-.6.4-.4.6-.9.6-1.4V7.5L14.5 2H6c-.5 0-1 .2-1.4.6C4.2 3 4 3.5 4 4v3" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M10 20v-1a2 2 0 1 1 4 0v1a2 2 0 1 1-4 0z" />
                  <path d="M6 10v8h.01" />
                  <circle cx="6" cy="18" r="2" />
                  <path d="M12 10v.01" />
                  <path d="M12 14v.01" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 font-medium truncate max-w-[240px]">{uploadedFile.name}</p>
                <p className="text-gray-500 text-sm">{formatFileSize(uploadedFile.size)}</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              className="p-2 hover:bg-gray-50 rounded-full transition text-gray-400 hover:text-gray-600"
              aria-label="Remove file"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
          
          {/* Audio Player */}
          <div className="pt-4 border-t border-gray-100 relative rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 p-4">
            <audio 
              ref={audioRef}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            ></audio>
            
            {/* Play/Pause button and time display */}
            <div className="flex items-center justify-between mb-3">
              <button 
                onClick={togglePlayPause}
                className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all transform hover:scale-105"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                )}
              </button>
              <div className="text-sm font-medium text-indigo-700 bg-blue-50 px-3 py-1 rounded-full shadow-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            
            {/* Progress bar */}
            <div 
              className="relative w-full h-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full overflow-hidden cursor-pointer shadow-inner"
              onClick={handleSeek}
            >
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-100 ease-out rounded-full overflow-hidden"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              >
                <div className="absolute top-0 right-0 bg-white w-3 h-3 rounded-full shadow-md transform translate-x-1/2 translate-y-0"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent shine-animation"></div>
              </div>
            </div>
            
            {/* Add animation styles */}
            <style jsx>{`
              @keyframes shine {
                0% {
                  background-position: -100% 0;
                }
                100% {
                  background-position: 100% 0;
                }
              }
              .shine-animation {
                background-size: 200% 100%;
                animation: shine 2s infinite linear;
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
}

export default AudioUpload;
