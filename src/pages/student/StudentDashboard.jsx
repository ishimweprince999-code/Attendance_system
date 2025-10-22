import React from 'react';

const StudentDashboard = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-2xl p-8 shadow-lg mb-6">
        <h1 className="text-3xl font-bold mb-2">Student Portal</h1>
        <p className="text-green-100 text-lg">
          Welcome to the school attendance system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💳</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Tap Your Card</h3>
          <p className="text-gray-600 mb-4">
            Mark your attendance by tapping your student card
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">View History</h3>
          <p className="text-gray-600 mb-4">
            Check your attendance history and records
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">How to Use</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">1</div>
            <p>Go to "Tap Card" page</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">2</div>
            <p>Enter your card ID (e.g., CARD001)</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">3</div>
            <p>Click "Tap Card" to mark attendance</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">4</div>
            <p>Get immediate feedback on your status</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;