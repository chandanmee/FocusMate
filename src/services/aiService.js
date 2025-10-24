import axios from 'axios';

class AIService {
  constructor() {
    this.apiKey = null; // Will be set by user
    this.baseURL = 'https://api.openai.com/v1';
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  async makeRequest(endpoint, data) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not set. Please configure your API key in settings.');
    }

    try {
      const response = await axios.post(`${this.baseURL}${endpoint}`, data, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('AI Service Error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your OpenAI API key in settings.');
      } else if (error.response?.status === 429) {
        throw new Error('API quota exceeded. Please check your OpenAI billing settings.');
      } else if (error.response?.status === 403) {
        throw new Error('API key does not have permission to access this resource.');
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('Network error. Please check your internet connection.');
      }
      
      throw new Error(error.response?.data?.error?.message || 'Failed to connect to AI service');
    }
  }

  async getFocusSuggestions(currentTask, distractions = [], timeOfDay = 'morning') {
    const prompt = `As a productivity coach, provide 3 specific focus suggestions for someone working on: "${currentTask}".
    
    Context:
    - Time of day: ${timeOfDay}
    - Recent distractions: ${distractions.length > 0 ? distractions.slice(-3).map(d => d.type).join(', ') : 'None'}
    
    Provide practical, actionable suggestions in JSON format:
    {
      "suggestions": [
        {
          "title": "Suggestion title",
          "description": "Brief description",
          "action": "Specific action to take"
        }
      ]
    }`;

    try {
      const response = await this.makeRequest('/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a productivity expert. Provide concise, actionable focus suggestions in valid JSON format only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error getting focus suggestions:', error);
      // Fallback suggestions
      return {
        suggestions: [
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
        ]
      };
    }
  }

  async generateDailySummary(sessions, tasks, distractions) {
    const completedTasks = tasks.filter(task => task.completed);
    const pendingTasks = tasks.filter(task => !task.completed);
    const totalFocusTime = sessions.reduce((total, session) => {
      if (session.status === 'completed' && session.type === 'focus') {
        return total + (session.actualDuration || session.duration);
      }
      return total;
    }, 0);

    // Calculate detailed session analytics
    const focusSessions = sessions.filter(s => s.type === 'focus');
    const breakSessions = sessions.filter(s => s.type === 'break');
    const avgSessionLength = focusSessions.length > 0 ? 
      focusSessions.reduce((sum, s) => sum + (s.actualDuration || s.duration), 0) / focusSessions.length : 0;
    
    // Analyze distraction patterns
    const distractionTypes = distractions.reduce((acc, d) => {
      acc[d.type] = (acc[d.type] || 0) + 1;
      return acc;
    }, {});
    
    // Calculate productivity metrics
    const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length * 100).toFixed(1) : 0;
    const focusEfficiency = totalFocusTime > 0 ? (completedTasks.length / (totalFocusTime / 60)).toFixed(2) : 0;
    
    // Get time distribution
    const currentHour = new Date().getHours();
    const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening';

    const prompt = `As an expert productivity analyst, generate a comprehensive daily summary based on this detailed productivity data:

    📊 SESSION ANALYTICS:
    - Total Focus Sessions: ${focusSessions.length} sessions
    - Total Focus Time: ${Math.round(totalFocusTime / 60)} minutes
    - Average Session Length: ${Math.round(avgSessionLength / 60)} minutes
    - Break Sessions: ${breakSessions.length}
    - Time of Analysis: ${timeOfDay}

    ✅ TASK PERFORMANCE:
    - Tasks Completed: ${completedTasks.length} out of ${tasks.length} total tasks
    - Completion Rate: ${completionRate}%
    - Focus Efficiency: ${focusEfficiency} tasks per hour
    - Completed Tasks: ${completedTasks.map(t => `"${t.title}"`).join(', ') || 'None'}
    - Pending Tasks: ${pendingTasks.map(t => `"${t.title}"`).join(', ') || 'None'}

    🚫 DISTRACTION ANALYSIS:
    - Total Distractions: ${distractions.length}
    - Distraction Breakdown: ${Object.entries(distractionTypes).map(([type, count]) => `${type}: ${count}`).join(', ') || 'None'}
    - Distraction Rate: ${totalFocusTime > 0 ? (distractions.length / (totalFocusTime / 60)).toFixed(2) : 0} per hour

    Generate a detailed, personalized summary in JSON format with deep insights:
    {
      "summary": "Comprehensive 2-3 sentence overview highlighting key productivity patterns and achievements",
      "achievements": ["Specific achievement 1", "Specific achievement 2", "Specific achievement 3"],
      "insights": [
        "Deep insight about focus patterns and session effectiveness",
        "Analysis of task completion patterns and efficiency",
        "Distraction pattern analysis and impact assessment",
        "Time-of-day productivity observations"
      ],
      "recommendations": [
        "Specific actionable recommendation for tomorrow",
        "Strategy for improving focus based on today's data",
        "Task management optimization suggestion",
        "Distraction reduction technique"
      ],
      "detailedAnalysis": {
        "focusQuality": "Assessment of focus session quality and consistency",
        "taskStrategy": "Analysis of task completion approach and effectiveness",
        "distractionImpact": "Detailed assessment of how distractions affected productivity",
        "timeOptimization": "Suggestions for better time allocation based on patterns"
      },
      "score": 85,
      "trendAnalysis": "Brief analysis of productivity trends and patterns observed today"
    }

    Provide encouraging, data-driven insights that help the user understand their productivity patterns and improve tomorrow. Be specific and reference the actual data provided.`;

    try {
      const response = await this.makeRequest('/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert productivity analyst with deep expertise in time management, focus optimization, and behavioral psychology. Provide comprehensive, encouraging, and data-driven daily summaries in valid JSON format only. Your analysis should be specific, actionable, and personalized based on the user\'s actual productivity data.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating daily summary:', error);
      // Enhanced fallback summary with detailed structure
      const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length * 100).toFixed(1) : 0;
      const focusEfficiency = totalFocusTime > 0 ? (completedTasks.length / (totalFocusTime / 60)).toFixed(2) : 0;
      
      return {
        summary: `You completed ${completedTasks.length} out of ${tasks.length} tasks (${completionRate}% completion rate) and focused for ${Math.round(totalFocusTime / 60)} minutes across ${sessions.filter(s => s.type === 'focus').length} focus sessions today.`,
        achievements: [
          completedTasks.length > 0 ? `Successfully completed ${completedTasks.length} tasks` : "Maintained consistent focus tracking",
          totalFocusTime > 0 ? `Accumulated ${Math.round(totalFocusTime / 60)} minutes of focused work time` : "Started your productivity journey",
          sessions.length > 0 ? `Completed ${sessions.filter(s => s.status === 'completed').length} productive sessions` : "Engaged with the focus system"
        ],
        insights: [
          `Your task completion rate was ${completionRate}%, ${completionRate > 70 ? 'showing strong productivity' : 'with room for improvement'}`,
          `Focus efficiency: ${focusEfficiency} tasks completed per hour of focused work`,
          distractions.length > 3 ? `${distractions.length} distractions occurred - consider implementing distraction reduction strategies` : "Maintained good focus with minimal distractions",
          `Average session performance indicates ${sessions.length > 2 ? 'consistent engagement' : 'opportunity for more regular focus sessions'}`
        ],
        recommendations: [
          completionRate < 50 ? "Break down larger tasks into smaller, manageable chunks tomorrow" : "Maintain your current task completion momentum",
          distractions.length > 2 ? "Identify and eliminate your top distraction sources" : "Continue your effective distraction management",
          totalFocusTime < 120 ? "Aim for longer focus sessions to build concentration stamina" : "Maintain your strong focus session duration",
          "Plan your 3 most important tasks for tomorrow evening to start strong"
        ],
        detailedAnalysis: {
          focusQuality: `Based on ${sessions.filter(s => s.type === 'focus').length} focus sessions, your concentration appears ${totalFocusTime > 90 ? 'strong and sustained' : 'developing - consider building longer sessions gradually'}`,
          taskStrategy: `Your approach of completing ${completedTasks.length} tasks shows ${completionRate > 60 ? 'effective task management' : 'potential for better task prioritization and breakdown'}`,
          distractionImpact: `With ${distractions.length} distractions, your focus was ${distractions.length < 3 ? 'well-maintained' : 'moderately challenged - implementing distraction blocking could help'}`,
          timeOptimization: `Your ${Math.round(totalFocusTime / 60)}-minute focus time suggests ${totalFocusTime > 120 ? 'good time investment' : 'opportunity to increase daily focused work time'}`
        },
        score: Math.min(95, Math.max(40, (completedTasks.length * 15) + (totalFocusTime / 60 * 1.5) + (sessions.length * 5) - (distractions.length * 2))),
        trendAnalysis: `Today's productivity pattern shows ${completionRate > 70 ? 'strong task execution' : 'developing productivity habits'} with ${totalFocusTime > 90 ? 'solid focus commitment' : 'room to extend focus periods'}`
      };
    }
  }

  async analyzeProductivityPattern(sessions, timeframe = 'week') {
    // This could be expanded for more detailed analytics
    const prompt = `Analyze this productivity pattern and provide insights:
    
    Sessions data: ${JSON.stringify(sessions.slice(-10))}
    Timeframe: ${timeframe}
    
    Provide analysis in JSON format focusing on peak productivity times and patterns.`;

    try {
      const response = await this.makeRequest('/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a productivity analyst. Analyze patterns and provide insights in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.5,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error analyzing productivity pattern:', error);
      return {
        insights: ["Unable to analyze pattern at this time"],
        recommendations: ["Continue tracking your sessions for better insights"]
      };
    }
  }
}

export const aiService = new AIService();