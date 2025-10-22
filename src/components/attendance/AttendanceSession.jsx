import React, { useState, useEffect } from 'react';
import Timer from '../common/Timer';
import StudentAttendance from './StudentAttendance';

const AttendanceSession = ({ 
  selectedClass, 
  students, 
  onSessionEnd,
  attendanceRecords,
  setAttendanceRecords 
}) => {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [currentAttendances, setCurrentAttendances] = useState({});

  const startSession = () => {
    const newSessionId = Date.now().toString();
    setSessionId(newSessionId);
    setSessionStarted(true);
    
    // Initialize all students as absent
    const initialAttendance = {};
    students[selectedClass]?.forEach(student => {
      initialAttendance[student.id] = 'absent';
    });
    setCurrentAttendances(initialAttendance);
  };

  const handleTimeUp = (sessionId) => {
    // Save attendance records when time is up
    const sessionRecord = {
      sessionId,
      class: selectedClass,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      attendances: currentAttendances
    };
    
    setAttendanceRecords(prev => [...prev, sessionRecord]);
    setSessionStarted(false);
    onSessionEnd(sessionRecord);
  };

  const markAttendance = (studentId, status) => {
    setCurrentAttendances(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {!sessionStarted ? (
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Start Attendance Session for {selectedClass}</h2>
          <p className="text-gray-600 mb-4">Students will have 2 minutes to mark their attendance</p>
          <button
            onClick={startSession}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Start Attendance Session (2 minutes)
          </button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Attendance Session - {selectedClass}</h2>
            <Timer 
              duration={120} // 2 minutes in seconds
              onTimeUp={handleTimeUp}
              sessionId={sessionId}
            />
          </div>
          
          <StudentAttendance
            students={students[selectedClass] || []}
            currentAttendances={currentAttendances}
            onMarkAttendance={markAttendance}
          />
        </div>
      )}
    </div>
  );
};

export default AttendanceSession;