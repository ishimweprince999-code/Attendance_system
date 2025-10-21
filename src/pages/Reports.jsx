import React, { useState, useEffect } from 'react';
import { getDailyReports, getStudents } from '../services/api';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportDetails, setReportDetails] = useState(null);

  useEffect(() => {
    loadReports();
    loadStudents();
  }, []);

  const loadReports = async () => {
    try {
      const reportsData = await getDailyReports();
      setReports(reportsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading reports:', error);
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const studentList = await getStudents();
      setStudents(studentList);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const viewReportDetails = async (report) => {
    setSelectedReport(report);
    
    // For now, we'll create a mock details object since the backend doesn't have the full details endpoint
    // In a real application, you'd have a backend endpoint like /api/reports/:date/details
    try {
      // Get today's attendance for the report date
      const today = report.date;
      const [attendanceResponse] = await Promise.all([
        fetch(`http://localhost:5000/api/attendance/by-date?date=${today}`).then(r => r.json())
      ]);
      
      const attendanceRecords = attendanceResponse.data || [];
      
      const presentStudents = attendanceRecords
        .filter(record => record.status === 'present')
        .map(record => record.student_name);
        
      const absentStudents = attendanceRecords
        .filter(record => record.status === 'absent')
        .map(record => record.student_name);
        
      const autoMarkedAbsent = attendanceRecords
        .filter(record => record.status === 'absent' && record.auto_marked)
        .length;

      setReportDetails({
        ...report,
        records: attendanceRecords,
        summary: {
          presentStudents,
          absentStudents,
          autoMarkedAbsent
        }
      });
    } catch (error) {
      console.error('Error loading report details:', error);
      // Fallback to basic report data
      setReportDetails({
        ...report,
        records: [],
        summary: {
          presentStudents: [],
          absentStudents: [],
          autoMarkedAbsent: 0
        }
      });
    }
  };

  const closeReportDetails = () => {
    setSelectedReport(null);
    setReportDetails(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Daily Reports</h1>
        <div className="text-sm text-gray-600">
          Total Days: {reports.length}
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-500 text-lg mb-4">
            No daily reports generated yet.
          </div>
          <div className="text-gray-400">
            Reports are automatically generated at the end of each day.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Day {report.day_number}</h3>
                  <p className="text-sm text-gray-600">{new Date(report.date).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  report.attendance_rate >= 80 
                    ? 'bg-green-100 text-green-800'
                    : report.attendance_rate >= 60
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {report.attendance_rate}% Attendance
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{report.present_count}</div>
                  <div className="text-sm text-gray-600">Present</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{report.absent_count}</div>
                  <div className="text-sm text-gray-600">Absent</div>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                <div>Total Students: {report.total_students}</div>
                <div>Generated: {new Date(report.generated_at).toLocaleDateString()}</div>
              </div>

              <button
                onClick={() => viewReportDetails(report)}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Day {selectedReport.day_number} Report - {new Date(selectedReport.date).toLocaleDateString()}
                </h2>
                <button
                  onClick={closeReportDetails}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-600">{selectedReport.present_count}</div>
                  <div className="text-green-800 font-semibold">Present</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-red-600">{selectedReport.absent_count}</div>
                  <div className="text-red-800 font-semibold">Absent</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-600">{selectedReport.attendance_rate}%</div>
                  <div className="text-blue-800 font-semibold">Attendance Rate</div>
                </div>
              </div>

              {reportDetails && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-green-700">Present Students</h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {reportDetails.summary.presentStudents.length > 0 ? (
                          reportDetails.summary.presentStudents.map((student, index) => (
                            <div key={index} className="flex items-center p-2 bg-green-50 rounded">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                              <span className="text-green-800">{student}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-4">No students were present</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-red-700">Absent Students</h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {reportDetails.summary.absentStudents.length > 0 ? (
                          reportDetails.summary.absentStudents.map((student, index) => (
                            <div key={index} className="flex items-center p-2 bg-red-50 rounded">
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                              <span className="text-red-800">{student}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-4">No students were absent</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-3">Attendance Records</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full table-auto">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-2 text-left">Student</th>
                            <th className="px-4 py-2 text-left">Time</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Type</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportDetails.records.map((record, index) => (
                            <tr key={index} className="border-t">
                              <td className="px-4 py-2">{record.student_name}</td>
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
                    {reportDetails.records.length === 0 && (
                      <p className="text-center text-gray-500 py-4">No attendance records found</p>
                    )}
                  </div>
                </>
              )}

              {!reportDetails && (
                <div className="text-center py-8">
                  <div className="text-gray-500">Loading detailed report...</div>
                </div>
              )}

              <div className="mt-6 text-sm text-gray-500">
                Report generated: {new Date(selectedReport.generated_at).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;