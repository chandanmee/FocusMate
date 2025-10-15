import React, { useState, useEffect } from 'react';
import { Lightbulb, RefreshCw, Settings } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ACTION_TYPES } from '../contexts/AppContext';
import { aiService } from '../services/aiService';

const FocusSuggestions = () => {
  const { state, dispatch } = useApp();
  const { tasks, distractions, currentSession, loading, settings } = state;
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');

  const currentTask = currentSession?.taskId 
    ? tasks.find(t => t.id === currentSession.taskId)
    : null;

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const fetchSuggestions = async () => {
    if (!settings.aiSuggestions) return;
    
    dispatch({
      type: ACTION_TYPES.SET_LOADING,
      payload: { aiSuggestions: true }
    });

    try {
      const taskTitle = currentTask?.title || 'general productivity';
      const recentDistractions = distractions.slice(-5);
      const timeOfDay = getTimeOfDay();

      const result = await aiService.getFocusSuggestions(
        taskTitle,
        recentDistractions,
        timeOfDay
      );

      setSuggestions(result.suggestions || []);
      setError('');
    } catch (err) {
      setError(err.message);
      // Use fallback suggestions on error
      setSuggestions([
        {
          title: "Take a 5-minute break",
          description: "Step away from your screen to refresh your mind",
          action: "Stand up, stretch, or take a short walk"
        },
        {
          title: "Break down the task",
          description: "Divide your current task into smaller, manageable steps",
          action: "List 3 specific sub-tasks you can complete in the next hour"
        },
        {
          title: "Eliminate distractions",
          description: "Remove or minimize potential interruptions",
          action: "Close unnecessary browser tabs and put your phone in another room"
        }
      ]);
    } finally {
      dispatch({
        type: ACTION_TYPES.SET_LOADING,
        payload: { aiSuggestions: false }
      });
    }
  };

  const handleAddDistraction = (type, description) => {
    dispatch({
      type: ACTION_TYPES.ADD_DISTRACTION,
      payload: { type, description }
    });
  };

  // Auto-fetch suggestions when session starts or changes
  useEffect(() => {
    if (currentSession && settings.aiSuggestions) {
      fetchSuggestions();
    }
  }, [currentSession?.id, settings.aiSuggestions]);

  if (!settings.aiSuggestions) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <Lightbulb className="text-yellow-500" size={24} />
            <span>Focus Suggestions</span>
          </h2>
          <Settings size={20} className="text-gray-400" />
        </div>
        <div className="text-center py-8 text-gray-500">
          <p>AI suggestions are disabled. Enable them in settings to get personalized focus tips.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
          <Lightbulb className="text-yellow-500" size={24} />
          <span>Focus Suggestions</span>
        </h2>
        <button
          onClick={fetchSuggestions}
          disabled={loading.aiSuggestions}
          className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          title="Refresh Suggestions"
        >
          <RefreshCw 
            size={20} 
            className={loading.aiSuggestions ? 'animate-spin' : ''} 
          />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">{error}</p>
        </div>
      )}

      {currentTask && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>Current Task:</strong> {currentTask.title}
          </p>
        </div>
      )}

      {loading.aiSuggestions ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold text-gray-800 mb-2">
                {suggestion.title}
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                {suggestion.description}
              </p>
              <p className="text-blue-600 text-sm font-medium">
                💡 {suggestion.action}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Quick Distraction Logging */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Quick Distraction Log
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            { type: 'social_media', label: '📱 Social Media' },
            { type: 'email', label: '📧 Email' },
            { type: 'noise', label: '🔊 Noise' },
            { type: 'meeting', label: '👥 Meeting' },
            { type: 'other', label: '❓ Other' }
          ].map(distraction => (
            <button
              key={distraction.type}
              onClick={() => handleAddDistraction(distraction.type, `${distraction.label} distraction`)}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              {distraction.label}
            </button>
          ))}
        </div>
      </div>

      {suggestions.length === 0 && !loading.aiSuggestions && !error && (
        <div className="text-center py-8 text-gray-500">
          <p>Start a focus session to get personalized suggestions!</p>
        </div>
      )}
    </div>
  );
};

export default FocusSuggestions;