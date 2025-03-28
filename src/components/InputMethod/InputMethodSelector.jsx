import React from "react";
import { Upload, FileText } from "lucide-react";

function InputMethodSelector({ inputMethod, setInputMethod }) {
  return (
    <div className="mb-8 text-gray-600">
      <p className="text-sm text-gray-400 mb-3">Choose input method:</p>
      <div className="flex gap-6 border-b border-gray-300 pb-1">
        {/* Upload Audio */}
        <label
          className={`flex items-center gap-2 cursor-pointer transition-colors duration-300 ${
            inputMethod === "audio"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "hover:text-blue-600"
          }`}
          onClick={() => setInputMethod("audio")}
        >
          <Upload className="w-4 h-4" />
          <span>Audio Upload</span>
        </label>

        {/* Paste Text */}
        <label
          className={`flex items-center gap-2 cursor-pointer transition-colors duration-300 ${
            inputMethod === "pasteText"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "hover:text-blue-600"
          }`}
          onClick={() => setInputMethod("pasteText")}
        >
          <FileText className="w-4 h-4" />
          <span>Paste Text</span>
        </label>

        {/* Upload Text */}
        <label
          className={`flex items-center gap-2 cursor-pointer transition-colors duration-300 ${
            inputMethod === "uploadText"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "hover:text-blue-600"
          }`}
          onClick={() => setInputMethod("uploadText")}
        >
          <Upload className="w-4 h-4" />
          <span>Text File</span>
        </label>
      </div>
    </div>
  );
}

export default InputMethodSelector;
