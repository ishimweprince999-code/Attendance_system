import React from 'react';

const Dashboard = ({ attendanceRecords, activeSessions }) => {
  const totalSessions = attendanceRecords.length;
  const totalStudents = 15; // From mock data

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Sessions</h3>
              <p className="text-2xl font-semibold">{totalSessions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">👨‍🎓</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
              <p className="text-2xl font-semibold">{totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl">⏰</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Active Sessions</h3>
              <p className="text-2xl font-semibold">{activeSessions.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Recent Attendance Sessions</h2>
        {attendanceRecords.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No attendance sessions yet</p>
        ) : (
          <div className="space-y-4">
            {attendanceRecords.slice(-5).reverse().map((record, index) => (
              <div key={record.sessionId} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{record.class} - {record.date}</h3>
                    <p className="text-sm text-gray-600">{record.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      Present: {Object.values(record.attendances).filter(status => status === 'present').length}
                    </p>
                    <p className="text-sm">
                      Absent: {Object.values(record.attendances).filter(status => status === 'absent').length}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;