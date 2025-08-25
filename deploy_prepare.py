#!/usr/bin/env python3
"""
QScope Deployment Preparation Script
Automates deployment preparation and validation
"""

import os
import sys
import json
import subprocess
import requests
from pathlib import Path

class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_step(step, message):
    print(f"{Colors.BLUE}{Colors.BOLD}[{step}]{Colors.END} {message}")

def print_success(message):
    print(f"{Colors.GREEN}✓{Colors.END} {message}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠{Colors.END} {message}")

def print_error(message):
    print(f"{Colors.RED}✗{Colors.END} {message}")

def run_command(command, capture_output=True):
    """Run a shell command and return the result"""
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            capture_output=capture_output, 
            text=True, 
            timeout=120
        )
        return result.returncode == 0, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return False, "", "Command timed out"

def check_dependencies():
    """Check if required dependencies are installed"""
    print_step("1", "Checking dependencies...")
    
    dependencies = {
        'node': 'node --version',
        'npm': 'npm --version',
        'python': 'python --version',
        'git': 'git --version'
    }
    
    missing = []
    for dep, cmd in dependencies.items():
        success, output, _ = run_command(cmd)
        if success:
            version = output.strip()
            print_success(f"{dep}: {version}")
        else:
            print_error(f"{dep}: Not found")
            missing.append(dep)
    
    if missing:
        print_error(f"Missing dependencies: {', '.join(missing)}")
        return False
    
    return True

def validate_project_structure():
    """Validate project structure"""
    print_step("2", "Validating project structure...")
    
    required_files = [
        'package.json',
        'vite.config.ts',
        'netlify.toml',
        'render.yaml',
        '.env.production',
        'qscope-backend/requirements.txt',
        'qscope-backend/app.py',
        'qscope-backend/gunicorn.conf.py',
        'qscope-backend/.env.production'
    ]
    
    missing_files = []
    for file_path in required_files:
        if not Path(file_path).exists():
            missing_files.append(file_path)
            print_error(f"Missing: {file_path}")
        else:
            print_success(f"Found: {file_path}")
    
    if missing_files:
        print_error(f"Missing {len(missing_files)} required files")
        return False
    
    return True

def test_frontend_build():
    """Test frontend build process"""
    print_step("3", "Testing frontend build...")
    
    # Install dependencies
    print("Installing frontend dependencies...")
    success, output, error = run_command("npm install")
    if not success:
        print_error(f"npm install failed: {error}")
        return False
    
    # Build for production
    print("Building for production...")
    success, output, error = run_command("npm run build")
    if not success:
        print_error(f"Build failed: {error}")
        return False
    
    # Check if dist folder was created
    if Path("dist").exists():
        print_success("Frontend build successful")
        
        # Get build size info
        try:
            dist_size = sum(f.stat().st_size for f in Path("dist").rglob('*') if f.is_file())
            print_success(f"Build size: {dist_size / 1024 / 1024:.2f} MB")
        except:
            pass
        
        return True
    else:
        print_error("Build completed but dist folder not found")
        return False

def test_backend_dependencies():
    """Test backend dependencies"""
    print_step("4", "Testing backend dependencies...")
    
    os.chdir("qscope-backend")
    
    # Check if virtual environment should be created
    if not Path("venv").exists() and not os.environ.get('VIRTUAL_ENV'):
        print_warning("No virtual environment detected. Installing globally...")
    
    # Install dependencies
    success, output, error = run_command("pip install -r requirements.txt")
    if not success:
        print_error(f"Backend dependencies installation failed: {error}")
        os.chdir("..")
        return False
    
    # Test import of main modules
    test_imports = [
        "flask",
        "flask_cors", 
        "qiskit",
        "numpy",
        "gunicorn"
    ]
    
    for module in test_imports:
        success, _, error = run_command(f"python -c \"import {module}\"")
        if success:
            print_success(f"Module {module}: OK")
        else:
            print_error(f"Module {module}: Failed to import")
    
    os.chdir("..")
    return True

def validate_environment_files():
    """Validate environment configuration files"""
    print_step("5", "Validating environment files...")
    
    # Check frontend .env.production
    env_file = Path(".env.production")
    if env_file.exists():
        content = env_file.read_text()
        if "your-qscope-backend" in content:
            print_warning("Frontend .env.production contains placeholder URLs")
            print("  → Update VITE_BACKEND_URL with your actual Render URL")
        else:
            print_success("Frontend environment file looks good")
    
    # Check backend .env.production
    backend_env = Path("qscope-backend/.env.production")
    if backend_env.exists():
        content = backend_env.read_text()
        if "your-netlify-app" in content:
            print_warning("Backend .env.production contains placeholder URLs")
            print("  → Update CORS_ORIGINS with your actual Netlify URL")
        else:
            print_success("Backend environment file looks good")
    
    return True

def generate_deployment_checklist():
    """Generate a deployment checklist"""
    print_step("6", "Generating deployment checklist...")
    
    checklist = """
# QScope Deployment Checklist

## Pre-deployment
- [ ] Code committed and pushed to GitHub
- [ ] All placeholder URLs updated in environment files
- [ ] Frontend builds successfully locally
- [ ] Backend dependencies install without errors

## Render Deployment (Backend)
- [ ] Create new Web Service on Render
- [ ] Connect GitHub repository
- [ ] Set Root Directory to 'qscope-backend'
- [ ] Configure environment variables:
  - [ ] FLASK_ENV=production
  - [ ] DEBUG=False
  - [ ] SECRET_KEY=(generate secure key)
  - [ ] CORS_ORIGINS=(will update after Netlify)
  - [ ] MAX_QUBITS=8
  - [ ] MAX_GATES_PER_CIRCUIT=50
  - [ ] SIMULATION_TIMEOUT=15
- [ ] Deploy and verify health endpoint

## Netlify Deployment (Frontend)
- [ ] Create new site on Netlify
- [ ] Connect GitHub repository
- [ ] Set build command: npm run build
- [ ] Set publish directory: dist
- [ ] Configure environment variables:
  - [ ] VITE_BACKEND_URL=(your Render URL)
- [ ] Deploy and verify site loads

## Post-deployment
- [ ] Update CORS_ORIGINS in Render with Netlify URL
- [ ] Test educational content loading
- [ ] Test quantum circuit simulation
- [ ] Verify matrix display functionality
- [ ] Test all major features

## Optional
- [ ] Set up custom domain on Netlify
- [ ] Update CORS_ORIGINS with custom domain
- [ ] Configure monitoring and alerts
"""
    
    Path("DEPLOYMENT_CHECKLIST.md").write_text(checklist)
    print_success("Deployment checklist created: DEPLOYMENT_CHECKLIST.md")

def main():
    """Main deployment preparation function"""
    print(f"{Colors.BOLD}QScope Deployment Preparation{Colors.END}")
    print("=" * 50)
    
    # Run validation steps
    steps = [
        check_dependencies,
        validate_project_structure,
        test_frontend_build,
        test_backend_dependencies,
        validate_environment_files,
        generate_deployment_checklist
    ]
    
    failed_steps = []
    
    for step_func in steps:
        try:
            if not step_func():
                failed_steps.append(step_func.__name__)
        except Exception as e:
            print_error(f"Error in {step_func.__name__}: {e}")
            failed_steps.append(step_func.__name__)
        print()  # Add spacing
    
    # Summary
    print("=" * 50)
    if failed_steps:
        print_error(f"Deployment preparation completed with {len(failed_steps)} issues:")
        for step in failed_steps:
            print(f"  - {step}")
        print()
        print("Please resolve these issues before deploying.")
        return 1
    else:
        print_success("🎉 Deployment preparation completed successfully!")
        print()
        print("Next steps:")
        print("1. Push your code to GitHub")
        print("2. Deploy backend to Render following DEPLOYMENT_GUIDE.md")
        print("3. Deploy frontend to Netlify")
        print("4. Update environment variables with actual URLs")
        print("5. Test your live application!")
        return 0

if __name__ == "__main__":
    sys.exit(main())