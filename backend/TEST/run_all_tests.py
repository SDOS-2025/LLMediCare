import os
import sys
import subprocess
import time

# Add parent directory to path so we can import modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def run_test(test_name):
    """Run a single test file and return success status"""
    print("\n" + "=" * 80)
    print(f"Running {test_name}...")
    print("=" * 80)
    
    result = subprocess.run(['python', test_name], cwd=os.path.dirname(__file__))
    success = result.returncode == 0
    
    if success:
        print(f"\n✅ {test_name} completed successfully.")
    else:
        print(f"\n❌ {test_name} failed with exit code {result.returncode}.")
    
    return success

def run_all_tests(skip_api=False):
    """Run all test files in the TEST directory"""
    print("\n🧪 RUNNING ALL TESTS 🧪\n")
    
    # Prioritize running formatting test first
    priority_tests = ['test_format.py']
    
    # Get all other test files
    other_tests = [f for f in os.listdir(os.path.dirname(__file__)) 
                  if f.startswith('test_') and f.endswith('.py') 
                  and f != 'test_api.py' and f not in priority_tests]
    
    # Add API test at the end if not skipped
    api_tests = ['test_api.py'] if not skip_api else []
    
    # Combined ordered test list
    test_files = priority_tests + other_tests + api_tests
    
    # Track success
    success_count = 0
    
    # Run each test
    for test_file in test_files:
        if run_test(test_file):
            success_count += 1
        
        # Small delay between tests
        time.sleep(1)
    
    # Print summary
    print("\n" + "=" * 80)
    print(f"TEST SUMMARY: {success_count}/{len(test_files)} tests passed")
    print("=" * 80)
    
    return success_count == len(test_files)

if __name__ == "__main__":
    # Get command line arguments
    args = sys.argv[1:]
    
    # Check if we should skip API tests
    skip_api = '--skip-api' in args
    
    if skip_api:
        print("Skipping API tests (--skip-api flag provided)")
    
    # Run all tests
    success = run_all_tests(skip_api)
    
    # Set exit code
    sys.exit(0 if success else 1) 