import React, { useEffect } from 'react';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ACTION_TYPES } from '../contexts/AppContext';

const Timer = ({ taskId = null, sessionType = 'focus' }) => {
  const { state, dispatch } = useApp();
  const { user, timer } = state;
  
  const duration = sessionType === 'focus' 
    ? user.focusSessionDuration 
    : user.breakDuration;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (timer.totalTime === 0) return 0;
    return ((timer.totalTime - timer.timeLeft) / timer.totalTime) * 100;
  };

  const handleStart = () => {
    dispatch({
      type: ACTION_TYPES.START_TIMER,
      payload: {
        duration,
        sessionType,
        taskId
      }
    });
    
    // Also start a session for tracking
    dispatch({
      type: ACTION_TYPES.START_SESSION,
      payload: {
        type: sessionType,
        taskId,
        duration
      }
    });
  };

  const handlePause = () => {
    dispatch({ type: ACTION_TYPES.PAUSE_TIMER });
    dispatch({ type: ACTION_TYPES.PAUSE_SESSION });
  };

  const handleResume = () => {
    dispatch({ type: ACTION_TYPES.RESUME_TIMER });
    dispatch({ type: ACTION_TYPES.RESUME_SESSION });
  };

  const handleStop = () => {
    dispatch({ type: ACTION_TYPES.STOP_TIMER });
  };

  const handleReset = () => {
    dispatch({ type: ACTION_TYPES.RESET_TIMER });
  };

  const getTimerColor = () => {
    if (sessionType === 'break') return 'text-green-600';
    if (timer.timeLeft < 300) return 'text-red-600'; // Last 5 minutes
    if (timer.timeLeft < 600) return 'text-yellow-600'; // Last 10 minutes
    return 'text-blue-600';
  };

  const getProgressColor = () => {
    if (sessionType === 'break') return 'stroke-green-500';
    if (timer.timeLeft < 300) return 'stroke-red-500';
    if (timer.timeLeft < 600) return 'stroke-yellow-500';
    return 'stroke-blue-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {sessionType === 'focus' ? 'Focus Session' : 'Break Time'}
        </h2>
        {taskId && (
          <p className="text-gray-600">
            Working on: {state.tasks.find(t => t.id === taskId)?.title || 'Unknown Task'}
          </p>
        )}
      </div>

      {/* Circular Progress */}
      <div className="relative w-48 h-48 mx-auto mb-8">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
            className={getProgressColor()}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Timer display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`text-4xl font-mono font-bold ${getTimerColor()}`}>
            {formatTime(timer.timeLeft)}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4 mb-6">
        {!timer.isRunning && !timer.isPaused && (
          <button
            onClick={handleStart}
            className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full transition-colors"
            title="Start Timer"
          >
            <Play size={24} />
          </button>
        )}
        
        {timer.isRunning && (
          <button
            onClick={handlePause}
            className="bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-full transition-colors"
            title="Pause Timer"
          >
            <Pause size={24} />
          </button>
        )}
        
        {timer.isPaused && (
          <button
            onClick={handleResume}
            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full transition-colors"
            title="Resume Timer"
          >
            <Play size={24} />
          </button>
        )}
        
        {(timer.isRunning || timer.isPaused) && (
          <button
            onClick={handleStop}
            className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full transition-colors"
            title="Stop Timer"
          >
            <Square size={24} />
          </button>
        )}
        
        <button
          onClick={handleReset}
          className="bg-gray-500 hover:bg-gray-600 text-white p-4 rounded-full transition-colors"
          title="Reset Timer"
        >
          <RotateCcw size={24} />
        </button>
      </div>

      {/* Session Info */}
      {state.currentSession && (
        <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
          <p>Session Status: <span className="font-semibold capitalize">{state.currentSession.status}</span></p>
          <p>Started: {new Date(state.currentSession.startTime).toLocaleTimeString()}</p>
          {timer.totalTime - timer.timeLeft > 0 && (
            <p>Elapsed: {Math.floor((timer.totalTime - timer.timeLeft) / 60)}m {(timer.totalTime - timer.timeLeft) % 60}s</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Timer;