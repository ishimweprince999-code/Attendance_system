import React, { useState } from 'react';

const API_BASE = 'http://localhost:5000/api';

const StudentAttendance = () => {
  const [cardId, setCardId] = useState('');
  const [attendanceResult, setAttendanceResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCardTap = async (e) => {
    e.preventDefault();
    
    if (!cardId.trim()) {
      alert('Please enter card ID');
      return;
    }

    setLoading(true);
    setAttendanceResult(null);

    try {
      const response = await fetch(`${API_BASE}/attendance/tap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ card_id: cardId }),
      });

      const data = await response.json();

      if (response.ok) {
        setAttendanceResult({
          type: 'success',
          message: data.message,
          status: data.status,
          time: data.tap_time
        });
      } else {
        setAttendanceResult({
          type: 'error',
          message: data.error
        });
      }
    } catch (error) {
      setAttendanceResult({
        type: 'error',
        message: 'Network error. Please try again.'
      });
    } finally {
      setLoading(false);
      setCardId('');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💳</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tap Your Card
          </h1>
          <p className="text-gray-600">
            Enter your card ID to mark attendance
          </p>
        </div>

        <form onSubmit={handleCardTap} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card ID *
            </label>
            <input
              type="text"
              value={cardId}
              onChange={(e) => setCardId(e.target.value.toUpperCase())}
              placeholder="Enter your card ID (e.g., CARD001)"
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-center font-mono"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
              loading
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md'
            }`}
          >
            {loading ? 'Processing...' : 'Tap Card'}
          </button>
        </form>

        {/* Demo Card IDs */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Demo Card IDs:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-mono">CARD001</div>
            <div>John Doe</div>
            <div className="font-mono">CARD002</div>
            <div>Jane Smith</div>
            <div className="font-mono">CARD003</div>
            <div>Mike Johnson</div>
            <div className="font-mono">CARD004</div>
            <div>Sarah Wilson</div>
          </div>
        </div>

        {/* Attendance Result */}
        {attendanceResult && (
          <div className={`mt-6 p-4 rounded-lg border-2 ${
            attendanceResult.type === 'success'
              ? attendanceResult.status === 'PRESENT'
                ? 'border-green-200 bg-green-50'
                : 'border-yellow-200 bg-yellow-50'
              : 'border-red-200 bg-red-50'
          }`}>
            <div className="text-center">
              {attendanceResult.type === 'success' ? (
                <>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    attendanceResult.status === 'PRESENT' 
                      ? 'bg-green-100' 
                      : 'bg-yellow-100'
                  }`}>
                    <span className={`text-2xl ${
                      attendanceResult.status === 'PRESENT' 
                        ? 'text-green-600' 
                        : 'text-yellow-600'
                    }`}>
                      {attendanceResult.status === 'PRESENT' ? '✓' : '⏰'}
                    </span>
                  </div>
                  <h3 className={`text-xl font-bold ${
                    attendanceResult.status === 'PRESENT' 
                      ? 'text-green-800' 
                      : 'text-yellow-800'
                  }`}>
                    {attendanceResult.status === 'PRESENT' ? 'Present!' : 'Late!'}
                  </h3>
                  <p className={`mt-1 ${
                    attendanceResult.status === 'PRESENT' 
                      ? 'text-green-600' 
                      : 'text-yellow-600'
                  }`}>
                    {attendanceResult.message}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Time: {attendanceResult.time}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl text-red-600">✗</span>
                  </div>
                  <h3 className="text-xl font-bold text-red-800">Error</h3>
                  <p className="text-red-600">{attendanceResult.message}</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;