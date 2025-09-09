-- =====================================================
-- SEED DATA FOR TESTING RLS POLICIES
-- =====================================================

-- Insert test users (using fixed UUIDs for consistent testing)
INSERT INTO users (id, email, full_name, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'teacher1@school.edu', 'Ms. Sarah Johnson', 'teacher'),
  ('22222222-2222-2222-2222-222222222222', 'teacher2@school.edu', 'Mr. David Wilson', 'teacher'),
  ('33333333-3333-3333-3333-333333333333', 'admin@school.edu', 'Admin User', 'admin'),
  ('44444444-4444-4444-4444-444444444444', 'student1@school.edu', 'Alice Smith', 'student'),
  ('55555555-5555-5555-5555-555555555555', 'student2@school.edu', 'Bob Jones', 'student'),
  ('66666666-6666-6666-6666-666666666666', 'student3@school.edu', 'Carol Davis', 'student'),
  ('77777777-7777-7777-7777-777777777777', 'student4@school.edu', 'David Brown', 'student');

-- Insert test classrooms
INSERT INTO classrooms (id, name, description, teacher_id) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mathematics 101', 'Introduction to Algebra and Geometry', '11111111-1111-1111-1111-111111111111'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Science 101', 'Basic Physics and Chemistry', '11111111-1111-1111-1111-111111111111'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'History 101', 'World History Overview', '22222222-2222-2222-2222-222222222222'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'English 101', 'Literature and Writing', '22222222-2222-2222-2222-222222222222');

-- Insert classroom enrollments
INSERT INTO classroom_enrollments (classroom_id, user_id) VALUES
  -- Alice (student1) enrolled in Math and Science
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444'),
  
  -- Bob (student2) enrolled in Math and History
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '55555555-5555-5555-5555-555555555555'),
  
  -- Carol (student3) enrolled in Science and English
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '66666666-6666-6666-6666-666666666666'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '66666666-6666-6666-6666-666666666666'),
  
  -- David (student4) enrolled in all classes
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '77777777-7777-7777-7777-777777777777'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '77777777-7777-7777-7777-777777777777'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '77777777-7777-7777-7777-777777777777'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '77777777-7777-7777-7777-777777777777');

-- Insert test assignments
INSERT INTO assignments (id, classroom_id, title, description, due_date, max_points) VALUES
  -- Math assignments
  ('11111111-aaaa-aaaa-aaaa-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Algebra Basics', 'Complete exercises 1-20 in chapter 3', NOW() + INTERVAL '7 days', 100),
  ('22222222-aaaa-aaaa-aaaa-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Geometry Quiz', 'Online quiz on basic geometric shapes', NOW() + INTERVAL '3 days', 50),
  
  -- Science assignments
  ('33333333-bbbb-bbbb-bbbb-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Physics Lab Report', 'Write a report on the pendulum experiment', NOW() + INTERVAL '10 days', 150),
  ('44444444-bbbb-bbbb-bbbb-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Chemistry Worksheet', 'Complete the periodic table exercises', NOW() + INTERVAL '5 days', 75),
  
  -- History assignments
  ('55555555-cccc-cccc-cccc-555555555555', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Ancient Civilizations Essay', 'Write a 500-word essay on ancient Rome', NOW() + INTERVAL '14 days', 200),
  
  -- English assignments
  ('66666666-dddd-dddd-dddd-666666666666', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Poetry Analysis', 'Analyze the themes in Shakespeare sonnets', NOW() + INTERVAL '12 days', 120);

-- Insert test progress records
INSERT INTO progress (user_id, assignment_id, status, submission_text, points_earned, feedback, submitted_at, graded_at) VALUES
  -- Alice's progress
  ('44444444-4444-4444-4444-444444444444', '11111111-aaaa-aaaa-aaaa-111111111111', 'graded', 'Completed all exercises with detailed work shown.', 95, 'Excellent work! Minor error in problem 15.', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
  ('44444444-4444-4444-4444-444444444444', '22222222-aaaa-aaaa-aaaa-222222222222', 'submitted', 'Quiz completed online.', 0, NULL, NOW() - INTERVAL '1 day', NULL),
  ('44444444-4444-4444-4444-444444444444', '33333333-bbbb-bbbb-bbbb-333333333333', 'pending', NULL, 0, NULL, NULL, NULL),
  
  -- Bob's progress
  ('55555555-5555-5555-5555-555555555555', '11111111-aaaa-aaaa-aaaa-111111111111', 'submitted', 'Completed exercises 1-18, struggling with 19-20.', 0, NULL, NOW() - INTERVAL '3 days', NULL),
  ('55555555-5555-5555-5555-555555555555', '55555555-cccc-cccc-cccc-555555555555', 'pending', NULL, 0, NULL, NULL, NULL),
  
  -- Carol's progress
  ('66666666-6666-6666-6666-666666666666', '44444444-bbbb-bbbb-bbbb-444444444444', 'graded', 'All exercises completed correctly.', 75, 'Perfect score! Great understanding of the material.', NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days'),
  ('66666666-6666-6666-6666-666666666666', '66666666-dddd-dddd-dddd-666666666666', 'pending', NULL, 0, NULL, NULL, NULL),
  
  -- David's progress (enrolled in all classes)
  ('77777777-7777-7777-7777-777777777777', '11111111-aaaa-aaaa-aaaa-111111111111', 'graded', 'Good work overall, some calculation errors.', 82, 'Good effort. Review multiplication of fractions.', NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days'),
  ('77777777-7777-7777-7777-777777777777', '33333333-bbbb-bbbb-bbbb-333333333333', 'submitted', 'Lab report with detailed observations and conclusions.', 0, NULL, NOW() - INTERVAL '1 day', NULL),
  ('77777777-7777-7777-7777-777777777777', '55555555-cccc-cccc-cccc-555555555555', 'pending', NULL, 0, NULL, NULL, NULL),
  ('77777777-7777-7777-7777-777777777777', '66666666-dddd-dddd-dddd-666666666666', 'pending', NULL, 0, NULL, NULL, NULL);

-- =====================================================
-- TEST DATA SUMMARY
-- =====================================================
-- 
-- USERS:
-- - 2 Teachers: Sarah Johnson, David Wilson
-- - 1 Admin: Admin User  
-- - 4 Students: Alice Smith, Bob Jones, Carol Davis, David Brown
--
-- CLASSROOMS:
-- - Math 101 (Teacher: Sarah Johnson)
-- - Science 101 (Teacher: Sarah Johnson)  
-- - History 101 (Teacher: David Wilson)
-- - English 101 (Teacher: David Wilson)
--
-- ENROLLMENTS:
-- - Alice: Math, Science
-- - Bob: Math, History
-- - Carol: Science, English
-- - David: All classes
--
-- This data provides comprehensive test scenarios for RLS policies:
-- 1. Students can only see their own progress
-- 2. Teachers can see progress for their classroom students
-- 3. Cross-classroom access is properly restricted
-- 4. Different assignment statuses (pending, submitted, graded)
-- =====================================================