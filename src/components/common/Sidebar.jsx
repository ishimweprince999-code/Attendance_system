import React from 'react';

const Sidebar = ({ currentPage, setCurrentPage, userType }) => {
  const teacherMenu = [
    { id: 'teacher_dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'teacher_attendance', label: 'Start Session', icon: '📝' },
    { id: 'teacher_class_attendance', label: 'Class Attendance', icon: '👨‍🎓' },
    { id: 'teacher_parent_notifications', label: 'Parent Alerts', icon: '📧' },
    { id: 'teacher_students', label: 'Students', icon: '📚' },
    { id: 'teacher_reports', label: 'Reports', icon: '📋' },
  ];

  const studentMenu = [
    { id: 'student_dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'student_attendance', label: 'Tap Card', icon: '💳' },
    { id: 'student_history', label: 'My History', icon: '📋' },
  ];

  const menuItems = userType === 'student' ? studentMenu : teacherMenu;

  return (
    <aside className="w-64 bg-white shadow-sm h-[calc(100vh-4rem)]">
      <nav className="p-4">
        <div className="mb-6 p-3 bg-gray-100 rounded-lg">
          <p className="text-sm font-medium text-gray-700 text-center">
            Mode: <span className="capitalize">{userType}</span>
          </p>
        </div>
        <ul className="space-y-2">
          {menuItems.map(item => (
            <li key={item.id}>
              <button
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? userType === 'student' 
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;