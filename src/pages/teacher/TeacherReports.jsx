import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

const TeacherReports = ({ classes }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dailyReports, setDailyReports] = useState([]);
  const [absenceNotifications, setAbsenceNotifications] = useState([]);
  const [classSchedule, setClassSchedule] = useState([]);
  const [activeTab, setActiveTab] = useState('daily');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set default date range (last 7 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    
    fetchClassSchedule();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      if (activeTab === 'daily') {
        fetchDailyReports();
      } else if (activeTab === 'absences') {
        fetchAbsenceNotifications();
      }
    }
  }, [startDate, endDate, selectedClass, activeTab]);

  const fetchDailyReports = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/reports/daily?start_date=${startDate}&end_date=${endDate}`;
      if (selectedClass) {
        url += `&class_id=${selectedClass}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch daily reports');
      }
      const data = await response.json();
      setDailyReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching daily reports:', error);
      // If API fails, generate sample data for demo
      generateSampleReports();
    } finally {
      setLoading(false);
    }
  };

  const generateSampleReports = async () => {
    try {
      const response = await fetch(`${API_BASE}/reports/generate-sample`, {
        method: 'POST'
      });
      const data = await response.json();
      setDailyReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error generating sample reports:', error);
      // Fallback sample data
      setDailyReports([
        {
          id: 1,
          report_date: '2024-01-22',
          class_id: 1,
          class_name: 'S1',
          total_students: 3,
          present_count: 2,
          late_count: 1,
          absent_count: 0,
          attendance_rate: 100.00
        },
        {
          id: 2,
          report_date: '2024-01-22',
          class_id: 2,
          class_name: 'S2',
          total_students: 2,
          present_count: 1,
          late_count: 0,
          absent_count: 1,
          attendance_rate: 50.00
        }
      ]);
    }
  };

  const fetchAbsenceNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/reports/absences?start_date=${startDate}&end_date=${endDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch absence notifications');
      }
      const data = await response.json();
      setAbsenceNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching absence notifications:', error);
      setAbsenceNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassSchedule = async () => {
    try {
      const response = await fetch(`${API_BASE}/schedule`);
      if (!response.ok) {
        throw new Error('Failed to fetch class schedule');
      }
      const data = await response.json();
      setClassSchedule(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching class schedule:', error);
      // Fallback sample schedule
      setClassSchedule([
        { name: 'S1', session_time: '08:00:00' },
        { name: 'S2', session_time: '08:15:00' },
        { name: 'S3', session_time: '08:30:00' },
        { name: 'S4', session_time: '09:00:00' },
        { name: 'S5', session_time: '09:15:00' },
        { name: 'S6', session_time: '09:30:00' },
        { name: 'L3', session_time: '10:00:00' },
        { name: 'L4', session_time: '10:15:00' },
        { name: 'L5', session_time: '10:30:00' }
      ]);
    }
  };

  const getAttendanceColor = (rate) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('daily')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'daily'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Daily Reports
            </button>
            <button
              onClick={() => setActiveTab('absences')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'absences'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ⚠️ Absence Alerts
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'schedule'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🕐 Class Schedule
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Date Range Filter */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Filter
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Classes</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.level})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={activeTab === 'daily' ? fetchDailyReports : fetchAbsenceNotifications}
                disabled={loading}
                className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${
                  loading
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Daily Reports Tab */}
          {activeTab === 'daily' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Daily Attendance Reports</h2>
              {loading ? (
                <p className="text-gray-500 text-center py-8">Loading reports...</p>
              ) : dailyReports.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No reports found for the selected period</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Date</th>
                        <th className="text-left p-3">Class</th>
                        <th className="text-left p-3">Total</th>
                        <th className="text-left p-3">Present</th>
                        <th className="text-left p-3">Late</th>
                        <th className="text-left p-3">Absent</th>
                        <th className="text-left p-3">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyReports.map(report => (
                        <tr key={report.id || `${report.report_date}-${report.class_id}`} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{report.report_date}</td>
                          <td className="p-3">{report.class_name}</td>
                          <td className="p-3">{report.total_students}</td>
                          <td className="p-3 text-green-600">{report.present_count}</td>
                          <td className="p-3 text-yellow-600">{report.late_count}</td>
                          <td className="p-3 text-red-600">{report.absent_count}</td>
                          <td className={`p-3 font-bold ${getAttendanceColor(report.attendance_rate)}`}>
                            {report.attendance_rate}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Absence Notifications Tab */}
          {activeTab === 'absences' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Parent Notifications Sent</h2>
              {loading ? (
                <p className="text-gray-500 text-center py-8">Loading notifications...</p>
              ) : absenceNotifications.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No absence notifications sent in the selected period</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Date</th>
                        <th className="text-left p-3">Student</th>
                        <th className="text-left p-3">Roll No.</th>
                        <th className="text-left p-3">Class</th>
                        <th className="text-left p-3">Consecutive Days</th>
                        <th className="text-left p-3">Sent At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {absenceNotifications.map(notification => (
                        <tr key={notification.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{notification.notification_date}</td>
                          <td className="p-3">{notification.student_name}</td>
                          <td className="p-3 font-mono">{notification.roll_number}</td>
                          <td className="p-3">{notification.class_name}</td>
                          <td className="p-3 text-red-600 font-semibold">
                            {notification.consecutive_days} days
                          </td>
                          <td className="p-3 text-gray-600">
                            {new Date(notification.sent_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Class Schedule Tab */}
          {activeTab === 'schedule' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Automatic Session Schedule</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800">
                  <strong>Automatic System:</strong> Sessions start automatically at scheduled times, 
                  last for 2 minutes, and students are marked LATE if they tap in the last 10 seconds.
                </p>
              </div>
              {classSchedule.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No class schedule found</p>
              ) : (
                <div className="grid gap-4">
                  {classSchedule.map(cls => (
                    <div key={cls.name} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-lg">{cls.name}</h3>
                          <p className="text-gray-600">Daily at {cls.session_time}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Duration: 2 minutes</div>
                          <div className="text-sm text-yellow-600">Late window: Last 10 seconds</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherReports;