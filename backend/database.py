import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'app.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
    ''')
    
    # Create history table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS scan_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        food_item TEXT NOT NULL,
        adulteration_detected TEXT,
        confidence_score REAL,
        report TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        purity_percentage REAL,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    conn.commit()
    conn.close()

def create_user(username, password):
    conn = get_db_connection()
    try:
        conn.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, password))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

def get_user(username):
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
    conn.close()
    return user

def add_scan_entry(user_id, food_item, adulteration_detected, confidence_score, report, purity_percentage):
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO scan_history (user_id, food_item, adulteration_detected, confidence_score, report, purity_percentage)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (user_id, food_item, adulteration_detected, confidence_score, report, purity_percentage))
    conn.commit()
    conn.close()

def get_user_history(user_id):
    conn = get_db_connection()
    history = conn.execute('SELECT * FROM scan_history WHERE user_id = ? ORDER BY timestamp DESC', (user_id,)).fetchall()
    conn.close()
    return [dict(row) for row in history]

if __name__ == '__main__':
    init_db()
    print("Database initialized.")
