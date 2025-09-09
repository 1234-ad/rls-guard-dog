# Security Implementation Guide

## Overview

RLS Guard Dog demonstrates comprehensive Row Level Security (RLS) implementation using Supabase PostgreSQL. This document outlines the security architecture, policies, and testing methodology.

## Security Architecture

### Core Principles

1. **Defense in Depth**: Multiple layers of security from database to application
2. **Principle of Least Privilege**: Users can only access data they need
3. **Database-Level Enforcement**: Security policies enforced at the database level
4. **Role-Based Access Control**: Different permissions for different user roles

### User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| `student` | Regular students | Own data only |
| `teacher` | Classroom teachers | Own classroom students |
| `admin` | System administrators | All data |

## RLS Policies

### Progress Table (Most Critical)

The `progress` table contains student assignment submissions and grades. This is the most security-critical table.

#### Student Access
```sql
-- Students can ONLY view their own progress
CREATE POLICY "Students can view own progress" ON progress
FOR SELECT USING (user_id = auth.uid());

-- Students can submit their own progress
CREATE POLICY "Students can submit own progress" ON progress
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Students can update their own progress (before grading)
CREATE POLICY "Students can update own progress" ON progress
FOR UPDATE USING (
  user_id = auth.uid() 
  AND status = 'pending'
);
```

#### Teacher Access
```sql
-- Teachers can view all progress for their classroom students
CREATE POLICY "Teachers can view all progress" ON progress
FOR SELECT USING (is_teacher() OR is_admin());

-- Teachers can update progress for students in their classrooms
CREATE POLICY "Teachers can update student progress" ON progress
FOR UPDATE USING (
  assignment_id IN (
    SELECT a.id 
    FROM assignments a
    JOIN classrooms c ON a.classroom_id = c.id
    WHERE c.teacher_id = auth.uid()
  ) OR is_admin()
);
```

### Classroom Table

Controls which classrooms users can see and manage.

```sql
-- Students can view classrooms they're enrolled in
CREATE POLICY "Students can view enrolled classrooms" ON classrooms
FOR SELECT USING (
  id IN (
    SELECT classroom_id 
    FROM classroom_enrollments 
    WHERE user_id = auth.uid()
  )
  OR is_teacher() 
  OR is_admin()
);

-- Teachers can manage their own classrooms
CREATE POLICY "Teachers can update own classrooms" ON classrooms
FOR UPDATE USING (teacher_id = auth.uid() OR is_admin());
```

### Assignment Table

Ensures students only see assignments for their enrolled classrooms.

```sql
-- Students can view assignments for their enrolled classrooms
CREATE POLICY "Students can view classroom assignments" ON assignments
FOR SELECT USING (
  classroom_id IN (
    SELECT classroom_id 
    FROM classroom_enrollments 
    WHERE user_id = auth.uid()
  )
  OR is_teacher() 
  OR is_admin()
);
```

### User Table

Controls access to user profile information.

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid() = id);

-- Teachers can view all users
CREATE POLICY "Teachers can view all users" ON users
FOR SELECT USING (is_teacher() OR is_admin());
```

## Security Helper Functions

### Role Checking Functions

```sql
-- Check if current user is a teacher
CREATE OR REPLACE FUNCTION is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'teacher' 
    FROM users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin' 
    FROM users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Access Validation Functions

```sql
-- Validate student can only access their own data
CREATE OR REPLACE FUNCTION validate_student_access(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- If user is teacher or admin, allow access
  IF is_teacher() OR is_admin() THEN
    RETURN TRUE;
  END IF;
  
  -- If user is student, only allow access to their own data
  RETURN auth.uid() = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Security Testing

### Test Categories

1. **Access Control Tests**: Verify users can only access authorized data
2. **Data Modification Tests**: Ensure users can only modify appropriate records
3. **Cross-User Access Tests**: Confirm users cannot access other users' data
4. **Role Escalation Tests**: Verify users cannot gain unauthorized privileges
5. **SQL Injection Tests**: Ensure RLS policies prevent injection attacks

### Critical Test Scenarios

#### Student Data Isolation
```javascript
test('Student can only see their own progress', async () => {
  const studentClient = createUserClient(TEST_USERS.STUDENT_1)
  
  const { data, error } = await studentClient
    .from('progress')
    .select('*')
  
  // Should only return records for this student
  data?.forEach(record => {
    expect(record.user_id).toBe(TEST_USERS.STUDENT_1)
  })
})
```

#### Teacher Classroom Boundaries
```javascript
test('Teacher cannot see progress for other teachers classrooms', async () => {
  const teacherClient = createUserClient(TEST_USERS.TEACHER_2)
  
  const { data, error } = await teacherClient
    .from('progress')
    .select('*, assignment:assignments(classroom:classrooms(teacher_id))')
    .eq('assignment.classroom.teacher_id', TEST_USERS.TEACHER_1)
  
  // Should return empty array
  expect(data).toEqual([])
})
```

#### Data Modification Security
```javascript
test('Student cannot modify other students progress', async () => {
  const studentClient = createUserClient(TEST_USERS.STUDENT_1)
  
  const { data, error } = await studentClient
    .from('progress')
    .update({ points_earned: 100 })
    .eq('user_id', TEST_USERS.STUDENT_2)
    .select()
  
  // Should not update anything
  expect(data).toEqual([])
})
```

## Security Best Practices

### Database Level

1. **Enable RLS on all tables**: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
2. **Use SECURITY DEFINER functions**: For helper functions that need elevated privileges
3. **Validate all policies**: Test both positive and negative cases
4. **Use specific policies**: Avoid overly broad `USING (true)` policies
5. **Regular security audits**: Review and test policies regularly

### Application Level

1. **Never bypass RLS**: Don't use service role key for user operations
2. **Validate user context**: Always check user authentication before operations
3. **Use typed clients**: TypeScript helps catch security issues early
4. **Log security events**: Monitor for suspicious access patterns
5. **Regular dependency updates**: Keep security patches current

### Testing

1. **Comprehensive test coverage**: Test all user roles and scenarios
2. **Automated security tests**: Run security tests in CI/CD pipeline
3. **Penetration testing**: Regular security assessments
4. **Test with real data**: Use realistic test datasets
5. **Performance testing**: Ensure security doesn't impact performance

## Common Security Pitfalls

### ❌ Avoid These Mistakes

1. **Using service role for user operations**
   ```javascript
   // WRONG - Bypasses RLS
   const { data } = await supabaseAdmin.from('progress').select('*')
   ```

2. **Overly permissive policies**
   ```sql
   -- WRONG - Too broad
   CREATE POLICY "Allow all" ON progress FOR ALL USING (true);
   ```

3. **Client-side security only**
   ```javascript
   // WRONG - Can be bypassed
   if (user.role === 'student') {
     // Filter data in JavaScript
   }
   ```

4. **Ignoring edge cases**
   ```sql
   -- WRONG - Doesn't handle null values
   CREATE POLICY "Students own data" ON progress
   FOR SELECT USING (user_id = auth.uid());
   ```

### ✅ Correct Approaches

1. **Use authenticated client for user operations**
   ```javascript
   // CORRECT - Respects RLS
   const { data } = await supabase.from('progress').select('*')
   ```

2. **Specific, restrictive policies**
   ```sql
   -- CORRECT - Specific and secure
   CREATE POLICY "Students can view own progress" ON progress
   FOR SELECT USING (user_id = auth.uid() AND auth.uid() IS NOT NULL);
   ```

3. **Database-enforced security**
   ```sql
   -- CORRECT - Enforced at database level
   CREATE POLICY "Teacher classroom access" ON progress
   FOR SELECT USING (
     assignment_id IN (
       SELECT a.id FROM assignments a
       JOIN classrooms c ON a.classroom_id = c.id
       WHERE c.teacher_id = auth.uid()
     )
   );
   ```

## Monitoring and Auditing

### Security Metrics

- Failed authentication attempts
- Unauthorized access attempts
- Policy violations
- Unusual data access patterns
- Performance impact of RLS policies

### Audit Logging

```sql
-- Example audit trigger
CREATE OR REPLACE FUNCTION audit_progress_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    table_name,
    operation,
    user_id,
    old_values,
    new_values,
    timestamp
  ) VALUES (
    'progress',
    TG_OP,
    auth.uid(),
    row_to_json(OLD),
    row_to_json(NEW),
    NOW()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Conclusion

RLS Guard Dog demonstrates that database-level security is both achievable and essential for modern applications. By implementing comprehensive RLS policies, thorough testing, and following security best practices, you can build applications that are secure by design.

The key is to:
1. Design security from the ground up
2. Test thoroughly and continuously
3. Monitor and audit regularly
4. Stay updated with security best practices

Remember: **Security is not a feature, it's a foundation.**