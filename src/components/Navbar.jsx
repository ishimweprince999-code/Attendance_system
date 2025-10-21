import React from 'react';

const Navbar = ({ currentPage, setCurrentPage }) => {
  const navItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'students', label: 'Students' },
    { key: 'attendance', label: 'Card Input' },
    { key: 'manual-input', label: 'Manual Input' }, // Add this item
    { key: 'reports', label: 'Reports' },
    { key: 'notifications', label: 'Notifications' },
  ];

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-bold">School Attendance System</h1>
          <div className="flex space-x-4">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setCurrentPage(item.key)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === item.key
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-500'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;