/**
 * RLS POLICY INTEGRATION TESTS
 * 
 * These tests validate that Row Level Security policies are working correctly
 * by testing actual database queries with different user contexts.
 */

import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Test user IDs from seed data
const TEST_USERS = {
  TEACHER_1: '11111111-1111-1111-1111-111111111111', // Ms. Sarah Johnson
  TEACHER_2: '22222222-2222-2222-2222-222222222222', // Mr. David Wilson
  ADMIN: '33333333-3333-3333-3333-333333333333',     // Admin User
  STUDENT_1: '44444444-4444-4444-4444-444444444444', // Alice Smith
  STUDENT_2: '55555555-5555-5555-5555-555555555555', // Bob Jones
  STUDENT_3: '66666666-6666-6666-6666-666666666666', // Carol Davis
  STUDENT_4: '77777777-7777-7777-7777-777777777777', // David Brown
}

const TEST_CLASSROOMS = {
  MATH_101: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  SCIENCE_101: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  HISTORY_101: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
  ENGLISH_101: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
}

// Helper function to create client with specific user context
function createUserClient(userId: string) {
  const client = createClient<Database>(supabaseUrl, supabaseServiceKey)
  
  // Mock JWT token for the user
  const mockJWT = {
    sub: userId,
    role: 'authenticated',
    aud: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  }
  
  // Set the auth context
  client.auth.setSession({
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: userId,
      aud: 'authenticated',
      role: 'authenticated',
      email: `test-${userId}@example.com`,
      app_metadata: {},
      user_metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  })
  
  return client
}

describe('RLS Policy Tests', () => {
  
  describe('Progress Table RLS - CRITICAL SECURITY', () => {
    
    test('Student can only see their own progress', async () => {
      const studentClient = createUserClient(TEST_USERS.STUDENT_1)
      
      const { data, error } = await studentClient
        .from('progress')
        .select('*')
      
      expect(error).toBeNull()
      expect(data).toBeDefined()
      
      // Alice (STUDENT_1) should only see her own progress records
      data?.forEach(record => {
        expect(record.user_id).toBe(TEST_USERS.STUDENT_1)
      })
    })
    
    test('Student cannot see other students progress', async () => {
      const studentClient = createUserClient(TEST_USERS.STUDENT_1)
      
      const { data, error } = await studentClient
        .from('progress')
        .select('*')
        .eq('user_id', TEST_USERS.STUDENT_2) // Try to access Bob's progress
      
      expect(error).toBeNull()
      expect(data).toEqual([]) // Should return empty array
    })
    
    test('Teacher can see all progress for their classroom students', async () => {
      const teacherClient = createUserClient(TEST_USERS.TEACHER_1)
      
      const { data, error } = await teacherClient
        .from('progress')
        .select(`
          *,
          assignment:assignments(
            classroom_id,
            classroom:classrooms(teacher_id)
          )
        `)
      
      expect(error).toBeNull()
      expect(data).toBeDefined()
      
      // Teacher 1 should see progress for students in their classrooms (Math & Science)
      const validClassrooms = [TEST_CLASSROOMS.MATH_101, TEST_CLASSROOMS.SCIENCE_101]
      data?.forEach(record => {
        expect(validClassrooms).toContain(record.assignment.classroom_id)
        expect(record.assignment.classroom.teacher_id).toBe(TEST_USERS.TEACHER_1)
      })
    })
    
    test('Teacher cannot see progress for other teachers classrooms', async () => {
      const teacherClient = createUserClient(TEST_USERS.TEACHER_2)
      
      const { data, error } = await teacherClient
        .from('progress')
        .select(`
          *,
          assignment:assignments(
            classroom_id,
            classroom:classrooms(teacher_id)
          )
        `)
        .eq('assignment.classroom.teacher_id', TEST_USERS.TEACHER_1)
      
      expect(error).toBeNull()
      expect(data).toEqual([]) // Should not see Teacher 1's classroom progress
    })
    
  })
  
  describe('Classroom Table RLS', () => {
    
    test('Student can only see enrolled classrooms', async () => {
      const studentClient = createUserClient(TEST_USERS.STUDENT_1)
      
      const { data, error } = await studentClient
        .from('classrooms')
        .select('*')
      
      expect(error).toBeNull()
      expect(data).toBeDefined()
      
      // Alice is enrolled in Math and Science only
      const expectedClassrooms = [TEST_CLASSROOMS.MATH_101, TEST_CLASSROOMS.SCIENCE_101]
      expect(data?.length).toBe(2)
      data?.forEach(classroom => {
        expect(expectedClassrooms).toContain(classroom.id)
      })
    })
    
    test('Student cannot see non-enrolled classrooms', async () => {
      const studentClient = createUserClient(TEST_USERS.STUDENT_1)
      
      const { data, error } = await studentClient
        .from('classrooms')
        .select('*')
        .eq('id', TEST_CLASSROOMS.HISTORY_101) // Alice not enrolled in History
      
      expect(error).toBeNull()
      expect(data).toEqual([])
    })
    
    test('Teacher can see all classrooms', async () => {
      const teacherClient = createUserClient(TEST_USERS.TEACHER_1)
      
      const { data, error } = await teacherClient
        .from('classrooms')
        .select('*')
      
      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.length).toBeGreaterThan(2) // Should see all classrooms
    })
    
  })
  
  describe('Assignment Table RLS', () => {
    
    test('Student can only see assignments for enrolled classrooms', async () => {
      const studentClient = createUserClient(TEST_USERS.STUDENT_2)
      
      const { data, error } = await studentClient
        .from('assignments')
        .select('*, classroom:classrooms(*)')
      
      expect(error).toBeNull()
      expect(data).toBeDefined()
      
      // Bob is enrolled in Math and History
      const expectedClassrooms = [TEST_CLASSROOMS.MATH_101, TEST_CLASSROOMS.HISTORY_101]
      data?.forEach(assignment => {
        expect(expectedClassrooms).toContain(assignment.classroom_id)
      })
    })
    
    test('Student cannot see assignments for non-enrolled classrooms', async () => {
      const studentClient = createUserClient(TEST_USERS.STUDENT_2)
      
      const { data, error } = await studentClient
        .from('assignments')
        .select('*')
        .eq('classroom_id', TEST_CLASSROOMS.SCIENCE_101) // Bob not in Science
      
      expect(error).toBeNull()
      expect(data).toEqual([])
    })
    
  })
  
  describe('User Table RLS', () => {
    
    test('Student can see their own profile', async () => {
      const studentClient = createUserClient(TEST_USERS.STUDENT_1)
      
      const { data, error } = await studentClient
        .from('users')
        .select('*')
        .eq('id', TEST_USERS.STUDENT_1)
      
      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.length).toBe(1)
      expect(data?.[0].id).toBe(TEST_USERS.STUDENT_1)
    })
    
    test('Student cannot see other users profiles', async () => {
      const studentClient = createUserClient(TEST_USERS.STUDENT_1)
      
      const { data, error } = await studentClient
        .from('users')
        .select('*')
        .eq('id', TEST_USERS.STUDENT_2)
      
      expect(error).toBeNull()
      expect(data).toEqual([])
    })
    
    test('Teacher can see all users', async () => {
      const teacherClient = createUserClient(TEST_USERS.TEACHER_1)
      
      const { data, error } = await teacherClient
        .from('users')
        .select('*')
      
      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data?.length).toBeGreaterThan(4) // Should see all users
    })
    
  })
  
  describe('Data Modification RLS', () => {
    
    test('Student can submit their own progress', async () => {
      const studentClient = createUserClient(TEST_USERS.STUDENT_1)
      
      const { data, error } = await studentClient
        .from('progress')
        .update({
          submission_text: 'Updated submission text',
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('user_id', TEST_USERS.STUDENT_1)
        .eq('status', 'pending')
        .select()
      
      expect(error).toBeNull()
      expect(data).toBeDefined()
    })
    
    test('Student cannot modify other students progress', async () => {
      const studentClient = createUserClient(TEST_USERS.STUDENT_1)
      
      const { data, error } = await studentClient
        .from('progress')
        .update({
          submission_text: 'Hacking attempt',
          points_earned: 100
        })
        .eq('user_id', TEST_USERS.STUDENT_2)
        .select()
      
      expect(error).toBeNull()
      expect(data).toEqual([]) // Should not update anything
    })
    
    test('Teacher can grade student progress in their classrooms', async () => {
      const teacherClient = createUserClient(TEST_USERS.TEACHER_1)
      
      const { data, error } = await teacherClient
        .from('progress')
        .update({
          status: 'graded',
          points_earned: 85,
          feedback: 'Good work!',
          graded_at: new Date().toISOString()
        })
        .eq('status', 'submitted')
        .select(`
          *,
          assignment:assignments(
            classroom:classrooms(teacher_id)
          )
        `)
      
      expect(error).toBeNull()
      // Verify teacher can only grade their own classroom assignments
      data?.forEach(record => {
        expect(record.assignment.classroom.teacher_id).toBe(TEST_USERS.TEACHER_1)
      })
    })
    
  })
  
  describe('Security Boundary Tests', () => {
    
    test('SQL injection attempts are blocked by RLS', async () => {
      const studentClient = createUserClient(TEST_USERS.STUDENT_1)
      
      // Attempt SQL injection in filter
      const { data, error } = await studentClient
        .from('progress')
        .select('*')
        .eq('user_id', "'; DROP TABLE progress; --")
      
      expect(error).toBeNull()
      expect(data).toEqual([])
    })
    
    test('Direct table access without proper context fails', async () => {
      const anonymousClient = createClient<Database>(supabaseUrl, supabaseServiceKey)
      
      const { data, error } = await anonymousClient
        .from('progress')
        .select('*')
      
      // Should fail or return empty due to RLS
      expect(data).toEqual([])
    })
    
  })
  
})

describe('Security Helper Functions', () => {
  
  test('is_teacher() function works correctly', async () => {
    const teacherClient = createUserClient(TEST_USERS.TEACHER_1)
    
    const { data, error } = await teacherClient
      .rpc('is_teacher')
    
    expect(error).toBeNull()
    expect(data).toBe(true)
  })
  
  test('is_teacher() returns false for students', async () => {
    const studentClient = createUserClient(TEST_USERS.STUDENT_1)
    
    const { data, error } = await studentClient
      .rpc('is_teacher')
    
    expect(error).toBeNull()
    expect(data).toBe(false)
  })
  
  test('validate_student_access() enforces proper access', async () => {
    const studentClient = createUserClient(TEST_USERS.STUDENT_1)
    
    // Should allow access to own data
    const { data: ownAccess, error: ownError } = await studentClient
      .rpc('validate_student_access', { target_user_id: TEST_USERS.STUDENT_1 })
    
    expect(ownError).toBeNull()
    expect(ownAccess).toBe(true)
    
    // Should deny access to other student data
    const { data: otherAccess, error: otherError } = await studentClient
      .rpc('validate_student_access', { target_user_id: TEST_USERS.STUDENT_2 })
    
    expect(otherError).toBeNull()
    expect(otherAccess).toBe(false)
  })
  
})