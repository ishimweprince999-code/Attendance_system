import React, { useState } from 'react';
import SessionTimer from '../../components/teacher/SessionTimer';

const TeacherDashboard = ({ classes, activeSessions, onStartSession }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStartSession = async () => {
    if (!selectedClass) {
      alert('Please select a class');
      return;
    }

    setLoading(true);
    try {
      await onStartSession(selectedClass);
      alert(`Attendance session started for ${classes.find(c => c.id == selectedClass)?.name}`);
    } catch (error) {
      alert('Error starting session: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
      </div>

      {/* Quick Start Session */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Start Attendance Session</h2>
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
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {loading ? 'Starting...' : 'Start 2-Minute Session'}
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Active Sessions</h2>
        {activeSessions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No active sessions</p>
        ) : (
          <div className="grid gap-4">
            {activeSessions.map(session => (
              <div key={session.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-green-800">
                      {classes.find(c => c.id == session.class_id)?.name}
                    </h3>
                    <p className="text-sm text-green-600">Session Active</p>
                  </div>
                  <SessionTimer endTime={session.end_time} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <div className="text-2xl font-bold text-blue-600">{classes.length}</div>
          <div className="text-sm text-gray-600">Total Classes</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <div className="text-2xl font-bold text-green-600">{activeSessions.length}</div>
          <div className="text-sm text-gray-600">Active Sessions</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <div className="text-2xl font-bold text-purple-600">15</div>
          <div className="text-sm text-gray-600">Total Students</div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;