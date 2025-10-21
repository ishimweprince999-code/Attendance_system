import React, { useState, useEffect } from 'react';
import { getDashboardStats, getRecentAttendance, forceNewDay, manuallyGenerateReport, getDailyReports } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    pendingNotifications: 0,
    pendingAbsenceTimers: 0,
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState('2:00'); // Default day timer

  useEffect(() => {
    loadDashboardData();
    
    // Refresh data every 10 seconds
    const interval = setInterval(loadDashboardData, 10000);
    
    // Simulate day timer (you can extend backend to provide real timer)
    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        const [minutes, seconds] = prev.split(':').map(Number);
        if (seconds > 0) return `${minutes}:${(seconds - 1).toString().padStart(2, '0')}`;
        if (minutes > 0) return `${minutes - 1}:59`;
        return '0:00';
      });
    }, 1000);
    
    return () => {
      clearInterval(interval);
      clearInterval(timerInterval);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const [dashboardStats, recent, reportsData] = await Promise.all([
        getDashboardStats(),
        getRecentAttendance(15),
        getDailyReports()
      ]);
      
      setStats(dashboardStats);
      setRecentAttendance(recent);
      setReports(reportsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleForceNewDay = async () => {
    if (window.confirm('Are you sure you want to start a new day? This will save the current day report and reset all attendance timers.')) {
      setLoading(true);
      try {
        await forceNewDay();
        setTimeLeft('2:00'); // Reset timer
        await loadDashboardData();
        alert('New day started successfully!');
      } catch (error) {
        alert('Error starting new day: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const result = await manuallyGenerateReport();
      alert(result.message);
      await loadDashboardData();
    } catch (error) {
      alert('Error generating report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall statistics
  const overallAttendanceRate = reports.length > 0 
    ? Math.round(reports.reduce((sum, report) => sum + report.attendance_rate, 0) / reports.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
            <div className="text-sm font-semibold">Day Timer</div>
            <div className="text-xl font-bold">{timeLeft}</div>
            <div className="text-xs">Next day in</div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
            <button
              onClick={handleForceNewDay}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Starting...' : 'Force New Day'}
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={stats.totalStudents} color="blue" icon="👥" />
        <StatCard title="Present Today" value={stats.presentToday} color="green" icon="✅" />
        <StatCard title="Absent Today" value={stats.absentToday} color="red" icon="❌" />
        <StatCard title="Waiting Attendance" value={stats.pendingAbsenceTimers} color="yellow" icon="⏰" />
      </div>

      {/* Second Row Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Days" 
          value={reports.length} 
          color="purple" 
          icon="📅" 
          subtitle="reports generated"
        />
        <StatCard 
          title="Overall Attendance" 
          value={`${overallAttendanceRate}%`} 
          color="green" 
          icon="📊" 
          subtitle="average rate"
        />
        <StatCard 
          title="Pending Notifications" 
          value={stats.pendingNotifications} 
          color="orange" 
          icon="🔔" 
          subtitle="to parents"
        />
        <StatCard 
          title="Total Records" 
          value={recentAttendance.length} 
          color="indigo" 
          icon="📝" 
          subtitle="attendance entries"
        />
      </div>

      {/* Quick Reports Overview */}
      {reports.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">📈 Recent Reports Summary</h2>
            <span className="text-sm text-gray-600">Last {Math.min(3, reports.length)} days</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reports.slice(0, 3).map((report, index) => (
              <div key={report.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">Day {report.day_number}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    report.attendance_rate >= 80 
                      ? 'bg-green-100 text-green-800'
                      : report.attendance_rate >= 60
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {report.attendance_rate}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{new Date(report.date).toLocaleDateString()}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">✅ {report.present_count}</span>
                  <span className="text-red-600">❌ {report.absent_count}</span>
                  <span className="text-blue-600">📊 {report.total_students} total</span>
                </div>
              </div>
            ))}
          </div>
          {reports.length > 3 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                And {reports.length - 3} more daily reports available
              </p>
            </div>
          )}
        </div>
      )}

      {/* Students Waiting for Attendance */}
      {stats.pendingAbsenceTimers > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                ⏰ Students Pending Attendance ({stats.pendingAbsenceTimers})
              </h3>
              <p className="text-yellow-700">
                These students will be automatically marked absent in 1 minute if they don't check in.
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-yellow-800">1:00</div>
              <div className="text-sm text-yellow-600">time remaining</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Attendance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Attendance</h2>
          <span className="text-sm text-gray-600">
            Showing {recentAttendance.length} records
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Student</th>
                <th className="px-4 py-2 text-left">Time</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Type</th>
              </tr>
            </thead>
            <tbody>
              {recentAttendance.map((record) => (
                <tr key={record.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 font-medium">{record.student_name}</td>
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
        {recentAttendance.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No attendance records yet.
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">🚀 Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => window.location.hash = 'manual-input'}
            className="bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            📝 Manual Input
          </button>
          <button
            onClick={() => window.location.hash = 'students'}
            className="bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition-colors text-sm"
          >
            👥 Manage Students
          </button>
          <button
            onClick={() => window.location.hash = 'reports'}
            className="bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition-colors text-sm"
          >
            📊 View Reports
          </button>
          <button
            onClick={() => window.location.hash = 'attendance'}
            className="bg-orange-600 text-white py-3 rounded-md hover:bg-orange-700 transition-colors text-sm"
          >
            💳 Card Input
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color, icon, subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    purple: 'bg-purple-100 text-purple-800',
    orange: 'bg-orange-100 text-orange-800',
    indigo: 'bg-indigo-100 text-indigo-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClasses[color]} bg-opacity-50`}>
          <span className="text-xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;