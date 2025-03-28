import React from 'react';
import { Link2 } from 'lucide-react';

function Header() {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Meeting Summarizer
        </h1>
        <div className="w-px h-8 bg-gray-700/50"></div>
        <Link2 className="w-6 h-6 text-gray-400 hover:text-gray-300 transition-colors" />
      </div>
      <p className="text-xl text-gray-400">
        Convert your meeting recordings or transcripts into concise summaries and actionable tasks
      </p>
    </div>
  );
}

export default Header;