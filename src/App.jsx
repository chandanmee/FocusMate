import React, { useState, useEffect } from 'react';
import { Settings, Sun, Moon } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Timer from './components/Timer';
import TaskList from './components/TaskList';
import FocusSuggestions from './components/FocusSuggestions';
import SettingsPage from './components/Settings';
import { AppProvider, useApp } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';

// Import logo images
import focusmateIcon from './assets/focusmate.png';
import focusmateIconLt from './assets/focusmate-lt.png';
import focusmateSmallIcon from './assets/focumate_icon.png';

// Inner App component that has access to context
const AppContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const { state, dispatch } = useApp();
  const { settings, timer } = state;
  const theme = settings?.theme || 'light';

  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { theme: newTheme }
    });
  };

  const handleStartFocusSession = (taskId) => {
    setSelectedTaskId(taskId);
    setActiveTab('timer');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onStartFocusSession={handleStartFocusSession} />;
      case 'timer':
        return <Timer selectedTaskId={selectedTaskId} />;
      case 'tasks':
        return <TaskList onSelectTask={setSelectedTaskId} />;
      case 'suggestions':
        return <FocusSuggestions />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard onStartFocusSession={handleStartFocusSession} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity duration-200" onClick={() => setActiveTab('dashboard')}>
                {/* Responsive logo - small icon on mobile, main logo on larger screens */}
                <img 
                  src={focusmateSmallIcon} 
                  alt="FocusMate Logo" 
                  className="w-10 h-10 rounded-lg sm:hidden"
                />
                <div className="hidden sm:block">
                  <img 
                     src={theme === 'dark' ? focusmateIconLt : focusmateIcon} 
                     alt="FocusMate Logo" 
                     className="w-auto h-10 rounded-lg"
                   />
                </div>
              </div>
            </div>

            {/* Navigation and Controls */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-1">
                {[
                  { id: 'dashboard', label: 'Dashboard' },
                  { id: 'timer', label: 'Timer' },
                  { id: 'tasks', label: 'Tasks' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>

              {/* Mobile Navigation Dropdown */}
              <div className="md:hidden">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="dashboard">Dashboard</option>
                  <option value="timer">Timer</option>
                  <option value="tasks">Tasks</option>
                </select>
              </div>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                )}
              </button>

              {/* Settings Button */}
              <button
                onClick={() => setActiveTab('settings')}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  activeTab === 'settings'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}
                aria-label="Settings"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="text-sm text-gray-600 dark:text-gray-400 hidden lg:block">
                AI-Powered Productivity Dashboard
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>© 2024 FocusMate. chandanmee.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Main App component with providers
function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AppProvider>
  );
}

export default App;
