import React, { useState, useRef } from "react";
import { Upload } from "lucide-react"; // Icon library

const TextUpload = ({ 
  handleFileUpload, 
  uploadedFile, 
  handleDrop, 
  handleDragOver, 
  handleDragLeave, 
  isDragging, 
  removeFile, 
  fileInputRef, 
  formatFileSize,
  isProcessing
}) => {
  const handleFileSelect = (event) => {
    // Pass the event to the parent's handleFileUpload function
    handleFileUpload(event);
  };

  const onDrop = (event) => {
    // Pass the event to the parent's handleDrop function
    handleDrop(event);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-6 text-center ${
        isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={onDrop}
    >
      {/* File icon */}
      <div className="flex justify-center">
        <div className="bg-blue-100 p-3 rounded-full">
          <Upload className="text-blue-500 w-8 h-8" />
        </div>
      </div>

      {/* Heading */}
      <h3 className="text-lg font-semibold mt-3">Upload Text File</h3>
      <p className="text-gray-500 text-sm">
        Drag and drop your text file here, or click to browse. We support TXT,
        DOCX, and PDF files.
      </p>

      {/* Browse Files Button */}
      <input
        type="file"
        accept=".txt,.docx,.pdf"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelect}
      />
      <button 
        className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4 flex items-center mx-auto"
        onClick={() => fileInputRef.current.click()}
      >
        <Upload className="w-4 h-4 mr-2" />
        Browse Files
      </button>

      {/* Uploaded file preview */}
      {uploadedFile && (
        <div className="mt-4">
          <div className="bg-white border border-gray-300 rounded-lg p-5 flex flex-col shadow-sm hover:shadow-md transition-shadow">
            {/* File info and remove button */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center flex-1 min-w-0">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mr-3 shadow-sm">
                  <Upload className="text-white w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 font-medium truncate max-w-[240px]">{uploadedFile.name}</p>
                  <p className="text-gray-500 text-sm">{formatFileSize(uploadedFile.size)}</p>
                  {isProcessing && <p className="text-xs text-blue-500 mt-1">Processing...</p>}
                </div>
              </div>
              <button
                onClick={removeFile}
                disabled={isProcessing}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default TextUpload;
