import os
from flask import Flask, request, jsonify, render_template, send_from_directory
import mysql.connector
from werkzeug.utils import secure_filename

# Mapping Flask to your custom 'files' directory
app = Flask(__name__, 
            template_folder='../files', 
            static_folder='../files',
            static_url_path='')

# Image upload folder inside backend
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# DB Connection - Change 'password' to your actual MySQL password
def get_db_connection():
    return mysql.connector.connect(
        MYSQL_HOST=databs
        MYSQL_USER=root
        MYSQL_PASSWORD=password
        MYSQL_DATABASE=goal_list
    )

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/goals', methods=['GET'])
def get_goals():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT *, (target_amount - current_progress) AS remaining FROM goals")
    goals = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(goals)

@app.route('/api/goals', methods=['POST'])
def add_goal():
    title = request.form.get('title')
    category = request.form.get('category')
    target = request.form.get('target')
    file = request.files.get('image')
    
    image_path = ""
    if file:
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        image_path = f"/uploads/{filename}"
    
    conn = get_db_connection()
    cursor = conn.cursor()
    sql = "INSERT INTO goals (title, category, target_amount, image_url) VALUES (%s, %s, %s, %s)"
    cursor.execute(sql, (title, category, target, image_path))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"status": "success"})

@app.route('/api/goals/<int:goal_id>/progress', methods=['POST'])
def update_progress(goal_id):
    amount = request.json.get('amount')
    conn = get_db_connection()
    cursor = conn.cursor()
    sql = "UPDATE goals SET current_progress = current_progress + %s WHERE id = %s"
    cursor.execute(sql, (amount, goal_id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"status": "updated"})

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    # Default Flask Port: 5000
    app.run(debug=True, port=5000)
