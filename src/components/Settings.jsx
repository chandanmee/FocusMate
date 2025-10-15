import React, { useState, useEffect } from 'react';
import { Save, Key, Bell, Volume2, Palette, Brain } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ACTION_TYPES } from '../contexts/AppContext';
import { aiService } from '../services/aiService';

const Settings = () => {
  const { state, dispatch } = useApp();
  const { user, settings } = state;
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleUserSettingsChange = (field, value) => {
    dispatch({
      type: ACTION_TYPES.UPDATE_USER_SETTINGS,
      payload: { [field]: value }
    });
  };

  const handleSettingsChange = (field, value) => {
    dispatch({
      type: ACTION_TYPES.UPDATE_SETTINGS,
      payload: { [field]: value }
    });
  };

  const handleSaveApiKey = async () => {
    try {
      localStorage.setItem('openai_api_key', apiKey);
      aiService.setApiKey(apiKey); // Set the API key in the service
      setSaveMessage('API key saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error saving API key');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  // Load API key on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      aiService.setApiKey(savedApiKey);
    }
  }, []);

  const testSound = () => {
    if (settings.soundEnabled) {
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(error => {
          console.error('Error playing sound:', error);
        });
      } catch (error) {
        console.error('Error creating audio:', error);
      }
    }
  };

  const handleWorkHoursChange = (field, value) => {
    handleUserSettingsChange('workHours', {
      ...user.workHours,
      [field]: value
    });
  };

  // Load saved API key on component mount
  React.useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      aiService.setApiKey(savedApiKey);
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

        {/* User Profile */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={user.name}
                onChange={(e) => handleUserSettingsChange('name', e.target.value)}
                placeholder="Your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Work Schedule */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Work Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Start Time
              </label>
              <input
                type="time"
                value={user.workHours.start}
                onChange={(e) => handleWorkHoursChange('start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work End Time
              </label>
              <input
                type="time"
                value={user.workHours.end}
                onChange={(e) => handleWorkHoursChange('end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Focus Settings */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Focus Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Focus Session Duration (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={user.focusSessionDuration}
                onChange={(e) => handleUserSettingsChange('focusSessionDuration', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Break Duration (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="30"
                value={user.breakDuration}
                onChange={(e) => handleUserSettingsChange('breakDuration', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* AI Configuration */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center space-x-2">
            <Brain className="text-purple-500" size={20} />
            <span>AI Configuration</span>
          </h2>
          
          <div className="mb-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.aiSuggestions}
                onChange={(e) => handleSettingsChange('aiSuggestions', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Enable AI-powered focus suggestions
              </span>
            </label>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              OpenAI API Key
            </label>
            <div className="flex space-x-2">
              <input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="px-3 py-2 text-gray-600 hover:text-gray-800"
              >
                {showApiKey ? '🙈' : '👁️'}
              </button>
              <button
                onClick={handleSaveApiKey}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Key size={16} />
                <span>Save</span>
              </button>
            </div>
            {saveMessage && (
              <p className="text-green-600 text-sm">{saveMessage}</p>
            )}
            <p className="text-xs text-gray-500">
              Your API key is stored locally and never sent to our servers. 
              Get your key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">OpenAI</a>.
            </p>
          </div>
        </div>

        {/* App Preferences */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">App Preferences</h2>
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => handleSettingsChange('notifications', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <Bell className="text-gray-500" size={16} />
              <span className="text-sm font-medium text-gray-700">
                Enable notifications
              </span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => handleSettingsChange('soundEnabled', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <Volume2 className="text-gray-500" size={16} />
              <span className="text-sm font-medium text-gray-700">
                Enable sound alerts
              </span>
            </label>

            <div className="flex items-center space-x-3">
              <Volume2 className="text-gray-500" size={16} />
              <label className="text-sm font-medium text-gray-700">Sound Alerts</label>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => handleSettingsChange('soundEnabled', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              {settings.soundEnabled && (
                <button
                  onClick={testSound}
                  className="ml-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
                >
                  Test Sound
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <Palette className="text-gray-500" size={16} />
              <label className="text-sm font-medium text-gray-700">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => handleSettingsChange('theme', e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Data Management</h2>
          <div className="space-y-3">
            <button
              onClick={() => {
                const data = localStorage.getItem('focusMateData');
                if (data) {
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `focusmate-backup-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Export Data
            </button>
            
            <button
              onClick={() => {
                if (confirm('This will delete all your data. Are you sure?')) {
                  localStorage.removeItem('focusMateData');
                  window.location.reload();
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors ml-2"
            >
              Clear All Data
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Export your data for backup or clear all data to start fresh.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;