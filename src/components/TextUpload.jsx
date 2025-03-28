  {/* Text Input Section */}
  <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
    <div className="mb-6">
      <h3 className="text-lg font-medium text-gray-800 mb-2">Enter Meeting Transcript</h3>
      <p className="text-sm text-gray-600">Paste your meeting transcript text below</p>
    </div>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meeting Transcript
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Paste your meeting transcript here..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Participants (Optional)
        </label>
        <textarea
          value={participants}
          onChange={(e) => setParticipants(e.target.value)}
          className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter participant names, one per line"
        />
      </div>

      {isProcessing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Processing transcript...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!text.trim() || isProcessing}
        className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors ${
          !text.trim() || isProcessing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isProcessing ? 'Processing...' : 'Generate Summary'}
      </button>
    </div>
  </div> 