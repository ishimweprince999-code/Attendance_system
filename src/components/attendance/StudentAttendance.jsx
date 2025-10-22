import React from 'react';

const StudentAttendance = ({ students, currentAttendances, onMarkAttendance }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-100 border-green-500';
      case 'absent': return 'bg-red-100 border-red-500';
      case 'late': return 'bg-yellow-100 border-yellow-500';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'present': return 'Present';
      case 'absent': return 'Absent';
      case 'late': return 'Late';
      default: return 'Not Marked';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {students.map(student => (
        <div
          key={student.id}
          className={`border-2 rounded-lg p-4 ${getStatusColor(currentAttendances[student.id])}`}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-gray-800">{student.name}</h3>
              <p className="text-sm text-gray-600">{student.rollNumber}</p>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              currentAttendances[student.id] === 'present' ? 'bg-green-500 text-white' :
              currentAttendances[student.id] === 'late' ? 'bg-yellow-500 text-white' :
              'bg-red-500 text-white'
            }`}>
              {getStatusText(currentAttendances[student.id])}
            </span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => onMarkAttendance(student.id, 'present')}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded text-sm"
            >
              Present
            </button>
            <button
              onClick={() => onMarkAttendance(student.id, 'late')}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-3 rounded text-sm"
            >
              Late
            </button>
            <button
              onClick={() => onMarkAttendance(student.id, 'absent')}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm"
            >
              Absent
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentAttendance;