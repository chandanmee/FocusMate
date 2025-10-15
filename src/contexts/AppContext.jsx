import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  // User settings
  user: {
    name: '',
    workHours: { start: '09:00', end: '17:00' },
    breakDuration: 15,
    focusSessionDuration: 25,
  },
  
  // Tasks management
  tasks: [],
  
  // Focus sessions
  currentSession: null,
  sessions: [],
  
  // Timer state for background functionality
  timer: {
    isRunning: false,
    isPaused: false,
    timeLeft: 0,
    totalTime: 0,
    sessionType: 'focus',
    taskId: null,
    startTime: null,
    pausedTime: 0,
  },
  
  // Distractions tracking
  distractions: [],
  
  // Daily summary
  dailySummary: null,
  
  // App settings
  settings: {
    notifications: true,
    soundEnabled: true,
    theme: 'light',
    aiSuggestions: true,
  },
  
  // Loading states
  loading: {
    aiSuggestions: false,
    dailySummary: false,
  }
};

// Action types
export const ACTION_TYPES = {
  // User actions
  SET_USER: 'SET_USER',
  UPDATE_USER_SETTINGS: 'UPDATE_USER_SETTINGS',
  
  // Task actions
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  COMPLETE_TASK: 'COMPLETE_TASK',
  
  // Session actions
  START_SESSION: 'START_SESSION',
  END_SESSION: 'END_SESSION',
  PAUSE_SESSION: 'PAUSE_SESSION',
  RESUME_SESSION: 'RESUME_SESSION',
  
  // Timer actions for background functionality
  START_TIMER: 'START_TIMER',
  PAUSE_TIMER: 'PAUSE_TIMER',
  RESUME_TIMER: 'RESUME_TIMER',
  STOP_TIMER: 'STOP_TIMER',
  TICK_TIMER: 'TICK_TIMER',
  RESET_TIMER: 'RESET_TIMER',
  
  // Distraction actions
  ADD_DISTRACTION: 'ADD_DISTRACTION',
  
  // Daily summary actions
  SET_DAILY_SUMMARY: 'SET_DAILY_SUMMARY',
  
  // Settings actions
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  
  // Loading actions
  SET_LOADING: 'SET_LOADING',
  
  // Data persistence
  LOAD_DATA: 'LOAD_DATA',
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_USER:
      return { ...state, user: { ...state.user, ...action.payload } };
      
    case ACTION_TYPES.UPDATE_USER_SETTINGS:
      return { 
        ...state, 
        user: { ...state.user, ...action.payload } 
      };
      
    case ACTION_TYPES.ADD_TASK:
      return { 
        ...state, 
        tasks: [...state.tasks, { 
          id: Date.now(), 
          createdAt: new Date().toISOString(),
          completed: false,
          ...action.payload 
        }] 
      };
      
    case ACTION_TYPES.UPDATE_TASK:
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id 
            ? { ...task, ...action.payload.updates }
            : task
        )
      };
      
    case ACTION_TYPES.DELETE_TASK:
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
      
    case ACTION_TYPES.COMPLETE_TASK:
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload 
            ? { ...task, completed: true, completedAt: new Date().toISOString() }
            : task
        )
      };
      
    case ACTION_TYPES.START_SESSION:
      const newSession = {
        id: Date.now(),
        startTime: new Date().toISOString(),
        type: action.payload.type || 'focus',
        taskId: action.payload.taskId || null,
        duration: action.payload.duration || state.user.focusSessionDuration,
        status: 'active'
      };
      return {
        ...state,
        currentSession: newSession,
        sessions: [...state.sessions, newSession]
      };
      
    case ACTION_TYPES.END_SESSION:
      return {
        ...state,
        currentSession: null,
        sessions: state.sessions.map(session => 
          session.id === state.currentSession?.id
            ? { 
                ...session, 
                endTime: new Date().toISOString(), 
                status: 'completed',
                actualDuration: action.payload.actualDuration 
              }
            : session
        )
      };
      
    case ACTION_TYPES.PAUSE_SESSION:
      return {
        ...state,
        currentSession: state.currentSession 
          ? { ...state.currentSession, status: 'paused', pausedAt: new Date().toISOString() }
          : null
      };
      
    case ACTION_TYPES.RESUME_SESSION:
      return {
        ...state,
        currentSession: state.currentSession 
          ? { ...state.currentSession, status: 'active', resumedAt: new Date().toISOString() }
          : null
      };
      
    case ACTION_TYPES.ADD_DISTRACTION:
      return {
        ...state,
        distractions: [...state.distractions, {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          sessionId: state.currentSession?.id,
          ...action.payload
        }]
      };
      
    case ACTION_TYPES.SET_DAILY_SUMMARY:
      return { ...state, dailySummary: action.payload };
      
    case ACTION_TYPES.UPDATE_SETTINGS:
      return { 
        ...state, 
        settings: { ...state.settings, ...action.payload } 
      };
      
    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loading: { ...state.loading, ...action.payload }
      };
      
    case ACTION_TYPES.LOAD_DATA:
      return { ...state, ...action.payload };
      
    // Timer actions for background functionality
    case ACTION_TYPES.START_TIMER:
      return {
        ...state,
        timer: {
          ...state.timer,
          isRunning: true,
          isPaused: false,
          timeLeft: action.payload.duration * 60, // Convert minutes to seconds
          totalTime: action.payload.duration * 60,
          sessionType: action.payload.sessionType || 'focus',
          taskId: action.payload.taskId || null,
          startTime: Date.now(),
          pausedTime: 0,
        }
      };
      
    case ACTION_TYPES.PAUSE_TIMER:
      return {
        ...state,
        timer: {
          ...state.timer,
          isRunning: false,
          isPaused: true,
          pausedTime: state.timer.pausedTime + (Date.now() - state.timer.startTime),
        }
      };
      
    case ACTION_TYPES.RESUME_TIMER:
      return {
        ...state,
        timer: {
          ...state.timer,
          isRunning: true,
          isPaused: false,
          startTime: Date.now(),
        }
      };
      
    case ACTION_TYPES.STOP_TIMER:
      const actualDuration = Math.round((state.timer.totalTime - state.timer.timeLeft) / 60);
      return {
        ...state,
        timer: {
          ...initialState.timer
        },
        // End the current session if one exists
        currentSession: null,
        sessions: state.currentSession ? state.sessions.map(session => 
          session.id === state.currentSession.id
            ? { 
                ...session, 
                endTime: new Date().toISOString(), 
                status: 'completed',
                actualDuration: actualDuration
              }
            : session
        ) : state.sessions
      };
      
    case ACTION_TYPES.TICK_TIMER:
      const newTimeLeft = Math.max(0, state.timer.timeLeft - 1);
      return {
        ...state,
        timer: {
          ...state.timer,
          timeLeft: newTimeLeft,
        }
      };
      
    case ACTION_TYPES.RESET_TIMER:
      return {
        ...state,
        timer: {
          ...initialState.timer
        }
      };
      
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Context provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Background timer effect
  useEffect(() => {
    let interval;
    
    if (state.timer.isRunning && !state.timer.isPaused) {
      interval = setInterval(() => {
        dispatch({ type: ACTION_TYPES.TICK_TIMER });
        
        // Check if timer has finished
        if (state.timer.timeLeft <= 1) {
          // Play sound if enabled
          if (state.settings.soundEnabled) {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(e => console.log('Could not play sound:', e));
          }
          
          // Show notification if enabled
          if (state.settings.notifications && 'Notification' in window) {
            if (Notification.permission === 'granted') {
              new Notification('FocusMate Timer', {
                body: `${state.timer.sessionType === 'focus' ? 'Focus' : 'Break'} session completed!`,
                icon: '/favicon.ico'
              });
            } else if (Notification.permission !== 'denied') {
              Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                  new Notification('FocusMate Timer', {
                    body: `${state.timer.sessionType === 'focus' ? 'Focus' : 'Break'} session completed!`,
                    icon: '/favicon.ico'
                  });
                }
              });
            }
          }
          
          // Auto-stop timer when it reaches 0
          dispatch({ type: ACTION_TYPES.STOP_TIMER });
        }
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [state.timer.isRunning, state.timer.isPaused, state.timer.timeLeft, state.settings.soundEnabled, state.settings.notifications, state.timer.sessionType]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('focusMateData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: ACTION_TYPES.LOAD_DATA, payload: parsedData });
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      user: state.user,
      tasks: state.tasks,
      sessions: state.sessions,
      distractions: state.distractions,
      settings: state.settings,
      dailySummary: state.dailySummary,
      timer: state.timer // Save timer state for persistence
    };
    localStorage.setItem('focusMateData', JSON.stringify(dataToSave));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;