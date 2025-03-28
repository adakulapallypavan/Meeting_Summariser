import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

function App() {
  return (
    <Router>
      {/* Full height layout with flex column */}
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Navbar spans full width */}
        <Navbar />
        <div className="text-center max-w-6xl mx-auto py-10 flex flex-col items-center">
          <h2 className="text-4xl font-semibold text-gray-900">
            Secure On Premise <span className="text-blue-600">Meeting Summariser</span> and <span className="text-blue-600">Action Plan generator</span>
          </h2>
          <p className="mt-3 text-gray-600 max-w-3xl text-center text-lg">
            Transform your meeting recordings and transcripts into concise summaries, action items, 
            and participant insights with our AI-powered tool.
          </p>
        </div>

        {/* Main content area */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home/>} />
          </Routes>
        </div>
        
        {/* Footer spans full width */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;