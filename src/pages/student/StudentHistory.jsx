import React from 'react';

const StudentHistory = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-2">My Attendance History</h1>
        <p className="text-gray-600 mb-6">
          View your attendance records and history
        </p>

        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Attendance Records</h3>
          <p className="text-gray-500">
            Your attendance history will appear here once you start tapping your card for active sessions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentHistory;