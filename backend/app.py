# ... (imports remain the same)

@app.route("/api/goals", methods=["POST"])
def add_goal():
    title = request.form.get("title")
    category = request.form.get("category")
    target = request.form.get("target") if category == "Financial" else 0
    description = request.form.get("target") if category == "Personal" else "" # Reusing the target field as description

    file = request.files.get("image")
    image_path = ""

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        unique_name = f"{uuid.uuid4()}_{filename}"
        file.save(os.path.join(UPLOAD_FOLDER, unique_name))
        image_path = f"/uploads/{unique_name}"

    conn = get_db_connection()
    cursor = conn.cursor()
    # Updated query to include description
    query = "INSERT INTO goals (title, category, target_amount, description, image_url) VALUES (%s, %s, %s, %s, %s)"
    cursor.execute(query, (title, category, target, description, image_path))
    conn.commit()
    return jsonify({"status": "success"}), 201

@app.route("/api/goals/<int:goal_id>", methods=["PUT"])
def edit_goal(goal_id):
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "UPDATE goals SET title = %s, category = %s WHERE id = %s"
    cursor.execute(query, (data['title'], data['category'], goal_id))
    conn.commit()
    return jsonify({"status": "updated"})

@app.route("/api/goals/<int:goal_id>", methods=["DELETE"])
def delete_goal(goal_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    # Strategy: You might want to delete the physical file here too using os.remove()
    cursor.execute("DELETE FROM goals WHERE id = %s", (goal_id,))
    conn.commit()
    return jsonify({"status": "deleted"})

# ... (other routes remain same)
