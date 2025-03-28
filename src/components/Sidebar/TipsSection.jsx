import React from "react";
import { Lightbulb, Clock, Check } from "lucide-react";

const TipsSection = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-yellow-100 rounded-full">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-800">Tips for Best Results</h3>
      </div>

      <ul className="space-y-3">
        {[
          "Ensure clear audio with minimal background noise",
          "Select the correct language for better accuracy",
          "For text transcripts, include speaker names",
          "App will auto-detect participants from the transcript",
          "Mention clear deadlines for accurate action items",
          'For long recordings (> 15 mins), enable "Long Recording" option',
        ].map((tip, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="h-5 w-5 text-blue-500 mt-1" /> 
            <span className="text-gray-700">{tip}</span>
          </li>
        ))}
      </ul>

      <div className="bg-gray-50 rounded-xl p-4 mt-6">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-gray-600" />
          <h4 className="font-medium text-gray-800">Processing Long Recordings</h4>
        </div>
        <div className="text-gray-700 text-sm space-y-2">
          <p>For meetings longer than 15 minutes, we recommend:</p>
          <ol className="space-y-1 pl-5 list-decimal">
            <li>Enabling "This is a long recording" option</li>
            <li>Being patient during the processing (can take a few minutes)</li>
            <li>Avoiding your device going to sleep during processing</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TipsSection;
