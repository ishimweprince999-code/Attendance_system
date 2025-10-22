import React, { useState, useEffect } from 'react';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import ClassAttendance from './pages/teacher/ClassAttendance';
import ParentNotifications from './pages/teacher/ParentNotifications';
import TeacherStudents from './pages/teacher/TeacherStudents';
import TeacherReports from './pages/teacher/TeacherReports';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentHistory from './pages/student/StudentHistory';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [currentPage, setCurrentPage] = useState('teacher_dashboard');
  const [userType, setUserType] = useState('teacher');
  const [classes, setClasses] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [backendStatus, setBackendStatus] = useState('checking');

  // Fetch classes on component mount
  useEffect(() => {
    checkBackendStatus();
    fetchClasses();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setBackendStatus('connected');
      } else {
        setBackendStatus('error');
      }
    } catch (error) {
      console.error('Backend connection failed:', error);
      setBackendStatus('error');
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_BASE}/classes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setClasses(data);
      setBackendStatus('connected');
    } catch (error) {
      console.error('Error fetching classes:', error);
      setBackendStatus('error');
      // Do NOT populate demo/mock classes here. Leave classes empty so UI uses real backend data.
      setClasses([]);
    }
  };

  const fetchActiveSessions = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`${API_BASE}/active-sessions?date=${today}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setActiveSessions(data);
      }
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      // Use empty array as fallback
      setActiveSessions([]);
    }
  };

  const startAttendanceSession = async (classId) => {
    try {
      const response = await fetch(`${API_BASE}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ class_id: classId }),
      });

      if (response.ok) {
        const session = await response.json();
        const classObj = classes.find(c => c.id == classId);
        const newSession = {
          id: session.session_id,
          class_id: classId,
          class_name: classObj?.name || `Class ${classId}`,
          end_time: session.end_time,
          status: 'ACTIVE'
        };
        setActiveSessions(prev => [...prev, newSession]);
        
        // Auto-complete session after 1 minute (for prototype)
        setTimeout(() => {
          completeSession(session.session_id);
        }, 60 * 1000);

        return session;
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to start session');
      }
    } catch (error) {
      console.error('Error starting session:', error);
      
      // Mock session for demo
      const mockSession = {
        session_id: Date.now(),
        message: 'Mock session started',
        end_time: new Date(Date.now() + 60 * 1000).toTimeString().split(' ')[0]
      };
      
      const classObj = classes.find(c => c.id == classId);
      const newSession = {
        id: mockSession.session_id,
        class_id: classId,
        class_name: classObj?.name || `Class ${classId}`,
        end_time: mockSession.end_time,
        status: 'ACTIVE'
      };
      setActiveSessions(prev => [...prev, newSession]);
      
      setTimeout(() => {
        completeSession(mockSession.session_id);
      }, 60 * 1000);

      return mockSession;
    }
  };

  const completeSession = async (sessionId) => {
    try {
      await fetch(`${API_BASE}/sessions/${sessionId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error completing session:', error);
    } finally {
      setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
    }
  };

  const switchToTeacher = () => {
    setUserType('teacher');
    setCurrentPage('teacher_dashboard');
  };

  const switchToStudent = () => {
    setUserType('student');
    setCurrentPage('student_dashboard');
  };

  const renderPage = () => {
    if (userType === 'teacher') {
      switch (currentPage) {
        case 'teacher_dashboard':
          return <TeacherDashboard 
                   classes={classes}
                   activeSessions={activeSessions}
                   onStartSession={startAttendanceSession}
                   backendStatus={backendStatus}
                 />;
        case 'teacher_attendance':
          return <TeacherAttendance 
                   classes={classes}
                   activeSessions={activeSessions}
                   onStartSession={startAttendanceSession}
                   onCompleteSession={completeSession}
                   backendStatus={backendStatus}
                 />;
        case 'teacher_class_attendance':
          return <ClassAttendance 
                   classes={classes}
                   activeSessions={activeSessions}
                   backendStatus={backendStatus}
                 />;
        case 'teacher_parent_notifications':
          return <ParentNotifications backendStatus={backendStatus} />;
        case 'teacher_students':
          return <TeacherStudents classes={classes} backendStatus={backendStatus} />;
        case 'teacher_reports':
          return <TeacherReports classes={classes} backendStatus={backendStatus} />;
        default:
          return <TeacherDashboard 
                   classes={classes}
                   activeSessions={activeSessions}
                   onStartSession={startAttendanceSession}
                   backendStatus={backendStatus}
                 />;
      }
    } else {
      switch (currentPage) {
        case 'student_dashboard':
          return <StudentDashboard backendStatus={backendStatus} />;
        case 'student_attendance':
          return <StudentAttendance backendStatus={backendStatus} />;
        case 'student_history':
          return <StudentHistory backendStatus={backendStatus} />;
        default:
          return <StudentDashboard backendStatus={backendStatus} />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        userType={userType} 
        onSwitchToTeacher={switchToTeacher}
        onSwitchToStudent={switchToStudent}
        backendStatus={backendStatus}
      />
      <div className="flex">
        <Sidebar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          userType={userType}
        />
        <main className="flex-1 p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;