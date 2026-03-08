import os
import sys

def verify():
    print("--- PureScan AI Environment Diagnostic ---")
    
    # Check Python version
    print(f"Python Version: {sys.version}")
    
    # Check for .env
    if os.path.exists('.env'):
        print("[PASS] .env file found.")
        with open('.env', 'r') as f:
            content = f.read()
            if "your_gemini_api_key_here" in content:
                print("[WARN] Gemini API Key is still the placeholder!")
            elif "GEMINI_API_KEY=" in content:
                print("[PASS] Gemini API Key seems to be set.")
    else:
        print("[FAIL] .env file missing in backend folder.")

    # Check for app.db
    if os.path.exists('app.db'):
        print("[PASS] Database (app.db) found.")
    else:
        print("[INFO] Database not found; it will be created on first run.")

    # Check libraries
    try:
        import flask
        import flask_cors
        import google.generativeai
        import dotenv
        print("[PASS] All required Python libraries are installed.")
    except ImportError as e:
        print(f"[FAIL] Missing library: {e}")
        print("Please run: pip install flask flask-cors google-generativeai python-dotenv")

    print("------------------------------------------")

if __name__ == "__main__":
    verify()
