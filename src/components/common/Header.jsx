import React from 'react';

const Header = ({ userType, onSwitchToTeacher, onSwitchToStudent }) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              School Attendance System
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={onSwitchToTeacher}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  userType === 'teacher'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                👨‍🏫 Teacher
              </button>
              <button
                onClick={onSwitchToStudent}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  userType === 'student'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                👨‍🎓 Student
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;