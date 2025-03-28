import React from 'react';

function TextInput({ transcript, setTranscript, inputMethod }) {
  // Handle text change with size validation
  const handleTextChange = (e) => {
    const value = e.target.value;
    if (value.length <= 100000) {
      setTranscript(value);
    }
  };

  // Determine placeholder text based on input method
  const placeholderText = inputMethod === 'text' 
    ? "Enter your meeting transcript here...\n\nExample format:\nJohn: Hi everyone, thanks for joining today.\nSarah: Glad to be here. Let's discuss the roadmap."
    : "Paste your meeting transcript here...";

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-md">
      <label className="block text-gray-600 text-sm font-medium mb-2">
        Meeting Transcript
      </label>
      
      {/* Styled Textarea */}
      <textarea
        className="w-full h-64 p-3 text-sm font-mono text-gray-800 border border-gray-300 bg-white rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
        placeholder={placeholderText}
        value={transcript}
        onChange={handleTextChange}
      ></textarea>
      
      {/* Character Count */}
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>
          {transcript && `${transcript.length.toLocaleString()} characters`}
        </span>
        {transcript.length > 80000 && (
          <span className="text-yellow-500">
            Approaching limit ({Math.round(transcript.length/1000)}K/100K chars)
          </span>
        )}
      </div>

      {/* Info Message */}
      <div className="mt-2 text-xs text-gray-500">
        <p>Include speaker names followed by a colon for better summarization results.</p>
        <p>Example: <span className="text-blue-600 font-medium">"Speaker: Text of what they said"</span></p>
      </div>
    </div>
  );
}

export default TextInput;
