'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  Edit3, 
  Save, 
  X,
  Plus,
  Trash2,
  Eye
} from 'lucide-react'

type Progress = Database['public']['Tables']['progress']['Row']
type Assignment = Database['public']['Tables']['assignments']['Row']
type Classroom = Database['public']['Tables']['classrooms']['Row']
type User = Database['public']['Tables']['users']['Row']

interface ProgressWithDetails extends Progress {
  assignment: Assignment & {
    classroom: Classroom
  }
  user: User
}

interface EditingProgress {
  id: string
  points_earned: number
  feedback: string
  status: 'pending' | 'submitted' | 'graded'
}

export default function TeacherDashboard() {
  const [allProgress, setAllProgress] = useState<ProgressWithDetails[]>([])
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [editingProgress, setEditingProgress] = useState<EditingProgress | null>(null)
  const [selectedClassroom, setSelectedClassroom] = useState<string>('all')

  useEffect(() => {
    fetchTeacherData()
  }, [])

  const fetchTeacherData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (!user) return

      // Fetch teacher's classrooms
      const { data: classroomsData, error: classroomsError } = await supabase
        .from('classrooms')
        .select('*')
        .eq('teacher_id', user.id)
        .order('name')

      if (classroomsError) {
        console.error('Error fetching classrooms:', classroomsError)
        return
      }

      setClassrooms(classroomsData || [])

      // Fetch all progress for teacher's classrooms
      // RLS ensures teacher only sees progress for their classroom students
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select(`
          *,
          assignment:assignments(
            *,
            classroom:classrooms(*)
          ),
          user:users(*)
        `)
        .order('updated_at', { ascending: false })

      if (progressError) {
        console.error('Error fetching progress:', progressError)
        return
      }

      setAllProgress(progressData as ProgressWithDetails[])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditProgress = (progress: ProgressWithDetails) => {
    setEditingProgress({
      id: progress.id,
      points_earned: progress.points_earned,
      feedback: progress.feedback || '',
      status: progress.status
    })
  }

  const handleSaveProgress = async () => {
    if (!editingProgress) return

    try {
      const { error } = await supabase
        .from('progress')
        .update({
          points_earned: editingProgress.points_earned,
          feedback: editingProgress.feedback,
          status: editingProgress.status,
          graded_at: editingProgress.status === 'graded' ? new Date().toISOString() : null
        })
        .eq('id', editingProgress.id)

      if (error) {
        console.error('Error updating progress:', error)
        return
      }

      // Refresh data
      await fetchTeacherData()
      setEditingProgress(null)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleCancelEdit = () => {
    setEditingProgress(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'graded':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredProgress = selectedClassroom === 'all' 
    ? allProgress 
    : allProgress.filter(p => p.assignment.classroom_id === selectedClassroom)

  const stats = {
    totalStudents: new Set(allProgress.map(p => p.user_id)).size,
    totalAssignments: new Set(allProgress.map(p => p.assignment_id)).size,
    pendingGrading: allProgress.filter(p => p.status === 'submitted').length,
    avgScore: allProgress.filter(p => p.status === 'graded').length > 0 
      ? Math.round(
          allProgress
            .filter(p => p.status === 'graded')
            .reduce((sum, p) => sum + (p.points_earned / p.assignment.max_points * 100), 0) /
          allProgress.filter(p => p.status === 'graded').length
        )
      : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <GraduationCap className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
                <p className="text-sm text-gray-600">Manage all student progress and grades</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Teacher Access
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalAssignments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Edit3 className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Grading</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingGrading}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <GraduationCap className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.avgScore}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter by Classroom:</label>
            <select
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Classrooms</option>
              {classrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Progress Management */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Student Progress Management</h2>
            <p className="text-sm text-gray-600">View and grade all student submissions</p>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredProgress.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No progress records found</p>
                <p className="text-sm text-gray-400">Students haven't started assignments yet</p>
              </div>
            ) : (
              filteredProgress.map((item) => (
                <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {item.user.full_name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {item.user.full_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {item.assignment.title} - {item.assignment.classroom.name}
                          </p>
                        </div>
                      </div>
                      
                      {item.submission_text && (
                        <div className="ml-11 mb-3">
                          <p className="text-xs text-gray-500 mb-1">Student Submission:</p>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                            {item.submission_text}
                          </p>
                        </div>
                      )}
                      
                      {editingProgress?.id === item.id ? (
                        <div className="ml-11 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Points Earned
                              </label>
                              <input
                                type="number"
                                min="0"
                                max={item.assignment.max_points}
                                value={editingProgress.points_earned}
                                onChange={(e) => setEditingProgress({
                                  ...editingProgress,
                                  points_earned: parseInt(e.target.value) || 0
                                })}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Status
                              </label>
                              <select
                                value={editingProgress.status}
                                onChange={(e) => setEditingProgress({
                                  ...editingProgress,
                                  status: e.target.value as 'pending' | 'submitted' | 'graded'
                                })}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="pending">Pending</option>
                                <option value="submitted">Submitted</option>
                                <option value="graded">Graded</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Feedback
                            </label>
                            <textarea
                              value={editingProgress.feedback}
                              onChange={(e) => setEditingProgress({
                                ...editingProgress,
                                feedback: e.target.value
                              })}
                              rows={3}
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Provide feedback to the student..."
                            />
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSaveProgress}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              <Save className="w-4 h-4 mr-1" />
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        item.feedback && (
                          <div className="ml-11">
                            <p className="text-xs text-gray-500 mb-1">Your Feedback:</p>
                            <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded">
                              {item.feedback}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 ml-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                      
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {item.points_earned}/{item.assignment.max_points}
                        </p>
                        <p className="text-xs text-gray-500">
                          {Math.round((item.points_earned / item.assignment.max_points) * 100)}%
                        </p>
                      </div>
                      
                      {editingProgress?.id !== item.id && (
                        <button
                          onClick={() => handleEditProgress(item)}
                          className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <Edit3 className="w-3 h-3 mr-1" />
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                🔒 Teacher Access Level
              </h3>
              <p className="mt-1 text-sm text-green-700">
                You can view and modify progress for all students in your classrooms. RLS policies ensure you only see data for your assigned classes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}