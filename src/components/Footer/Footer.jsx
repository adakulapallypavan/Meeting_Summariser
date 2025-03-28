import React from 'react';

const Footer = () => {
  return (
    <footer className="py-6 px-6 bg-white-50 border-t border-gray-100 w-full">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h3>
            <div className="space-y-2">
              <a href="mailto:info@carnotresearch.com" className="text-gray-500 hover:text-kannot-blue block transition-colors text-sm">
                info@carnotresearch.com
              </a>
              <a href="mailto:contact@carnotresearch.com" className="text-gray-500 hover:text-kannot-blue block transition-colors text-sm">
                contact@carnotresearch.com
              </a>
            </div>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal</h3>
            <div className="space-y-2">
              <a href="https://carnotresearch.com/terms.html" className="text-gray-500 hover:text-kannot-blue block transition-colors text-sm">
                Terms of Service
              </a>
              <a href="https://carnotresearch.com/refund.html" className="text-gray-500 hover:text-kannot-blue block transition-colors text-sm">
                Refund Policy
              </a>
            </div>
          </div>

          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
            <p className="text-gray-500 text-sm">
              Meeting Summarizer by Carnot Research helps you convert meeting recordings into actionable insights and summaries.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-100 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Carnot Research. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;