import React, { useState } from 'react';

const StudentsPage = ({ students }) => {
  const [selectedClass, setSelectedClass] = useState('S1');

  const classOptions = [
    ...['S1', 'S2', 'S3'], // O Level
    ...['S4', 'S5', 'S6'], // ACC
    ...['L3', 'L4', 'L5']  // SOD
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Student Management</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Select Class</h2>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full md:w-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {classOptions.map(className => (
            <option key={className} value={className}>
              {className}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          Students - {selectedClass} 
          <span className="text-sm font-normal text-gray-600 ml-2">
            ({students[selectedClass]?.length || 0} students)
          </span>
        </h2>
        
        {students[selectedClass] ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students[selectedClass].map(student => (
              <div key={student.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{student.name}</h3>
                    <p className="text-sm text-gray-600">Roll: {student.rollNumber}</p>
                    <p className="text-xs text-gray-500">ID: {student.id}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No students found for this class</p>
        )}
      </div>
    </div>
  );
};

export default StudentsPage;