import React, { useState } from 'react';
import { Plus, Check, Trash2, Edit3, Play, Clock } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ACTION_TYPES } from '../contexts/AppContext';

const TaskList = ({ onStartFocusSession }) => {
  const { state, dispatch } = useApp();
  const { tasks } = state;
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editText, setEditText] = useState('');

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      dispatch({
        type: ACTION_TYPES.ADD_TASK,
        payload: {
          title: newTask.trim(),
          priority: 'medium',
          estimatedDuration: 25
        }
      });
      setNewTask('');
    }
  };

  const handleCompleteTask = (taskId) => {
    dispatch({
      type: ACTION_TYPES.COMPLETE_TASK,
      payload: taskId
    });
  };

  const handleDeleteTask = (taskId) => {
    dispatch({
      type: ACTION_TYPES.DELETE_TASK,
      payload: taskId
    });
  };

  const handleEditTask = (task) => {
    setEditingTask(task.id);
    setEditText(task.title);
  };

  const handleSaveEdit = (taskId) => {
    if (editText.trim()) {
      dispatch({
        type: ACTION_TYPES.UPDATE_TASK,
        payload: {
          id: taskId,
          updates: { title: editText.trim() }
        }
      });
    }
    setEditingTask(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditText('');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Tasks</h2>
        <div className="text-sm text-gray-600">
          {activeTasks.length} active, {completedTasks.length} completed
        </div>
      </div>

      {/* Add New Task */}
      <form onSubmit={handleAddTask} className="mb-6">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add</span>
          </button>
        </div>
      </form>

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Active Tasks</h3>
          <div className="space-y-2">
            {activeTasks.map(task => (
              <div
                key={task.id}
                className={`border-l-4 rounded-lg p-4 ${getPriorityColor(task.priority)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {editingTask === task.id ? (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(task.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(task.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-medium text-gray-800">{task.title}</h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Clock size={14} />
                            <span>{task.estimatedDuration || 25}min</span>
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.priority === 'high' ? 'bg-red-100 text-red-800' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {editingTask !== task.id && (
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => onStartFocusSession && onStartFocusSession(task.id)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Start Focus Session"
                      >
                        <Play size={16} />
                      </button>
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="Mark Complete"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => handleEditTask(task)}
                        className="text-gray-600 hover:text-gray-800 p-1"
                        title="Edit Task"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete Task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Completed Tasks</h3>
          <div className="space-y-2">
            {completedTasks.slice(-5).map(task => (
              <div
                key={task.id}
                className="border-l-4 border-l-gray-400 bg-gray-50 rounded-lg p-4 opacity-75"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-600 line-through">{task.title}</h4>
                    <div className="text-sm text-gray-500 mt-1">
                      Completed: {new Date(task.completedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete Task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {completedTasks.length > 5 && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              Showing last 5 completed tasks
            </p>
          )}
        </div>
      )}

      {tasks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No tasks yet. Add your first task to get started!</p>
        </div>
      )}
    </div>
  );
};

export default TaskList;