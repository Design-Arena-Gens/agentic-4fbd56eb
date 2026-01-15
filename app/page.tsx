'use client'

import { useState, useEffect } from 'react'
import { format, startOfWeek, addDays, subDays, isToday } from 'date-fns'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { Plus, Trash2, Check, TrendingUp, Calendar, Target, Award, BarChart3 } from 'lucide-react'

interface Habit {
  id: string
  name: string
  category: string
  color: string
  completions: { [date: string]: boolean }
}

interface Project {
  id: string
  name: string
  progress: number
  deadline: string
  status: 'active' | 'completed' | 'paused'
  category: string
}

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [newHabit, setNewHabit] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newProject, setNewProject] = useState('')
  const [newProjectCategory, setNewProjectCategory] = useState('')
  const [newProjectDeadline, setNewProjectDeadline] = useState('')
  const [view, setView] = useState<'habits' | 'projects' | 'stats'>('habits')

  useEffect(() => {
    const savedHabits = localStorage.getItem('habits')
    const savedProjects = localStorage.getItem('projects')
    if (savedHabits) setHabits(JSON.parse(savedHabits))
    if (savedProjects) setProjects(JSON.parse(savedProjects))
  }, [])

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits))
  }, [habits])

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects))
  }, [projects])

  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f43f5e', '#8b5cf6']

  const addHabit = () => {
    if (newHabit.trim()) {
      setHabits([
        ...habits,
        {
          id: Date.now().toString(),
          name: newHabit,
          category: newCategory || 'General',
          color: colors[habits.length % colors.length],
          completions: {}
        }
      ])
      setNewHabit('')
      setNewCategory('')
    }
  }

  const addProject = () => {
    if (newProject.trim()) {
      setProjects([
        ...projects,
        {
          id: Date.now().toString(),
          name: newProject,
          progress: 0,
          deadline: newProjectDeadline,
          status: 'active',
          category: newProjectCategory || 'General'
        }
      ])
      setNewProject('')
      setNewProjectCategory('')
      setNewProjectDeadline('')
    }
  }

  const toggleHabit = (habitId: string, date: string) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        return {
          ...habit,
          completions: {
            ...habit.completions,
            [date]: !habit.completions[date]
          }
        }
      }
      return habit
    }))
  }

  const deleteHabit = (habitId: string) => {
    setHabits(habits.filter(h => h.id !== habitId))
  }

  const deleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId))
  }

  const updateProjectProgress = (projectId: string, progress: number) => {
    setProjects(projects.map(p =>
      p.id === projectId ? { ...p, progress } : p
    ))
  }

  const getLast7Days = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      days.push(subDays(new Date(), i))
    }
    return days
  }

  const getCompletionRate = (habit: Habit) => {
    const last7Days = getLast7Days()
    const completed = last7Days.filter(date =>
      habit.completions[format(date, 'yyyy-MM-dd')]
    ).length
    return Math.round((completed / 7) * 100)
  }

  const getStreakData = () => {
    const last7Days = getLast7Days()
    return last7Days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const completed = habits.filter(h => h.completions[dateStr]).length
      return {
        date: format(date, 'EEE'),
        completed,
        total: habits.length,
        rate: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0
      }
    })
  }

  const getCategoryData = () => {
    const categories: { [key: string]: number } = {}
    habits.forEach(habit => {
      const rate = getCompletionRate(habit)
      if (categories[habit.category]) {
        categories[habit.category] = (categories[habit.category] + rate) / 2
      } else {
        categories[habit.category] = rate
      }
    })
    return Object.entries(categories).map(([name, value]) => ({ name, value: Math.round(value) }))
  }

  const getRadarData = () => {
    const categoryPerformance: { [key: string]: { total: number, count: number } } = {}

    habits.forEach(habit => {
      const rate = getCompletionRate(habit)
      if (!categoryPerformance[habit.category]) {
        categoryPerformance[habit.category] = { total: 0, count: 0 }
      }
      categoryPerformance[habit.category].total += rate
      categoryPerformance[habit.category].count += 1
    })

    return Object.entries(categoryPerformance).map(([category, data]) => ({
      category,
      score: Math.round(data.total / data.count)
    }))
  }

  const totalCompletionRate = habits.length > 0
    ? Math.round(habits.reduce((sum, h) => sum + getCompletionRate(h), 0) / habits.length)
    : 0

  const activeProjects = projects.filter(p => p.status === 'active').length
  const avgProjectProgress = projects.length > 0
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
    : 0

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
            Habit & Project Tracker
          </h1>
          <p className="text-gray-600">Track your progress, build better habits, and achieve your goals</p>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Completion Rate</p>
                <p className="text-3xl font-bold text-blue-600">{totalCompletionRate}%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Habits</p>
                <p className="text-3xl font-bold text-purple-600">{habits.length}</p>
              </div>
              <Target className="w-10 h-10 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-pink-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Projects</p>
                <p className="text-3xl font-bold text-pink-600">{activeProjects}</p>
              </div>
              <Calendar className="w-10 h-10 text-pink-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Project Progress</p>
                <p className="text-3xl font-bold text-amber-600">{avgProjectProgress}%</p>
              </div>
              <Award className="w-10 h-10 text-amber-500" />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView('habits')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              view === 'habits'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Habits
          </button>
          <button
            onClick={() => setView('projects')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              view === 'projects'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setView('stats')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              view === 'stats'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="inline w-5 h-5 mr-2" />
            Statistics
          </button>
        </div>

        {/* Habits View */}
        {view === 'habits' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Add New Habit</h2>
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  value={newHabit}
                  onChange={(e) => setNewHabit(e.target.value)}
                  placeholder="Habit name (e.g., Morning Exercise)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && addHabit()}
                />
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Category (e.g., Health)"
                  className="md:w-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && addHabit()}
                />
                <button
                  onClick={addHabit}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" /> Add Habit
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Habit Tracker</h2>
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Habit</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                    {getLast7Days().map(date => (
                      <th key={date.toISOString()} className="text-center py-3 px-2 font-semibold text-gray-700">
                        <div className="text-xs">{format(date, 'EEE')}</div>
                        <div className={`text-sm ${isToday(date) ? 'text-blue-600 font-bold' : ''}`}>
                          {format(date, 'dd')}
                        </div>
                      </th>
                    ))}
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Rate</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {habits.map(habit => (
                    <tr key={habit.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: habit.color }}></div>
                          <span className="font-medium">{habit.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                          {habit.category}
                        </span>
                      </td>
                      {getLast7Days().map(date => {
                        const dateStr = format(date, 'yyyy-MM-dd')
                        const isCompleted = habit.completions[dateStr]
                        return (
                          <td key={dateStr} className="text-center py-3 px-2">
                            <button
                              onClick={() => toggleHabit(habit.id, dateStr)}
                              className={`w-8 h-8 rounded-lg transition-all ${
                                isCompleted
                                  ? 'bg-gradient-to-r from-green-400 to-green-600 text-white shadow-md'
                                  : 'bg-gray-100 hover:bg-gray-200'
                              }`}
                            >
                              {isCompleted && <Check className="w-5 h-5 mx-auto" />}
                            </button>
                          </td>
                        )
                      })}
                      <td className="text-center py-3 px-4">
                        <span className="font-bold text-lg" style={{ color: habit.color }}>
                          {getCompletionRate(habit)}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {habits.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No habits yet. Add your first habit to get started!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projects View */}
        {view === 'projects' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Add New Project</h2>
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  placeholder="Project name"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && addProject()}
                />
                <input
                  type="text"
                  value={newProjectCategory}
                  onChange={(e) => setNewProjectCategory(e.target.value)}
                  placeholder="Category"
                  className="md:w-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && addProject()}
                />
                <input
                  type="date"
                  value={newProjectDeadline}
                  onChange={(e) => setNewProjectDeadline(e.target.value)}
                  className="md:w-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={addProject}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" /> Add Project
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map(project => (
                <div key={project.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{project.name}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {project.category}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-bold text-blue-600">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={project.progress}
                    onChange={(e) => updateProjectProgress(project.id, parseInt(e.target.value))}
                    className="w-full mb-4"
                  />

                  {project.deadline && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Deadline: {format(new Date(project.deadline), 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {projects.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center text-gray-400">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No projects yet. Add your first project to get started!</p>
              </div>
            )}
          </div>
        )}

        {/* Statistics View */}
        {view === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 7-Day Trend */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800">7-Day Completion Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getStreakData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="completed" stroke="#3b82f6" strokeWidth={3} name="Completed" />
                    <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={3} name="Total" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Completion Rate */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Completion Rate by Day</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getStreakData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="rate" fill="url(#colorGradient)" name="Completion %" />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Category Performance */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Category Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getCategoryData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getCategoryData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Radar Chart */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Category Radar</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={getRadarData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Performance" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Habit Performance Table */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Habit Performance Summary</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Habit</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">7-Day Rate</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {habits.map(habit => {
                      const rate = getCompletionRate(habit)
                      return (
                        <tr key={habit.id} className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: habit.color }}></div>
                              <span className="font-medium">{habit.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">{habit.category}</td>
                          <td className="text-center py-3 px-4">
                            <span className="font-bold text-lg" style={{ color: habit.color }}>
                              {rate}%
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all"
                                style={{
                                  width: `${rate}%`,
                                  backgroundColor: habit.color
                                }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
