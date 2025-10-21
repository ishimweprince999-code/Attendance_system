import React, { useState, useEffect } from 'react';
import { recordAttendance, getTodayAttendance, getStudents, manuallyMarkAbsent } from '../services/api';

const ManualInput = () => {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [todayRecords, setTodayRecords] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTodayAttendance();
    loadStudents();
  }, []);

  const loadTodayAttendance = async () => {
    try {
      const records = await getTodayAttendance();
      setTodayRecords(records);
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  };

  const loadStudents = async () => {
    try {
      const studentList = await getStudents();
      setStudents(studentList);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const handleManualAttendance = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      setMessage('Please select a student');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const student = students.find(s => s.id === selectedStudent);
      if (!student) {
        throw new Error('Student not found');
      }

      // Use the student's card_id to record attendance
      const result = await recordAttendance(student.card_id);
      setMessage(result.message);
      setMessageType(result.success ? 'success' : 'error');
      setSelectedStudent('');
      loadTodayAttendance();
      
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
    } finally {
      setLoading(false);
    }
  };

  const handleManualAbsent = async (studentId) => {
    if (window.confirm('Are you sure you want to mark this student as absent?')) {
      try {
        const result = await manuallyMarkAbsent(studentId);
        setMessage(result.message);
        setMessageType('success');
        loadTodayAttendance();
        
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 3000);
      } catch (error) {
        setMessage('Error marking student as absent: ' + error.message);
        setMessageType('error');
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 3000);
      }
    }
  };

  // Get students who haven't attended today
  const pendingStudents = students.filter(student => 
    !todayRecords.some(record => record.student_id === student.id)
  );

  // Get students who have attended today
  const presentStudents = students.filter(student => 
    todayRecords.some(record => record.student_id === student.id && record.status === 'present')
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Manual Attendance Input</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          📝 Manual Input for Testing
        </h3>
        <p className="text-blue-700">
          Use this page to simulate card swipes by manually selecting students. 
          This is for testing without physical cards.
        </p>
      </div>

      {/* Manual Input Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Record Manual Attendance</h2>
        <form onSubmit={handleManualAttendance} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Student
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Choose a student...</option>
              {pendingStudents.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} (Card: {student.card_id}) - {student.class}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              {pendingStudents.length} students pending attendance
            </p>
          </div>
          
          <button
            type="submit"
            disabled={loading || !selectedStudent}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Recording...' : 'Record Attendance'}
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

      {/* Student Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Students */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">
            ⏰ Students Pending Attendance ({pendingStudents.length})
          </h2>
          {pendingStudents.length === 0 ? (
            <p className="text-yellow-700 text-center py-4">All students have checked in today!</p>
          ) : (
            <div className="space-y-3">
              {pendingStudents.map(student => (
                <div key={student.id} className="bg-white rounded-lg p-3 border border-yellow-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-800">{student.name}</h3>
                      <p className="text-sm text-gray-600">Card: {student.card_id} | Class: {student.class}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedStudent(student.id);
                          document.querySelector('select')?.focus();
                        }}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        Mark Present
                      </button>
                      <button
                        onClick={() => handleManualAbsent(student.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                      >
                        Mark Absent
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Present Students */}
        <div className="bg-green-50 border border-green-200 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-800">
            ✅ Present Students ({presentStudents.length})
          </h2>
          {presentStudents.length === 0 ? (
            <p className="text-green-700 text-center py-4">No students have checked in yet.</p>
          ) : (
            <div className="space-y-3">
              {presentStudents.map(student => {
                const record = todayRecords.find(r => r.student_id === student.id);
                return (
                  <div key={student.id} className="bg-white rounded-lg p-3 border border-green-300">
                    <div>
                      <h3 className="font-semibold text-gray-800">{student.name}</h3>
                      <p className="text-sm text-gray-600">Card: {student.card_id} | Class: {student.class}</p>
                      <p className="text-xs text-green-600 mt-1">
                        Checked in: {record?.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManualInput;