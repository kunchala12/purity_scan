from flask import Flask, request, jsonify
from flask_cors import CORS
from database import init_db, create_user, get_user, add_scan_entry, get_user_history
from analysis import analyze_food_image
import os
import base64

app = Flask(__name__)
CORS(app)

# Initialize database
init_db()

@app.route('/')
def index():
    return jsonify({
        "message": "PureScan AI Backend is Running",
        "endpoints": {
            "signup": "/api/signup [POST]",
            "login": "/api/login [POST]",
            "scan": "/api/scan [POST]",
            "history": "/api/history/<user_id> [GET]",
            "health": "/api/health [GET]"
        }
    }), 200

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"message": "Username and password required"}), 400
    
    if create_user(username, password):
        return jsonify({"message": "User created successfully"}), 201
    else:
        return jsonify({"message": "Username already exists"}), 409

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = get_user(username)
    if user and user['password'] == password:
        return jsonify({
            "message": "Login successful",
            "user": {"id": user['id'], "username": user['username']}
        }), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "database": "connected"}), 200

@app.route('/api/scan', methods=['POST'])
def scan_food():
    data = request.json
    user_id = data.get('user_id')
    image_b64 = data.get('image') # Base64 string
    food_type = data.get('food_type', 'General')
    
    if not image_b64:
        return jsonify({"message": "Image data required"}), 400
    
    try:
        print(f"DEBUG: Processing scan for user {user_id}, food type {food_type}")
        # Decode base64 image
        if not image_b64:
             return jsonify({"message": "Empty image data received"}), 400
             
        try:
            image_data = image_b64.split(',')[1] if ',' in image_b64 else image_b64
            image_bytes = base64.b64decode(image_data)
        except Exception as e:
            print(f"DEBUG: Base64 decode error: {e}")
            return jsonify({"message": "Invalid image format"}), 400
        
        print("DEBUG: Calling Gemini API...")
        # Analyze using Gemini
        result = analyze_food_image(image_bytes, food_type)
        print("DEBUG: Gemini API call finished.")
        
        # Safety check for result keys
        if result.get('error'):
            print(f"DEBUG: Gemini reported error: {result.get('error')}")
            # If it's a known error from analysis.py, pass it through
            return jsonify(result), 200 # Return 200 but with error field so frontend handles it gracefully
            
        # Ensure all required keys exist before saving to DB
        required_keys = ['food_item', 'adulterated', 'confidence_score', 'purity_percentage', 'report_summary']
        if all(k in result for k in required_keys):
            if user_id:
                try:
                    add_scan_entry(
                        user_id=user_id,
                        food_item=result['food_item'],
                        adulteration_detected="Yes" if result['adulterated'] else "No",
                        confidence_score=result.get('confidence_score', 0),
                        report=result.get('report_summary', ''),
                        purity_percentage=result.get('purity_percentage', 0)
                    )
                except Exception as db_e:
                    print(f"DEBUG: Database error: {db_e}")
                    # Don't fail the whole request if DB logging fails, but maybe log it in the result
        
        return jsonify(result), 200
    except Exception as e:
        print(f"DEBUG: General scan error: {e}")
        return jsonify({"message": f"Scan error: {str(e)}"}), 500

@app.route('/api/history/<int:user_id>', methods=['GET'])
def history(user_id):
    history_data = get_user_history(user_id)
    return jsonify(history_data), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
