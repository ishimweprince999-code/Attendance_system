// Frontend API service - Connects to Node.js/MySQL backend
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function for API calls
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error.message);
    throw error;
  }
};

// Students API
export const getStudents = async () => {
  const response = await apiRequest('/students');
  return response.data;
};

export const addStudent = async (studentData) => {
  const response = await apiRequest('/students', {
    method: 'POST',
    body: JSON.stringify(studentData),
  });
  return response.data;
};

export const updateStudent = async (studentId, studentData) => {
  const response = await apiRequest(`/students/${studentId}`, {
    method: 'PUT',
    body: JSON.stringify(studentData),
  });
  return response.data;
};

export const deleteStudent = async (studentId) => {
  const response = await apiRequest(`/students/${studentId}`, {
    method: 'DELETE',
  });
  return response.success;
};

// Attendance API
export const recordAttendance = async (cardId) => {
  const response = await apiRequest('/attendance/record', {
    method: 'POST',
    body: JSON.stringify({ cardId }),
  });
  return response;
};

export const getTodayAttendance = async () => {
  const response = await apiRequest('/attendance/today');
  return response.data;
};

export const getRecentAttendance = async (limit = 15) => {
  const response = await apiRequest(`/attendance/recent?limit=${limit}`);
  return response.data;
};

export const manuallyMarkAbsent = async (studentId) => {
  const response = await apiRequest(`/attendance/manual-absent/${studentId}`, {
    method: 'POST',
  });
  return response;
};

// Dashboard API
export const getDashboardStats = async () => {
  const response = await apiRequest('/dashboard/stats');
  return response.data;
};

// Notifications API
export const getNotifications = async () => {
  const response = await apiRequest('/notifications');
  return response.data;
};

export const sendNotification = async (notificationId) => {
  const response = await apiRequest(`/notifications/${notificationId}/send`, {
    method: 'POST',
  });
  return response;
};

// Reports API
export const getDailyReports = async () => {
  const response = await apiRequest('/reports');
  return response.data;
};

export const manuallyGenerateReport = async () => {
  const response = await apiRequest('/reports/generate', {
    method: 'POST',
  });
  return response;
};

// System API
export const forceNewDay = async () => {
  const response = await apiRequest('/system/new-day', {
    method: 'POST',
  });
  return response;
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await apiRequest('/health');
    return response.success;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

// Timer management (now handled by backend, but we'll keep these for compatibility)
export const getAbsenceTimers = () => {
  // This is now managed by the backend, return empty object for compatibility
  return {};
};

export const getDayInfo = () => {
  // Day info is now managed by backend, return null for compatibility
  // You can extend the backend to provide this if needed
  return null;
};

// Initialize connection to backend
export const initializeBackend = async () => {
  const isHealthy = await healthCheck();
  if (isHealthy) {
    console.log('✅ Connected to backend successfully');
  } else {
    console.error('❌ Backend connection failed');
    throw new Error('Cannot connect to backend server');
  }
};