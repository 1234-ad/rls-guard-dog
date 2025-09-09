'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { BookOpen, Clock, CheckCircle, AlertCircle } from 'lucide-react'

type Progress = Database['public']['Tables']['progress']['Row']
type Assignment = Database['public']['Tables']['assignments']['Row']
type Classroom = Database['public']['Tables']['classrooms']['Row']

interface ProgressWithDetails extends Progress {
  assignment: Assignment & {
    classroom: Classroom
  }
}

export default function StudentDashboard() {
  const [progress, setProgress] = useState<ProgressWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchUserAndProgress()
  }, [])

  const fetchUserAndProgress = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (!user) return

      // Fetch student's progress with assignment and classroom details
      // RLS ensures student only sees their own progress
      const { data, error } = await supabase
        .from('progress')
        .select(`
          *,
          assignment:assignments(
            *,
            classroom:classrooms(*)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching progress:', error)
        return
      }

      setProgress(data as ProgressWithDetails[])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'submitted':
        return <AlertCircle className="w-5 h-5 text-blue-500" />
      case 'graded':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
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
              <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Student
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
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                <p className="text-2xl font-semibold text-gray-900">{progress.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {progress.filter(p => p.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Submitted</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {progress.filter(p => p.status === 'submitted').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Graded</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {progress.filter(p => p.status === 'graded').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">My Assignments</h2>
            <p className="text-sm text-gray-600">Track your progress across all enrolled classrooms</p>
          </div>

          <div className="divide-y divide-gray-200">
            {progress.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No assignments found</p>
                <p className="text-sm text-gray-400">Check back later for new assignments</p>
              </div>
            ) : (
              progress.map((item) => (
                <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(item.status)}
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {item.assignment.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {item.assignment.classroom.name}
                          </p>
                        </div>
                      </div>
                      
                      {item.assignment.description && (
                        <p className="mt-2 text-sm text-gray-600 ml-8">
                          {item.assignment.description}
                        </p>
                      )}
                      
                      {item.submission_text && (
                        <div className="mt-2 ml-8">
                          <p className="text-xs text-gray-500 mb-1">Your Submission:</p>
                          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                            {item.submission_text}
                          </p>
                        </div>
                      )}
                      
                      {item.feedback && (
                        <div className="mt-2 ml-8">
                          <p className="text-xs text-gray-500 mb-1">Teacher Feedback:</p>
                          <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
                            {item.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                      
                      {item.status === 'graded' && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {item.points_earned}/{item.assignment.max_points}
                          </p>
                          <p className="text-xs text-gray-500">points</p>
                        </div>
                      )}
                      
                      {item.assignment.due_date && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Due:</p>
                          <p className="text-sm text-gray-900">
                            {new Date(item.assignment.due_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                🔒 Secure Data Access
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                You can only view your own assignments and progress. This page is protected by Row Level Security (RLS) policies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}