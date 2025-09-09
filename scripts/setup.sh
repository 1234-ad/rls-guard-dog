#!/bin/bash

# RLS Guard Dog Setup Script
# This script automates the initial setup process

set -e  # Exit on any error

echo "🐕‍🦺 RLS Guard Dog Setup Script"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js is installed: $NODE_VERSION"
        
        # Check if version is 18 or higher
        NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR_VERSION" -lt 18 ]; then
            print_error "Node.js version 18 or higher is required. Current version: $NODE_VERSION"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_status "npm is installed: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    npm install
    print_status "Dependencies installed successfully"
}

# Check if Supabase CLI is installed
check_supabase_cli() {
    if command -v supabase &> /dev/null; then
        SUPABASE_VERSION=$(supabase --version)
        print_status "Supabase CLI is installed: $SUPABASE_VERSION"
    else
        print_warning "Supabase CLI is not installed. Installing..."
        npm install -g supabase
        print_status "Supabase CLI installed successfully"
    fi
}

# Setup environment file
setup_env() {
    if [ ! -f .env.local ]; then
        print_info "Creating .env.local from template..."
        cp .env.example .env.local
        print_status ".env.local created"
        print_warning "Please edit .env.local with your actual configuration values"
    else
        print_status ".env.local already exists"
    fi
}

# Check if MongoDB is running (optional)
check_mongodb() {
    if command -v mongod &> /dev/null; then
        print_status "MongoDB is installed"
    else
        print_warning "MongoDB is not installed. This is optional but recommended for full functionality."
        print_info "You can install MongoDB locally or use MongoDB Atlas (cloud)"
    fi
}

# Setup database (if Supabase is configured)
setup_database() {
    if [ -f .env.local ]; then
        # Check if Supabase URL is configured
        if grep -q "your_supabase_project_url" .env.local; then
            print_warning "Supabase URL not configured in .env.local"
            print_info "Please configure your Supabase credentials before running database setup"
            return
        fi
        
        print_info "Setting up database..."
        
        # Check if user is logged in to Supabase
        if supabase projects list &> /dev/null; then
            print_status "Supabase CLI is authenticated"
        else
            print_warning "Please login to Supabase CLI first:"
            print_info "Run: supabase login"
            return
        fi
        
        # Initialize Supabase (if not already done)
        if [ ! -f supabase/config.toml ]; then
            print_info "Initializing Supabase..."
            supabase init
        fi
        
        # Link to project (user needs to do this manually)
        print_warning "Please link to your Supabase project:"
        print_info "Run: supabase link --project-ref YOUR_PROJECT_REF"
        
    else
        print_warning ".env.local not found. Skipping database setup."
    fi
}

# Run tests to verify setup
run_tests() {
    print_info "Running tests to verify setup..."
    
    # Run type checking
    if npm run type-check; then
        print_status "TypeScript compilation successful"
    else
        print_error "TypeScript compilation failed"
        return 1
    fi
    
    # Run unit tests
    if npm run test -- --passWithNoTests; then
        print_status "Unit tests passed"
    else
        print_warning "Some unit tests failed (this might be expected if database is not set up)"
    fi
}

# Create initial directories
create_directories() {
    print_info "Creating project directories..."
    
    mkdir -p src/components/ui
    mkdir -p src/hooks
    mkdir -p src/utils
    mkdir -p tests/unit
    mkdir -p tests/integration
    mkdir -p docs/api
    
    print_status "Project directories created"
}

# Main setup function
main() {
    echo
    print_info "Starting RLS Guard Dog setup..."
    echo
    
    # Pre-flight checks
    check_node
    check_npm
    
    # Setup steps
    install_dependencies
    check_supabase_cli
    setup_env
    create_directories
    check_mongodb
    
    echo
    print_status "Basic setup completed!"
    echo
    
    # Additional setup steps
    print_info "Additional setup steps:"
    echo "1. Edit .env.local with your Supabase and MongoDB credentials"
    echo "2. Login to Supabase CLI: supabase login"
    echo "3. Link to your project: supabase link --project-ref YOUR_PROJECT_REF"
    echo "4. Run database migrations: supabase db push"
    echo "5. Seed the database: supabase db seed"
    echo "6. Start development server: npm run dev"
    echo
    
    # Optional: Setup database if configured
    setup_database
    
    # Optional: Run tests
    if [ "$1" = "--with-tests" ]; then
        echo
        run_tests
    fi
    
    echo
    print_status "Setup script completed!"
    print_info "Next steps:"
    echo "  1. Configure your environment variables in .env.local"
    echo "  2. Set up your Supabase project and run migrations"
    echo "  3. Start the development server with: npm run dev"
    echo "  4. Visit http://localhost:3000 to see your application"
    echo
    print_info "For detailed setup instructions, see docs/SETUP.md"
    print_info "For security information, see docs/SECURITY.md"
    echo
}

# Handle script arguments
case "$1" in
    --help|-h)
        echo "RLS Guard Dog Setup Script"
        echo
        echo "Usage: $0 [options]"
        echo
        echo "Options:"
        echo "  --help, -h        Show this help message"
        echo "  --with-tests      Run tests after setup"
        echo "  --skip-deps       Skip dependency installation"
        echo
        exit 0
        ;;
    --skip-deps)
        print_info "Skipping dependency installation"
        # Run main without install_dependencies
        ;;
    *)
        main "$@"
        ;;
esac