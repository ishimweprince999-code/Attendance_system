import React, { useState, useEffect } from 'react';
import { recordAttendance, getTodayAttendance } from '../services/api';

const Attendance = () => {
  const [cardId, setCardId] = useState('');
  const [todayRecords, setTodayRecords] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  useEffect(() => {
    loadTodayAttendance();
  }, []);

  const loadTodayAttendance = async () => {
    try {
      const records = await getTodayAttendance();
      setTodayRecords(records);
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  };

  const handleCardSwipe = async (e) => {
    e.preventDefault();
    
    // Validate cardId is not empty
    if (!cardId.trim()) {
      setMessage('Please enter a card ID');
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
      return;
    }

    try {
      const result = await recordAttendance(cardId.trim());
      setMessage(result.message);
      setMessageType(result.success ? 'success' : 'error');
      setCardId('');
      loadTodayAttendance(); // Refresh the list
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    } catch (error) {
      setMessage(error.message || 'Error recording attendance');
      setMessageType('error');
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Attendance Recording</h1>
      
      {/* Card Input Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Record Attendance</h2>
        <form onSubmit={handleCardSwipe} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card ID (Try: CARD001, CARD002, CARD003)
            </label>
            <input
              type="text"
              value={cardId}
              onChange={(e) => setCardId(e.target.value)}
              placeholder="Enter CARD001, CARD002, or CARD003"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Record Attendance
          </button>
        </form>
        
        {message && (
          <div className={`mt-4 p-3 rounded-md ${
            messageType === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Today's Attendance Records */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          Today's Attendance ({todayRecords.length} records)
        </h2>
        {todayRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No attendance records for today yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Student</th>
                  <th className="px-4 py-2 text-left">Card ID</th>
                  <th className="px-4 py-2 text-left">Time</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Type</th>
                </tr>
              </thead>
              <tbody>
                {todayRecords.map((record) => (
                  <tr key={record.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{record.student_name}</td>
                    <td className="px-4 py-2 font-mono">{record.card_id}</td>
                    <td className="px-4 py-2">{record.timestamp}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        record.status === 'present' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        record.auto_marked 
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {record.auto_marked ? 'Auto' : 'Manual'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;