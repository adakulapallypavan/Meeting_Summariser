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
    <div className={`flex items-center justify-between bg-gray-50 p-3 rounded-lg ${isProcessing ? 'file-selected-pulse border border-blue-300' : 'border border-gray-200'}`}>
      <div className="flex items-center">
        <div className={`${isProcessing ? 'bg-blue-100' : 'bg-gray-100'} p-2 rounded-full mr-3`}>
          <Upload className={`${isProcessing ? 'text-blue-500' : 'text-gray-500'} w-4 h-4`} />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-gray-800">{uploadedFile.name}</p>
          <p className="text-xs text-gray-500">{formatFileSize(uploadedFile.size)}</p>
          {isProcessing && <p className="text-xs text-blue-500 mt-1">Processing...</p>}
        </div>
      </div>
      <button 
        className="text-red-500 hover:text-red-700 text-sm"
        onClick={removeFile}
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Remove'}
      </button>
    </div>
  </div>
)}
    </div>
  );
};

export default TextUpload;
