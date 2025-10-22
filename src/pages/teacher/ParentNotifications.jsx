import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

const ParentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set default date range (last 7 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchNotifications();
    }
  }, [startDate, endDate]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/parent-notifications?start_date=${startDate}&end_date=${endDate}`
      );
      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationColor = (days) => {
    if (days >= 5) return 'bg-red-100 text-red-800 border-red-300';
    if (days >= 3) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Parent Notifications</h1>
        <button
          onClick={fetchNotifications}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
        >
          Refresh
        </button>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Filter Notifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="flex items-end">
            <button
              onClick={fetchNotifications}
              disabled={loading}
              className={`w-full px-4 py-3 rounded-lg font-semibold ${
                loading
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {loading ? 'Loading...' : 'Apply Filter'}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          Sent Notifications
          <span className="text-sm font-normal text-gray-600 ml-2">
            ({notifications.length} total)
          </span>
        </h2>

        {loading ? (
          <p className="text-center py-8">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📧</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Notifications</h3>
            <p className="text-gray-500">
              Parent notifications will appear here when students are absent for 3+ consecutive days.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`border-2 rounded-lg p-4 ${getNotificationColor(notification.consecutive_days)}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{notification.student_name}</h3>
                    <p className="text-sm opacity-75">
                      {notification.class_name} • Roll: {notification.roll_number}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{notification.consecutive_days} days</div>
                    <div className="text-sm opacity-75">Consecutive Absence</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex justify-between">
                      <span>Parent Email:</span>
                      <span className="font-mono">{notification.parent_email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Notification Date:</span>
                      <span className="font-semibold">{notification.notification_date}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <span>Sent At:</span>
                      <span>{new Date(notification.sent_at).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-semibold">Email Sent</span>
                    </div>
                  </div>
                </div>

                {/* Alert Message Preview */}
                <div className="mt-3 p-3 bg-white bg-opacity-50 rounded border">
                  <p className="text-sm">
                    <strong>Subject:</strong> Attendance Alert - {notification.consecutive_days} Consecutive Days Absent
                  </p>
                  <p className="text-sm mt-1">
                    Your child {notification.student_name} has been absent for {notification.consecutive_days} consecutive days.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* System Info */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse mr-3"></div>
          <div>
            <h3 className="font-semibold text-purple-800">Notification System</h3>
            <p className="text-purple-600 text-sm">
              • Automatic emails sent when students are absent for 3+ consecutive days<br/>
              • Notifications are sent once per absence period<br/>
              • System checks for new absences every hour<br/>
              • All sent notifications are logged here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentNotifications;