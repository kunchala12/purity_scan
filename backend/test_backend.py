from database import init_db, create_user, get_user, add_scan_entry, get_user_history
import os

def test_backend():
    print("--- Starting Backend Tests ---")
    
    # Use the same path logic as database.py
    base_dir = os.path.dirname(__file__)
    db_path = os.path.join(base_dir, 'app.db')
    
    # 1. Init DB
    if os.path.exists(db_path):
        os.remove(db_path)
    init_db()
    print("[PASS] Database initialized.")

    # 2. User Creation
    created = create_user("testuser", "password123")
    assert created == True, "Failed to create user"
    print("[PASS] User creation successful.")

    # 3. Duplicate User Check
    duplicate = create_user("testuser", "password123")
    assert duplicate == False, "Allowed duplicate user"
    print("[PASS] Duplicate user prevention works.")

    # 4. Get User
    user = get_user("testuser")
    assert user is not None, "Failed to fetch user"
    assert user['username'] == "testuser", "Username mismatch"
    print("[PASS] User retrieval works.")

    # 5. History Logging
    add_scan_entry(user['id'], "Turmeric", "No", 95.5, "Likely pure", 98.0)
    history = get_user_history(user['id'])
    assert len(history) == 1, "History entry not found"
    assert history[0]['food_item'] == "Turmeric", "History data mismatch"
    print("[PASS] History logging works.")

    print("--- All Backend Unit Tests Passed! ---")

if __name__ == "__main__":
    test_backend()
