import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

const TeacherStudents = ({ classes }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  const resolveClassId = (sel) => {
    if (!sel) return null;
    const byId = classes.find(c => String(c.id) === String(sel));
    if (byId) return byId.id;
    const byName = classes.find(c => c.name === sel);
    if (byName) return byName.id;
    return sel;
  };

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const classId = resolveClassId(selectedClass);
      const response = await fetch(`${API_BASE}/students/${classId}`);
      if (!response.ok) {
        // Read response body (if any) to give better debugging info
        let bodyText = '';
        try {
          bodyText = await response.text();
        } catch (e) {
          bodyText = '<no body>';
        }
        const msg = `HTTP ${response.status}: ${bodyText}`;
        throw new Error(msg);
      }
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(`Failed to load students from backend (${err.message})`);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Select Class</h2>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full md:w-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Choose a class</option>
          {classes.map(cls => (
            <option key={cls.id} value={cls.id}>
              {cls.name} ({cls.level})
            </option>
          ))}
        </select>
      </div>

      {selectedClass && (
        <div className="bg-white rounded-xl shadow-md p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="text-red-700">{error}</div>
            </div>
          )}
          <h2 className="text-xl font-semibold mb-4">
            Students - {classes.find(c => c.id == selectedClass)?.name}
            <span className="text-sm font-normal text-gray-600 ml-2">
              ({students.length} students)
            </span>
          </h2>
          
          {loading ? (
            <p className="text-center py-4">Loading students...</p>
          ) : students.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map(student => (
                <div key={student.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {(student.name || student.student_name || '').split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{student.name || student.student_name}</h3>
                      <p className="text-sm text-gray-600">Roll: {student.roll_number}</p>
                      <p className="text-xs text-gray-500 font-mono">Card: {student.card_id}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No students found for this class</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherStudents;