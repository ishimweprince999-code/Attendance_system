import React, { useState } from 'react';
import ClassSelector from '../components/attendance/ClassSelector';
import AttendanceSession from '../components/attendance/AttendanceSession';

const AttendancePage = ({ 
  students, 
  attendanceRecords, 
  setAttendanceRecords,
  activeSessions,
  setActiveSessions 
}) => {
  const [selectedClass, setSelectedClass] = useState(null);

  const handleSessionEnd = (sessionRecord) => {
    alert(`Attendance session for ${sessionRecord.class} completed!`);
    setSelectedClass(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Attendance Management</h1>
      
      {!selectedClass ? (
        <ClassSelector 
          selectedClass={selectedClass} 
          onClassChange={setSelectedClass} 
        />
      ) : (
        <AttendanceSession
          selectedClass={selectedClass}
          students={students}
          onSessionEnd={handleSessionEnd}
          attendanceRecords={attendanceRecords}
          setAttendanceRecords={setAttendanceRecords}
        />
      )}
    </div>
  );
};

export default AttendancePage;