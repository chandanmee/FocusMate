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
    const totalFocusTime = sessions.reduce((total, session) => {
      if (session.status === 'completed' && session.type === 'focus') {
        return total + (session.actualDuration || session.duration);
      }
      return total;
    }, 0);

    const prompt = `Generate a daily productivity summary based on this data:

    Focus Sessions: ${sessions.length} sessions, ${Math.round(totalFocusTime / 60)} minutes total
    Tasks Completed: ${completedTasks.length} out of ${tasks.length} tasks
    Distractions: ${distractions.length} interruptions
    
    Tasks worked on: ${tasks.map(t => t.title).join(', ')}
    Main distraction types: ${distractions.map(d => d.type).join(', ')}

    Provide a summary in JSON format:
    {
      "summary": "Brief overview of the day's productivity",
      "achievements": ["Achievement 1", "Achievement 2"],
      "insights": ["Insight about productivity patterns"],
      "recommendations": ["Recommendation for tomorrow"],
      "score": 85
    }

    Keep it encouraging and constructive.`;

    try {
      const response = await this.makeRequest('/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a productivity analyst. Provide encouraging, insightful daily summaries in valid JSON format only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.6,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Error generating daily summary:', error);
      // Fallback summary
      return {
        summary: `You completed ${completedTasks.length} tasks and focused for ${Math.round(totalFocusTime / 60)} minutes today.`,
        achievements: [
          completedTasks.length > 0 ? `Completed ${completedTasks.length} tasks` : "Maintained focus sessions",
          totalFocusTime > 0 ? `Focused for ${Math.round(totalFocusTime / 60)} minutes` : "Tracked your productivity"
        ],
        insights: [
          distractions.length > 3 ? "Consider reducing distractions for better focus" : "Good focus maintenance today"
        ],
        recommendations: [
          "Plan your most important tasks for tomorrow",
          "Consider scheduling regular breaks"
        ],
        score: Math.min(90, Math.max(50, (completedTasks.length * 20) + (totalFocusTime / 60 * 2)))
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