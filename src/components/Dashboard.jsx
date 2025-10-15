import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, Target, Zap, Settings, Brain } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { ACTION_TYPES } from '../contexts/AppContext';
import { aiService } from '../services/aiService';
import { format, startOfDay, endOfDay, isToday } from 'date-fns';

// Helper function to get greeting based on time of day
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
};

const Dashboard = () => {
  const { state, dispatch } = useApp();
  const { showError, showSuccess } = useToast();
  const { sessions, tasks, distractions, dailySummary, loading, user } = state;
  const [showDailySummary, setShowDailySummary] = useState(false);

  // Calculate today's stats
  const today = new Date();
  const todaySessions = sessions.filter(session => 
    isToday(new Date(session.startTime))
  );
  
  const todayTasks = tasks.filter(task => 
    task.completedAt && isToday(new Date(task.completedAt))
  );
  
  const todayDistractions = distractions.filter(distraction => 
    isToday(new Date(distraction.timestamp))
  );

  const totalFocusTime = todaySessions.reduce((total, session) => {
    if (session.status === 'completed' && session.type === 'focus') {
      return total + (session.actualDuration || session.duration * 60);
    }
    return total;
  }, 0);

  const completedTasksCount = todayTasks.length;
  const totalTasksCount = tasks.filter(task => !task.completed).length + completedTasksCount;
  const completionRate = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0;

  // Calculate real productivity score
  const calculateProductivityScore = () => {
    let score = 0;
    
    // Focus time contribution (40% of score)
    const focusHours = totalFocusTime / 3600;
    const focusScore = Math.min(40, focusHours * 10); // Max 40 points for 4+ hours
    score += focusScore;
    
    // Task completion contribution (35% of score)
    const taskScore = Math.min(35, completedTasksCount * 7); // Max 35 points for 5+ tasks
    score += taskScore;
    
    // Distraction penalty (25% of score)
    const distractionPenalty = Math.min(25, todayDistractions.length * 2.5); // Lose 2.5 points per distraction
    const distractionScore = Math.max(0, 25 - distractionPenalty);
    score += distractionScore;
    
    return Math.round(Math.min(100, Math.max(0, score)));
  };

  const productivityScore = calculateProductivityScore();

  const generateDailySummary = async () => {
    dispatch({
      type: ACTION_TYPES.SET_LOADING,
      payload: { dailySummary: true }
    });

    try {
      const summary = await aiService.generateDailySummary(
        todaySessions,
        tasks,
        todayDistractions
      );
      
      dispatch({
        type: ACTION_TYPES.SET_DAILY_SUMMARY,
        payload: {
          ...summary,
          date: today.toISOString(),
          generatedAt: new Date().toISOString()
        }
      });
      
      setShowDailySummary(true);
      showSuccess('Daily summary generated successfully!', 'AI Summary');
    } catch (error) {
      console.error('Error generating daily summary:', error);
      
      // Check if it's an API key related error
      if (error.message.includes('API key') || error.message.includes('Unauthorized') || error.message.includes('401')) {
        showError('Please check your OpenAI API key in Settings. Make sure it\'s valid and has sufficient credits.', 'Invalid API Key');
      } else if (error.message.includes('quota') || error.message.includes('billing')) {
        showError('Your OpenAI API quota has been exceeded. Please check your billing settings.', 'API Quota Exceeded');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        showError('Network error occurred. Please check your internet connection and try again.', 'Connection Error');
      } else {
        showError('Failed to generate AI summary. Using fallback summary instead.', 'AI Service Error');
      }
      
      // Fallback summary
      const fallbackSummary = {
        summary: `You completed ${completedTasksCount} tasks and focused for ${Math.round(totalFocusTime / 60)} minutes today.`,
        achievements: [
          completedTasksCount > 0 ? `Completed ${completedTasksCount} tasks` : "Maintained focus tracking",
          totalFocusTime > 0 ? `Focused for ${Math.round(totalFocusTime / 60)} minutes` : "Started your productivity journey"
        ],
        insights: [
          todayDistractions.length > 3 ? "Consider reducing distractions for better focus" : "Good focus maintenance today"
        ],
        recommendations: [
          "Plan your most important tasks for tomorrow",
          "Consider scheduling regular breaks"
        ],
        score: Math.min(90, Math.max(50, (completedTasksCount * 20) + (totalFocusTime / 60 * 2))),
        date: today.toISOString(),
        generatedAt: new Date().toISOString()
      };
      
      dispatch({
        type: ACTION_TYPES.SET_DAILY_SUMMARY,
        payload: fallbackSummary
      });
      
      setShowDailySummary(true);
    } finally {
      dispatch({
        type: ACTION_TYPES.SET_LOADING,
        payload: { dailySummary: false }
      });
    }
  };

  // Auto-generate summary at end of day or if requested
  useEffect(() => {
    const now = new Date();
    const isEndOfDay = now.getHours() >= 17; // After 5 PM
    
    if (isEndOfDay && todaySessions.length > 0 && !dailySummary?.date?.includes(today.toDateString())) {
      generateDailySummary();
    }
  }, [todaySessions.length]);

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => {
    const colorClasses = {
      blue: {
        bg: "from-blue-500 to-blue-600",
        text: "text-blue-600",
        icon: "text-blue-500",
        accent: "bg-blue-50 dark:bg-blue-900/20"
      },
      green: {
        bg: "from-green-500 to-green-600", 
        text: "text-green-600",
        icon: "text-green-500",
        accent: "bg-green-50 dark:bg-green-900/20"
      },
      purple: {
        bg: "from-purple-500 to-purple-600",
        text: "text-purple-600", 
        icon: "text-purple-500",
        accent: "bg-purple-50 dark:bg-purple-900/20"
      },
      yellow: {
        bg: "from-yellow-500 to-yellow-600",
        text: "text-yellow-600",
        icon: "text-yellow-500", 
        accent: "bg-yellow-50 dark:bg-yellow-900/20"
      },
      red: {
        bg: "from-red-500 to-red-600",
        text: "text-red-600",
        icon: "text-red-500",
        accent: "bg-red-50 dark:bg-red-900/20"
      }
    };

    const colors = colorClasses[color] || colorClasses.blue;

    return (
      <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-2">{title}</p>
            <p className={`text-3xl font-bold ${colors.text} dark:text-white mb-1`}>{value}</p>
            {subtitle && <p className="text-gray-500 dark:text-gray-400 text-xs">{subtitle}</p>}
          </div>
          <div className={`${colors.accent} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`${colors.icon} dark:text-white`} size={28} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Good {getGreeting()}, {user.name || 'Focus Master'}! 
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                {format(today, 'EEEE, MMMM do, yyyy')}
              </p>
            </div>
            <button
              onClick={generateDailySummary}
              disabled={loading.dailySummary}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Brain size={20} />
              <span className="font-medium">{loading.dailySummary ? 'Generating...' : 'AI Summary'}</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Clock}
            title="Focus Time Today"
            value={`${Math.round(totalFocusTime / 60)}m`}
            subtitle={`${todaySessions.length} sessions`}
            color="blue"
          />
          <StatCard
            icon={Target}
            title="Tasks Completed"
            value={completedTasksCount}
            subtitle={`${Math.round(completionRate)}% completion rate`}
            color="green"
          />
          <StatCard
            icon={Zap}
            title="Distractions"
            value={todayDistractions.length}
            subtitle="Today"
            color={todayDistractions.length > 5 ? "red" : "yellow"}
          />
          <StatCard
            icon={BarChart3}
            title="Productivity Score"
            value={`${productivityScore}%`}
            subtitle="Real-time calculated"
            color="purple"
          />
        </div>

        {/* Daily Summary */}
        {showDailySummary && dailySummary && (
          <div className="bg-gradient-to-br from-purple-50/80 to-blue-50/80 dark:from-purple-900/20 dark:to-blue-900/20 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6 sm:p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center space-x-3">
                <Brain className="text-purple-500" size={32} />
                <span>Daily AI Summary</span>
              </h2>
              <button
                onClick={() => setShowDailySummary(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Summary & Score */}
              <div className="space-y-6">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20">
                  <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-lg">📝 Summary</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{dailySummary.summary}</p>
                </div>
                
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20">
                  <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-lg">📊 Productivity Score</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${productivityScore}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {productivityScore}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Achievements & Insights */}
              <div className="space-y-6">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20">
                  <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-lg">🏆 Achievements</h3>
                  <ul className="space-y-3">
                    {dailySummary.achievements?.map((achievement, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300 text-sm flex items-start space-x-2">
                        <span className="text-green-500 font-bold">•</span>
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20">
                  <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-lg">💡 Insights</h3>
                  <ul className="space-y-3">
                    {dailySummary.insights?.map((insight, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300 text-sm flex items-start space-x-2">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20">
                  <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-lg">🚀 Tomorrow's Recommendations</h3>
                  <ul className="space-y-3">
                    {dailySummary.recommendations?.map((recommendation, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300 text-sm flex items-start space-x-2">
                        <span className="text-purple-500 font-bold">•</span>
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center bg-white/30 dark:bg-gray-800/30 rounded-lg p-3">
              Generated at {new Date(dailySummary.generatedAt).toLocaleTimeString()}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6 sm:p-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-6">Recent Activity</h2>
          
          {todaySessions.length === 0 && completedTasksCount === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 max-w-md mx-auto">
                <div className="text-6xl mb-4">🎯</div>
                <p className="text-gray-600 dark:text-gray-300 text-lg">No activity today yet</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Start a focus session to begin tracking your productivity!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Recent Sessions */}
              {todaySessions.slice(-3).map(session => (
                <div key={session.id} className="group bg-gradient-to-r from-blue-50/80 to-blue-100/80 dark:from-blue-900/20 dark:to-blue-800/20 backdrop-blur-sm rounded-xl p-4 border border-blue-200/30 dark:border-blue-700/30 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-500/20 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <Clock className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        {session.type === 'focus' ? '🎯 Focus Session' : '☕ Break'} 
                        {session.taskId && ` - ${tasks.find(t => t.id === session.taskId)?.title}`}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {session.type === 'focus' && session.status === 'completed' ? (
                          <>
                            Duration: {Math.round((session.actualDuration || session.duration * 60) / 60)} minutes
                            <span className="mx-2">•</span>
                            {new Date(session.startTime).toLocaleTimeString()} - {new Date(session.endTime).toLocaleTimeString()}
                          </>
                        ) : session.status === 'active' ? (
                          <>
                            In Progress - Started at {new Date(session.startTime).toLocaleTimeString()}
                          </>
                        ) : (
                          <>
                            {new Date(session.startTime).toLocaleTimeString()} - 
                            {session.endTime ? new Date(session.endTime).toLocaleTimeString() : 'In Progress'}
                          </>
                        )}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      session.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      session.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                </div>
              ))}

              {/* Recent Completed Tasks */}
              {todayTasks.slice(-3).map(task => (
                <div key={task.id} className="group bg-gradient-to-r from-green-50/80 to-green-100/80 dark:from-green-900/20 dark:to-green-800/20 backdrop-blur-sm rounded-xl p-4 border border-green-200/30 dark:border-green-700/30 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-500/20 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <Target className="text-green-600 dark:text-green-400" size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">✅ {task.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Completed at {new Date(task.completedAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-semibold">
                      Completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;