import React, { useState, useEffect } from 'react';
import SessionTimer from '../../components/teacher/SessionTimer';

const API_BASE = 'http://localhost:5000/api';

const ClassAttendance = ({ classes, backendStatus }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [todaySessions, setTodaySessions] = useState([]);
  const [sessionAttendance, setSessionAttendance] = useState([]);
  const [classStudents, setClassStudents] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mock student data organized by class
  const mockStudentsByClass = {
    1: [ // S1 students
      { id: 1, student_name: 'John Doe', roll_number: 'S1001', card_id: 'CARD001', status: 'PRESENT', tap_time: '08:00:15', parent_email: 'parent1@gmail.com' },
      { id: 2, student_name: 'Jane Smith', roll_number: 'S1002', card_id: 'CARD002', status: 'PRESENT', tap_time: '08:00:20', parent_email: 'parent2@gmail.com' },
      { id: 3, student_name: 'Mike Johnson', roll_number: 'S1003', card_id: 'CARD003', status: 'LATE', tap_time: '08:00:55', parent_email: 'parent3@gmail.com' }
    ],
    2: [ // S2 students
      { id: 4, student_name: 'Sarah Wilson', roll_number: 'S2001', card_id: 'CARD004', status: 'PRESENT', tap_time: '08:00:10', parent_email: 'parent4@gmail.com' },
      { id: 5, student_name: 'David Brown', roll_number: 'S2002', card_id: 'CARD005', status: 'ABSENT', tap_time: null, parent_email: 'parent5@gmail.com' }
    ],
    3: [ // S3 students
      { id: 6, student_name: 'Emily Davis', roll_number: 'S3001', card_id: 'CARD006', status: 'PRESENT', tap_time: '08:00:30', parent_email: 'parent6@gmail.com' }
    ],
    4: [ // S4 students
      { id: 7, student_name: 'Michael Taylor', roll_number: 'S4001', card_id: 'CARD007', status: 'PRESENT', tap_time: '08:00:25', parent_email: 'parent7@gmail.com' },
      { id: 8, student_name: 'Lisa Anderson', roll_number: 'S4002', card_id: 'CARD008', status: 'ABSENT', tap_time: null, parent_email: 'parent8@gmail.com' }
    ],
    5: [ // S5 students
      { id: 9, student_name: 'Chris Martin', roll_number: 'S5001', card_id: 'CARD009', status: 'PRESENT', tap_time: '08:00:18', parent_email: 'parent9@gmail.com' }
    ],
    6: [ // S6 students
      { id: 10, student_name: 'Amanda Clark', roll_number: 'S6001', card_id: 'CARD010', status: 'LATE', tap_time: '08:00:58', parent_email: 'parent10@gmail.com' }
    ],
    7: [ // L3 students
      { id: 11, student_name: 'Robert White', roll_number: 'L3001', card_id: 'CARD011', status: 'PRESENT', tap_time: '08:00:22', parent_email: 'parent11@gmail.com' },
      { id: 12, student_name: 'Jennifer Lee', roll_number: 'L3002', card_id: 'CARD012', status: 'PRESENT', tap_time: '08:00:19', parent_email: 'parent12@gmail.com' }
    ],
    8: [ // L4 students
      { id: 13, student_name: 'Thomas Harris', roll_number: 'L4001', card_id: 'CARD013', status: 'ABSENT', tap_time: null, parent_email: 'parent13@gmail.com' }
    ],
    9: [ // L5 students
      { id: 14, student_name: 'Jessica Walker', roll_number: 'L5001', card_id: 'CARD014', status: 'PRESENT', tap_time: '08:00:28', parent_email: 'parent14@gmail.com' },
      { id: 15, student_name: 'Kevin King', roll_number: 'L5002', card_id: 'CARD015', status: 'PRESENT', tap_time: '08:00:32', parent_email: 'parent15@gmail.com' }
    ]
  };

  useEffect(() => {
    if (selectedClass) {
      fetchTodaySessions();
      fetchStudentsForClass();
    } else {
      // Reset when no class is selected
      setTodaySessions([]);
      setSessionAttendance([]);
      setSelectedSession(null);
    }
  }, [selectedClass]);

  // Resolve selectedClass which may be an id or a class name (e.g. when using ClassSelector)
  const resolveClassId = (sel) => {
    if (!sel) return null;
    // If it's already a numeric id (or numeric string) and matches a class id, use it
    const byId = classes.find(c => String(c.id) === String(sel));
    if (byId) return byId.id;
    // Otherwise try matching by class name
    const byName = classes.find(c => c.name === sel);
    if (byName) return byName.id;
    // Fallback: return sel as-is (could be numeric string)
    return sel;
  };

  useEffect(() => {
    if (selectedSession) {
      fetchSessionAttendance();
      // Refresh every 5 seconds for real-time updates
      const interval = setInterval(fetchSessionAttendance, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedSession]);

  const fetchTodaySessions = async () => {
    setLoading(true);
    setError('');
    try {
      const classId = resolveClassId(selectedClass);
      const response = await fetch(`${API_BASE}/today-sessions/${classId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // API endpoint doesn't exist, use mock data
          console.log('API endpoint not found, using mock data');
          generateMockSessions();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setTodaySessions(data);
      
      // Auto-select the latest active session
      const activeSession = data.find(session => session.status === 'ACTIVE');
      if (activeSession) {
        setSelectedSession(activeSession);
      } else if (data.length > 0) {
        setSelectedSession(data[0]);
      }
    } catch (error) {
      console.error('Error fetching today sessions:', error);
      setError('Failed to load sessions. Using demo data.');
      generateMockSessions();
    } finally {
      setLoading(false);
    }
  };

  const generateMockSessions = () => {
    const now = new Date();
    const classId = resolveClassId(selectedClass);
    const classObj = classes.find(c => c.id == classId);
    const studentCount = mockStudentsByClass[classId]?.length || 0;
    
    const mockSessions = [
      {
        id: 1,
        class_id: selectedClass,
        session_date: now.toISOString().split('T')[0],
        start_time: '08:00:00',
        end_time: '08:01:00',
        status: 'COMPLETED',
        total_students: studentCount,
        present_count: Math.floor(studentCount * 0.8),
        late_count: Math.floor(studentCount * 0.1),
        absent_count: Math.floor(studentCount * 0.1)
      },
      {
        id: 2,
        class_id: selectedClass,
        session_date: now.toISOString().split('T')[0],
        start_time: '09:00:00',
        end_time: '09:01:00',
        status: 'COMPLETED',
        total_students: studentCount,
        present_count: Math.floor(studentCount * 0.9),
        late_count: Math.floor(studentCount * 0.05),
        absent_count: Math.floor(studentCount * 0.05)
      },
      {
        id: 3,
        class_id: selectedClass,
        session_date: now.toISOString().split('T')[0],
        start_time: now.toTimeString().split(' ')[0],
        end_time: new Date(now.getTime() + 60 * 1000).toTimeString().split(' ')[0],
        status: 'ACTIVE',
        total_students: studentCount,
        present_count: Math.floor(studentCount * 0.6),
        late_count: Math.floor(studentCount * 0.1),
        absent_count: Math.floor(studentCount * 0.3)
      }
    ];
    
    setTodaySessions(mockSessions);
    
    // Auto-select the active session
    const activeSession = mockSessions.find(session => session.status === 'ACTIVE');
    if (activeSession) {
      setSelectedSession(activeSession);
    } else if (mockSessions.length > 0) {
      setSelectedSession(mockSessions[0]);
    }
  };

  const fetchSessionAttendance = async () => {
    if (!selectedSession) return;
    
    try {
      const response = await fetch(`${API_BASE}/session-attendance/${selectedSession.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // API endpoint doesn't exist, use mock data
          generateMockAttendance();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSessionAttendance(data);
    } catch (error) {
      console.error('Error fetching session attendance:', error);
      // If session-attendance API fails, fallback to class students
      if (classStudents.length > 0) {
        // Map class students to attendance-like objects
        const mapped = classStudents.map(s => ({
          id: s.id,
          student_name: s.name || s.student_name || s.studentName,
          roll_number: s.roll_number || s.rollNumber,
          card_id: s.card_id || s.cardId,
          status: 'ABSENT',
          tap_time: null,
          parent_email: s.parent_email
        }));
        setSessionAttendance(mapped);
      } else {
        generateMockAttendance();
      }
    }
  };

  const generateMockAttendance = () => {
    const classId = resolveClassId(selectedClass);
    const classStudents = mockStudentsByClass[classId] || [];
    const classObj = classes.find(c => c.id == classId);
    
    // Add class name to each student
    const attendanceWithClass = classStudents.map(student => ({
      ...student,
      class_name: classObj?.name || 'Demo Class'
    }));
    
    setSessionAttendance(attendanceWithClass);
  };

  const fetchStudentsForClass = async () => {
    if (!selectedClass) return;
    const classId = resolveClassId(selectedClass);
    try {
      const response = await fetch(`${API_BASE}/students/${classId}`);
      if (!response.ok) {
        console.log('Students API not available, using mock students');
        setClassStudents(mockStudentsByClass[classId] || []);
        return;
      }
      const data = await response.json();
      setClassStudents(data);
      // If there's no selectedSession, show class students as attendance list
      if (!selectedSession) {
        const mapped = data.map(s => ({
          id: s.id,
          student_name: s.name || s.student_name,
          roll_number: s.roll_number || s.rollNumber,
          card_id: s.card_id || s.cardId,
          status: 'ABSENT',
          tap_time: s.tap_time || null,
          parent_email: s.parent_email
        }));
        setSessionAttendance(mapped);
      }
    } catch (error) {
      console.error('Error fetching students for class:', error);
      setClassStudents(mockStudentsByClass[classId] || []);
      if (!selectedSession) generateMockAttendance();
    }
  };

  const getStatusCount = (status) => {
    return sessionAttendance.filter(record => record.status === status).length;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800 border-green-300';
      case 'LATE': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'ABSENT': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PRESENT': return '✅';
      case 'LATE': return '⏰';
      case 'ABSENT': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Class Attendance</h1>
        <div className="text-sm text-gray-600">
          Sessions auto-start every 1 minute
          {backendStatus === 'error' && (
            <span className="ml-2 text-orange-600">(Demo Mode)</span>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-yellow-600 mr-2">⚠️</span>
            <span className="text-yellow-800">{error}</span>
          </div>
        </div>
      )}

      {/* Class Selection */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Select Class</h2>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full md:w-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Choose a class</option>
          {classes.map(cls => (
            <option key={cls.id} value={cls.id}>
              {cls.name} ({cls.level})
            </option>
          ))}
        </select>
      </div>

      {selectedClass && (
        <>
          {/* Today's Sessions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              Today's Sessions - {classes.find(c => c.id == selectedClass)?.name}
              {backendStatus === 'error' && (
                <span className="ml-2 text-sm font-normal text-orange-600">(Demo Data)</span>
              )}
            </h2>
            
            {loading ? (
              <p className="text-center py-4">Loading sessions...</p>
            ) : todaySessions.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No sessions today</p>
            ) : (
              <div className="grid gap-4">
                {todaySessions.map(session => (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedSession?.id === session.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${
                      session.status === 'ACTIVE' ? 'ring-2 ring-green-500 ring-opacity-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">
                          Session at {session.start_time}
                          {session.status === 'ACTIVE' && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              ACTIVE
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Present: {session.present_count || 0} | 
                          Late: {session.late_count || 0} | 
                          Absent: {session.absent_count || 0}
                        </p>
                      </div>
                      <div className="text-right">
                        {session.status === 'ACTIVE' ? (
                          <SessionTimer endTime={session.end_time} />
                        ) : (
                          <span className="text-gray-500">Completed</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Session Attendance Details */}
          {selectedSession && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  Attendance - {selectedSession.start_time}
                  {selectedSession.status === 'ACTIVE' && (
                    <span className="ml-2 text-green-600 text-sm">● Live</span>
                  )}
                  {backendStatus === 'error' && (
                    <span className="ml-2 text-sm font-normal text-orange-600">(Demo Data)</span>
                  )}
                </h2>
                
                {/* Attendance Summary */}
                <div className="flex gap-4 text-center">
                  <div className="px-3 py-2 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{getStatusCount('PRESENT')}</div>
                    <div className="text-sm text-green-800">Present</div>
                  </div>
                  <div className="px-3 py-2 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{getStatusCount('LATE')}</div>
                    <div className="text-sm text-yellow-800">Late</div>
                  </div>
                  <div className="px-3 py-2 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{getStatusCount('ABSENT')}</div>
                    <div className="text-sm text-red-800">Absent</div>
                  </div>
                </div>
              </div>

              {/* Student List - Only shows students from selected class */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessionAttendance.map(student => (
                  <div
                    key={student.id}
                    className={`border-2 rounded-lg p-4 ${getStatusColor(student.status)}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{student.student_name}</h3>
                        <p className="text-sm opacity-75">Roll: {student.roll_number}</p>
                        <p className="text-xs opacity-60 font-mono">Card: {student.card_id}</p>
                      </div>
                      <span className="text-2xl">{getStatusIcon(student.status)}</span>
                    </div>
                    
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="font-semibold">{student.status}</span>
                      </div>
                      {student.tap_time && (
                        <div className="flex justify-between">
                          <span>Tap Time:</span>
                          <span>{student.tap_time}</span>
                        </div>
                      )}
                      {student.parent_email && (
                        <div className="mt-2 text-xs opacity-60">
                          Parent: {student.parent_email}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {sessionAttendance.length === 0 && (
                <p className="text-center py-8 text-gray-500">No students found in this class</p>
              )}
            </div>
          )}
        </>
      )}

      {/* Auto-refresh Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-3"></div>
          <div>
            <h3 className="font-semibold text-blue-800">Automatic System Active</h3>
            <p className="text-blue-600 text-sm">
              • Sessions start automatically every 1 minute<br/>
              • Students marked LATE if they tap in last 10 seconds<br/>
              • Auto-absent if no tap within 1 minute<br/>
              • Parent notifications sent after 3 consecutive absences
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassAttendance;