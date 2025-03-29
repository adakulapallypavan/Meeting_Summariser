import React from 'react';
import Logo from '../Logo';

const Navbar = () => {
  return (
    <header className="py-2 px-6 bg-white border-b border-gray-100 sticky top-0 z-10 backdrop-blur-lg bg-white/90">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
         <Logo /> 
        {/* <h1 className="text-xl font-mono font-bold text-gray-800 hidden md:block 
  bg-blue-100 px-3 py-1 rounded-lg">
  #MeetingSummarizer
</h1> */}
        <div className="flex items-center gap-4">
          <a href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Help</a>
          {/* <a href="#" className="btn-primary text-sm py-2">Sign Up</a> */}
        </div>
      </div>
    </header>
  );
};

export default Navbar;