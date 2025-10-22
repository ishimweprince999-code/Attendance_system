import React, { useState, useEffect } from 'react';
import Timer from '../../components/common/Timer';

const MarkAttendance = ({ activeSessions, attendanceRecords, setAttendanceRecords }) => {
  const [rollNumber, setRollNumber] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState('');
  const [currentSession, setCurrentSession] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Mock student data
  const mockStudents = {
    S1: [
      { id: 1, name: 'John Doe', rollNumber: 'S1001' },
      { id: 2, name: 'Jane Smith', rollNumber: 'S1002' },
      { id: 3, name: 'Mike Johnson', rollNumber: 'S1003' }
    ],
    S2: [
      { id: 4, name: 'Sarah Wilson', rollNumber: 'S2001' },
      { id: 5, name: 'David Brown', rollNumber: 'S2002' }
    ],
    S3: [
      { id: 6, name: 'Emily Davis', rollNumber: 'S3001' }
    ],
    S4: [
      { id: 7, name: 'Michael Taylor', rollNumber: 'S4001' },
      { id: 8, name: 'Lisa Anderson', rollNumber: 'S4002' }
    ],
    S5: [
      { id: 9, name: 'Chris Martin', rollNumber: 'S5001' }
    ],
    S6: [
      { id: 10, name: 'Amanda Clark', rollNumber: 'S6001' }
    ],
    L3: [
      { id: 11, name: 'Robert White', rollNumber: 'L3001' },
      { id: 12, name: 'Jennifer Lee', rollNumber: 'L3002' }
    ],
    L4: [
      { id: 13, name: 'Thomas Harris', rollNumber: 'L4001' }
    ],
    L5: [
      { id: 14, name: 'Jessica Walker', rollNumber: 'L5001' },
      { id: 15, name: 'Kevin King', rollNumber: 'L5002' }
    ]
  };

  const classOptions = [
    ...['S1', 'S2', 'S3'], // O Level
    ...['S4', 'S5', 'S6'], // ACC
    ...['L3', 'L4', 'L5']  // SOD
  ];

  // Check for active session when class changes
  useEffect(() => {
    if (selectedClass) {
      const session = activeSessions.find(session => session.class === selectedClass);
      setCurrentSession(session);
    } else {
      setCurrentSession(null);
    }
  }, [selectedClass, activeSessions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!rollNumber || !selectedClass) {
      alert('Please enter both roll number and class');
      return;
    }

    // Check if session exists and is active
    if (!currentSession) {
      setAttendanceStatus('no_session');
      setIsSubmitted(true);
      return;
    }

    // Find student
    const studentsInClass = mockStudents[selectedClass] || [];
    const student = studentsInClass.find(s => s.rollNumber === rollNumber);

    if (!student) {
      setAttendanceStatus('invalid_student');
      setIsSubmitted(true);
      return;
    }

    // Check if already marked attendance
    const alreadyMarked = currentSession.attendances && 
                         currentSession.attendances[student.id] && 
                         currentSession.attendances[student.id] !== 'absent';

    if (alreadyMarked) {
      setAttendanceStatus('already_marked');
      setIsSubmitted(true);
      return;
    }

    // Mark attendance as present
    const updatedSession = {
      ...currentSession,
      attendances: {
        ...currentSession.attendances,
        [student.id]: 'present'
      }
    };

    // Update the session in active sessions (in real app, this would be an API call)
    setAttendanceStatus('success');
    setIsSubmitted(true);

    // Update attendance records
    const attendanceRecord = {
      sessionId: currentSession.sessionId,
      class: selectedClass,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      status: 'present'
    };

    setAttendanceRecords(prev => [...prev, attendanceRecord]);
  };

  const resetForm = () => {
    setRollNumber('');
    setSelectedClass('');
    setAttendanceStatus('');
    setIsSubmitted(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mark Your Attendance
          </h1>
          <p className="text-gray-600">
            Enter your details to mark attendance for active sessions
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Class Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Your Class *
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                required
              >
                <option value="">Choose your class</option>
                {classOptions.map(className => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
            </div>

            {/* Roll Number Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Roll Number *
              </label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                placeholder="Enter your roll number (e.g., S1001)"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                required
              />
            </div>

            {/* Session Status */}
            {selectedClass && (
              <div className={`p-4 rounded-lg border-2 ${
                currentSession 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-semibold ${
                      currentSession ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {currentSession ? 'Active Session' : 'No Active Session'}
                    </h3>
                    <p className={`text-sm ${
                      currentSession ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {currentSession 
                        ? `You can mark attendance for ${selectedClass}`
                        : `No active attendance session for ${selectedClass}`
                      }
                    </p>
                  </div>
                  {currentSession && (
                    <Timer 
                      duration={currentSession.timeLeft}
                      onTimeUp={() => setCurrentSession(null)}
                      sessionId={currentSession.sessionId}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!currentSession}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                currentSession
                  ? 'bg-green-500 hover:bg-green-600 text-white shadow-md'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {currentSession ? 'Mark Attendance as Present' : 'No Active Session'}
            </button>
          </form>
        ) : (
          <div className="text-center py-8">
            {/* Success Message */}
            {attendanceStatus === 'success' && (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-green-600">Attendance Marked Successfully!</h3>
                <p className="text-gray-600">
                  Your attendance has been recorded as <strong>PRESENT</strong> for {selectedClass}
                </p>
                <p className="text-sm text-gray-500">
                  Roll Number: <strong>{rollNumber}</strong>
                </p>
              </div>
            )}

            {/* Error Messages */}
            {attendanceStatus === 'no_session' && (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-red-600">No Active Session</h3>
                <p className="text-gray-600">
                  There is no active attendance session for {selectedClass} at the moment.
                </p>
                <p className="text-sm text-gray-500">
                  Please check with your teacher about attendance timing.
                </p>
              </div>
            )}

            {attendanceStatus === 'invalid_student' && (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-red-600">Student Not Found</h3>
                <p className="text-gray-600">
                  No student found with roll number <strong>{rollNumber}</strong> in {selectedClass}.
                </p>
                <p className="text-sm text-gray-500">
                  Please check your roll number and class selection.
                </p>
              </div>
            )}

            {attendanceStatus === 'already_marked' && (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-yellow-600">Already Marked</h3>
                <p className="text-gray-600">
                  Your attendance has already been marked for this session.
                </p>
                <p className="text-sm text-gray-500">
                  Roll Number: <strong>{rollNumber}</strong> | Class: <strong>{selectedClass}</strong>
                </p>
              </div>
            )}

            <button
              onClick={resetForm}
              className="mt-6 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              Mark Another Attendance
            </button>
          </div>
        )}
      </div>

      {/* Active Sessions Info */}
      <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Currently Active Sessions</h3>
        {activeSessions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No active sessions at the moment</p>
        ) : (
          <div className="space-y-3">
            {activeSessions.map(session => (
              <div key={session.sessionId} className="flex items-center justify-between p-3 border border-green-200 bg-green-50 rounded-lg">
                <div>
                  <span className="font-semibold text-green-800">{session.class}</span>
                  <span className="text-sm text-green-600 ml-2">- Active</span>
                </div>
                <Timer 
                  duration={session.timeLeft}
                  onTimeUp={() => {}}
                  sessionId={session.sessionId}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkAttendance;