import React, { useState } from 'react';

const ReportsPage = ({ attendanceRecords }) => {
  const [selectedClass, setSelectedClass] = useState('all');

  const classOptions = [
    'all',
    ...['S1', 'S2', 'S3'], // O Level
    ...['S4', 'S5', 'S6'], // ACC
    ...['L3', 'L4', 'L5']  // SOD
  ];

  const filteredRecords = selectedClass === 'all' 
    ? attendanceRecords 
    : attendanceRecords.filter(record => record.class === selectedClass);

  const getAttendanceStats = () => {
    const stats = {
      totalSessions: filteredRecords.length,
      totalStudents: 0,
      present: 0,
      absent: 0,
      late: 0
    };

    filteredRecords.forEach(record => {
      const attendances = Object.values(record.attendances);
      stats.totalStudents += attendances.length;
      stats.present += attendances.filter(status => status === 'present').length;
      stats.absent += attendances.filter(status => status === 'absent').length;
      stats.late += attendances.filter(status => status === 'late').length;
    });

    return stats;
  };

  const stats = getAttendanceStats();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Attendance Reports</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Filter Reports</h2>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full md:w-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {classOptions.map(className => (
            <option key={className} value={className}>
              {className === 'all' ? 'All Classes' : className}
            </option>
          ))}
        </select>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalSessions}</div>
          <div className="text-sm text-gray-600">Sessions</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-green-600">{stats.present}</div>
          <div className="text-sm text-gray-600">Present</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
          <div className="text-sm text-gray-600">Absent</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
          <div className="text-sm text-gray-600">Late</div>
        </div>
      </div>

      {/* Detailed Report */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          Detailed Report {selectedClass !== 'all' && `- ${selectedClass}`}
        </h2>
        
        {filteredRecords.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No attendance records found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Date & Time</th>
                  <th className="text-left p-3">Class</th>
                  <th className="text-left p-3">Present</th>
                  <th className="text-left p-3">Absent</th>
                  <th className="text-left p-3">Late</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(record => {
                  const attendances = Object.values(record.attendances);
                  const present = attendances.filter(status => status === 'present').length;
                  const absent = attendances.filter(status => status === 'absent').length;
                  const late = attendances.filter(status => status === 'late').length;
                  
                  return (
                    <tr key={record.sessionId} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>{record.date}</div>
                        <div className="text-sm text-gray-600">{record.time}</div>
                      </td>
                      <td className="p-3 font-medium">{record.class}</td>
                      <td className="p-3 text-green-600">{present}</td>
                      <td className="p-3 text-red-600">{absent}</td>
                      <td className="p-3 text-yellow-600">{late}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;