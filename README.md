# RLS Guard Dog 🐕‍🦺

A comprehensive Row Level Security (RLS) implementation demonstrating secure data access patterns for educational platforms using Supabase, with MongoDB integration and modern UI.

## 🎯 Project Overview

RLS Guard Dog showcases proper implementation of Row Level Security policies where:
- **Students** can only see their own progress and classroom data
- **Teachers** have full access to all student data with dedicated management interface
- **Integration tests** prove security policies are bulletproof

## 🛠️ Tech Stack

- **Database**: Supabase (PostgreSQL with RLS)
- **Secondary DB**: MongoDB (for additional data storage)
- **Frontend**: Next.js 14 with TypeScript
- **Styling**: TailwindCSS
- **Authentication**: Supabase Auth
- **Testing**: Jest + Supabase Test Helpers

## 🚀 Features

### Core Security
- ✅ Row Level Security policies for students/teachers
- ✅ Role-based access control
- ✅ Secure API endpoints with proper authorization
- ✅ Integration tests validating security boundaries

### Student Interface
- View personal progress only
- Access assigned classrooms
- Submit assignments
- Track personal metrics

### Teacher Interface
- View all student data
- Manage classroom assignments
- Update student progress
- Analytics dashboard

## 📁 Project Structure

```
rls-guard-dog/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # Reusable UI components
│   ├── lib/                # Database clients & utilities
│   ├── types/              # TypeScript definitions
│   └── middleware.ts       # Auth middleware
├── supabase/
│   ├── migrations/         # Database schema & RLS policies
│   └── seed.sql           # Test data
├── tests/
│   ├── integration/       # RLS policy tests
│   └── unit/             # Component tests
├── docs/                  # Documentation
└── scripts/              # Setup & deployment scripts
```

## 🔧 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/1234-ad/rls-guard-dog.git
   cd rls-guard-dog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env.local
   # Fill in your Supabase and MongoDB credentials
   ```

4. **Run database migrations**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Run security tests**
   ```bash
   npm run test:security
   ```

## 🔐 Security Implementation

### RLS Policies

**Progress Table**
```sql
-- Students can only see their own progress
CREATE POLICY "Students can view own progress" ON progress
FOR SELECT USING (auth.uid() = user_id);

-- Teachers can see all progress
CREATE POLICY "Teachers can view all progress" ON progress
FOR SELECT USING (auth.jwt() ->> 'role' = 'teacher');
```

**Classroom Table**
```sql
-- Students can only see classrooms they're enrolled in
CREATE POLICY "Students can view enrolled classrooms" ON classrooms
FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM classroom_enrollments 
    WHERE classroom_id = id
  )
);
```

## 🧪 Testing

Run the complete test suite:
```bash
npm run test              # Unit tests
npm run test:integration  # Integration tests
npm run test:security     # RLS policy validation
npm run test:all         # Everything
```

## 📊 Database Schema

### Core Tables
- `users` - User profiles with roles
- `classrooms` - Classroom information
- `progress` - Student progress tracking
- `assignments` - Assignment data
- `classroom_enrollments` - Student-classroom relationships

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all security tests pass
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with security first principles** 🔒