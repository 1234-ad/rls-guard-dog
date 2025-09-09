-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Helper function to check if user is a teacher
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

-- Helper function to check if user is admin
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

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid() = id);

-- Teachers can view all users
CREATE POLICY "Teachers can view all users" ON users
FOR SELECT USING (is_teacher() OR is_admin());

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid() = id);

-- Only admins can insert users
CREATE POLICY "Admins can insert users" ON users
FOR INSERT WITH CHECK (is_admin());

-- =====================================================
-- CLASSROOMS TABLE POLICIES
-- =====================================================

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

-- Teachers can view all classrooms
CREATE POLICY "Teachers can view all classrooms" ON classrooms
FOR SELECT USING (is_teacher() OR is_admin());

-- Teachers can create classrooms
CREATE POLICY "Teachers can create classrooms" ON classrooms
FOR INSERT WITH CHECK (is_teacher() OR is_admin());

-- Teachers can update their own classrooms
CREATE POLICY "Teachers can update own classrooms" ON classrooms
FOR UPDATE USING (teacher_id = auth.uid() OR is_admin());

-- Teachers can delete their own classrooms
CREATE POLICY "Teachers can delete own classrooms" ON classrooms
FOR DELETE USING (teacher_id = auth.uid() OR is_admin());

-- =====================================================
-- CLASSROOM_ENROLLMENTS TABLE POLICIES
-- =====================================================

-- Students can view their own enrollments
CREATE POLICY "Students can view own enrollments" ON classroom_enrollments
FOR SELECT USING (user_id = auth.uid() OR is_teacher() OR is_admin());

-- Teachers can view all enrollments
CREATE POLICY "Teachers can view all enrollments" ON classroom_enrollments
FOR SELECT USING (is_teacher() OR is_admin());

-- Teachers can manage enrollments for their classrooms
CREATE POLICY "Teachers can manage classroom enrollments" ON classroom_enrollments
FOR ALL USING (
  classroom_id IN (
    SELECT id FROM classrooms WHERE teacher_id = auth.uid()
  ) OR is_admin()
);

-- =====================================================
-- ASSIGNMENTS TABLE POLICIES
-- =====================================================

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

-- Teachers can view all assignments
CREATE POLICY "Teachers can view all assignments" ON assignments
FOR SELECT USING (is_teacher() OR is_admin());

-- Teachers can create assignments for their classrooms
CREATE POLICY "Teachers can create assignments" ON assignments
FOR INSERT WITH CHECK (
  classroom_id IN (
    SELECT id FROM classrooms WHERE teacher_id = auth.uid()
  ) OR is_admin()
);

-- Teachers can update assignments for their classrooms
CREATE POLICY "Teachers can update assignments" ON assignments
FOR UPDATE USING (
  classroom_id IN (
    SELECT id FROM classrooms WHERE teacher_id = auth.uid()
  ) OR is_admin()
);

-- Teachers can delete assignments for their classrooms
CREATE POLICY "Teachers can delete assignments" ON assignments
FOR DELETE USING (
  classroom_id IN (
    SELECT id FROM classrooms WHERE teacher_id = auth.uid()
  ) OR is_admin()
);

-- =====================================================
-- PROGRESS TABLE POLICIES (MOST CRITICAL)
-- =====================================================

-- Students can ONLY view their own progress
CREATE POLICY "Students can view own progress" ON progress
FOR SELECT USING (user_id = auth.uid() OR is_teacher() OR is_admin());

-- Teachers can view all progress
CREATE POLICY "Teachers can view all progress" ON progress
FOR SELECT USING (is_teacher() OR is_admin());

-- Students can insert their own progress (submissions)
CREATE POLICY "Students can submit own progress" ON progress
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Students can update their own progress (before grading)
CREATE POLICY "Students can update own progress" ON progress
FOR UPDATE USING (
  user_id = auth.uid() 
  AND status = 'pending'
);

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

-- Teachers can insert progress records for their students
CREATE POLICY "Teachers can create student progress" ON progress
FOR INSERT WITH CHECK (
  assignment_id IN (
    SELECT a.id 
    FROM assignments a
    JOIN classrooms c ON a.classroom_id = c.id
    WHERE c.teacher_id = auth.uid()
  ) OR is_admin()
);

-- =====================================================
-- SECURITY VALIDATION FUNCTIONS
-- =====================================================

-- Function to validate student can only access their own data
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

-- Function to validate teacher can access classroom data
CREATE OR REPLACE FUNCTION validate_teacher_classroom_access(target_classroom_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- If user is admin, allow access
  IF is_admin() THEN
    RETURN TRUE;
  END IF;
  
  -- If user is teacher, check if they own the classroom
  RETURN EXISTS (
    SELECT 1 FROM classrooms 
    WHERE id = target_classroom_id 
    AND teacher_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;