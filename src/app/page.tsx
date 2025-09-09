'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Shield, Users, BookOpen, Lock, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Get user role from database
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        if (!error && userData) {
          setUserRole(userData.role)
        }
      }
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Sign in error:', error)
        alert('Sign in failed: ' + error.message)
      } else {
        // Refresh user data
        await checkUser()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
      } else {
        setUser(null)
        setUserRole(null)
      }
    } catch (error) {
      console.error('Error:', error)
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
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">RLS Guard Dog</h1>
                <p className="text-sm text-gray-600">Row Level Security Demo Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">
                    Welcome, {user.email}
                  </span>
                  {userRole && (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      userRole === 'teacher' ? 'bg-green-100 text-green-800' :
                      userRole === 'admin' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {userRole}
                    </span>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="text-sm text-gray-600">
                  Not signed in
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Secure Educational Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Demonstrating Row Level Security (RLS) with Supabase. Students see only their data, 
            teachers manage their classrooms, all secured at the database level.
          </p>
          
          <div className="flex justify-center space-x-4">
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Database-Level Security</span>
            </div>
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Role-Based Access</span>
            </div>
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Integration Tested</span>
            </div>
          </div>
        </div>

        {user ? (
          /* Authenticated User Dashboard */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Student Dashboard */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Student View</h2>
                  <p className="text-sm text-gray-600">Personal progress and assignments</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Access your personal dashboard to view assignments, track progress, and submit work. 
                RLS ensures you only see your own data.
              </p>
              <Link
                href="/student"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                View Student Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-xs text-blue-700">
                  🔒 <strong>Security:</strong> Students can only view their own progress records
                </p>
              </div>
            </div>

            {/* Teacher Dashboard */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Users className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Teacher View</h2>
                  <p className="text-sm text-gray-600">Manage all student data</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Access the teacher dashboard to view all student progress, grade assignments, 
                and manage classroom data. Full access to your classroom students.
              </p>
              <Link
                href="/teacher"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                View Teacher Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <div className="mt-4 p-3 bg-green-50 rounded-md">
                <p className="text-xs text-green-700">
                  🔒 <strong>Security:</strong> Teachers can view/edit data for their classroom students only
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Demo Login Section */
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
            <div className="text-center mb-8">
              <Lock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Try the Demo</h2>
              <p className="text-gray-600">
                Sign in with demo accounts to experience different security levels
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Student Demo */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Student Demo</h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm text-gray-600">Email:</label>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">student1@school.edu</code>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Password:</label>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">password123</code>
                  </div>
                </div>
                <button
                  onClick={() => handleSignIn('student1@school.edu', 'password123')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Sign In as Student
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Will only see personal assignments and progress
                </p>
              </div>

              {/* Teacher Demo */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Teacher Demo</h3>
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm text-gray-600">Email:</label>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">teacher1@school.edu</code>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Password:</label>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">password123</code>
                  </div>
                </div>
                <button
                  onClick={() => handleSignIn('teacher1@school.edu', 'password123')}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  Sign In as Teacher
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Can view and manage all classroom student data
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Row Level Security</h3>
            <p className="text-gray-600">
              Database-level security policies ensure users can only access their authorized data
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Role-Based Access</h3>
            <p className="text-gray-600">
              Different user roles (student, teacher, admin) with appropriate permissions
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Integration Tested</h3>
            <p className="text-gray-600">
              Comprehensive test suite validates that security policies work correctly
            </p>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-gray-900 text-white rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Technical Implementation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-3">Security Policies</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Students can only SELECT their own progress records</li>
                <li>• Teachers can SELECT/UPDATE progress for their classroom students</li>
                <li>• Classroom access restricted by enrollment</li>
                <li>• Assignment visibility based on classroom membership</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3">Tech Stack</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Supabase (PostgreSQL with RLS)</li>
                <li>• Next.js 14 with TypeScript</li>
                <li>• TailwindCSS for styling</li>
                <li>• MongoDB for additional data storage</li>
                <li>• Jest for integration testing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}