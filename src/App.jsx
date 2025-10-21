import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import StudentManagement from './pages/StudentManagement';
import Attendance from './pages/Attendance';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import ManualInput from './pages/ManualInput';
import Navbar from './components/Navbar';
import { initializeBackend, healthCheck } from './services/api';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    // Initialize backend connection
    const initBackend = async () => {
      try {
        await initializeBackend();
        setBackendStatus('connected');
      } catch (error) {
        console.error('Backend initialization failed:', error);
        setBackendStatus('disconnected');
      }
    };

    initBackend();

    // Periodically check backend health
    const healthInterval = setInterval(async () => {
      const isHealthy = await healthCheck();
      setBackendStatus(isHealthy ? 'connected' : 'disconnected');
    }, 30000); // Check every 30 seconds

    return () => clearInterval(healthInterval);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
        return <StudentManagement />;
      case 'attendance':
        return <Attendance />;
      case 'manual-input':
        return <ManualInput />;
      case 'notifications':
        return <Notifications />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      {/* Backend Status Indicator */}
      {backendStatus === 'disconnected' && (
        <div className="bg-red-500 text-white p-2 text-center">
          ⚠️ Backend server is disconnected. Please make sure the backend is running on port 5000.
        </div>
      )}
      
      {backendStatus === 'checking' && (
        <div className="bg-yellow-500 text-white p-2 text-center">
          🔄 Connecting to backend...
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;