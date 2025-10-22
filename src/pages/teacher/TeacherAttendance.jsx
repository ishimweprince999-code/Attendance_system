import React, { useState, useEffect } from 'react';
import SessionTimer from '../../components/teacher/SessionTimer';

const API_BASE = 'http://localhost:5000/api';

const TeacherAttendance = ({ classes, activeSessions, onStartSession, onCompleteSession }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [sessionAttendance, setSessionAttendance] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentSession) {
      fetchSessionAttendance();
      const interval = setInterval(fetchSessionAttendance, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [currentSession]);

  const fetchSessionAttendance = async () => {
    if (!currentSession) return;

    try {
      const response = await fetch(`${API_BASE}/sessions/${currentSession.id}/attendance`);
      const data = await response.json();
      setSessionAttendance(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleStartSession = async () => {
    if (!selectedClass) {
      alert('Please select a class');
      return;
    }

    setLoading(true);
    try {
      const session = await onStartSession(selectedClass);
      const classObj = classes.find(c => c.id == selectedClass);
      setCurrentSession({
        id: session.session_id,
        class_id: selectedClass,
        class_name: classObj.name,
        end_time: session.end_time
      });
    } catch (error) {
      alert('Error starting session: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSession = async () => {
    if (currentSession) {
      await onCompleteSession(currentSession.id);
      setCurrentSession(null);
      setSessionAttendance([]);
    }
  };

  const getStatusCount = (status) => {
    return sessionAttendance.filter(record => record.status === status).length;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>

      {/* Session Control */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          {currentSession ? `Active Session - ${currentSession.class_name}` : 'Start New Session'}
        </h2>
        
        {!currentSession ? (
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.level})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleStartSession}
              disabled={loading || !selectedClass}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                loading || !selectedClass
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {loading ? 'Starting...' : 'Start 2-Minute Session'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <SessionTimer endTime={currentSession.end_time} />
              <button
                onClick={handleCompleteSession}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold"
              >
                End Session
              </button>
            </div>

            {/* Attendance Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{getStatusCount('PRESENT')}</div>
                <div className="text-sm text-green-800">Present</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{getStatusCount('LATE')}</div>
                <div className="text-sm text-yellow-800">Late</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{getStatusCount('ABSENT')}</div>
                <div className="text-sm text-red-800">Absent</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Attendance List */}
      {currentSession && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Student Attendance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Roll Number</th>
                  <th className="text-left p-3">Student Name</th>
                  <th className="text-left p-3">Card ID</th>
                  <th className="text-left p-3">Tap Time</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {sessionAttendance.map(record => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{record.roll_number}</td>
                    <td className="p-3">{record.student_name}</td>
                    <td className="p-3 font-mono text-sm">{record.card_id}</td>
                    <td className="p-3 text-gray-600">
                      {record.tap_time || 'Not tapped'}
                    </td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        record.status === 'PRESENT' 
                          ? 'bg-green-100 text-green-800'
                          : record.status === 'LATE'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendance;