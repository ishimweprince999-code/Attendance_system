import React, { useState, useEffect } from 'react';
import { getNotifications, sendNotification } from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const notifs = await getNotifications();
    setNotifications(notifs);
  };

  const handleSendNotification = async (studentId) => {
    try {
      await sendNotification(studentId);
      alert('Notification sent to parent');
      loadNotifications();
    } catch (error) {
      alert('Error sending notification');
    }
  };

  const consecutiveAbsents = notifications.filter(n => n.consecutiveAbsentDays >= 3);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>

      {/* Students with 3+ consecutive absences */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-red-600">
          Students with 3+ Consecutive Absences
        </h2>
        {consecutiveAbsents.length === 0 ? (
          <p className="text-gray-600">No students with 3+ consecutive absences.</p>
        ) : (
          <div className="space-y-4">
            {consecutiveAbsents.map((notification) => (
              <div key={notification.id} className="border-l-4 border-red-500 bg-red-50 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-red-800">
                      {notification.studentName}
                    </h3>
                    <p className="text-red-600">
                      {notification.consecutiveAbsentDays} consecutive absent days
                    </p>
                    <p className="text-sm text-gray-600">
                      Last attendance: {notification.lastAttendanceDate || 'Never'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSendNotification(notification.studentId)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Notify Parent
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notification History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Notification History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Student</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Sent Date</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notification) => (
                <tr key={notification.id} className="border-t">
                  <td className="px-4 py-2">{notification.studentName}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {notification.type}
                    </span>
                  </td>
                  <td className="px-4 py-2">{notification.sentDate}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      notification.status === 'sent' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {notification.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Notifications;