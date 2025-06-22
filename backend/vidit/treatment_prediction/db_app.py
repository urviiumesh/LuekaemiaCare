from flask import Flask, request, jsonify
from db import database
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads/'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Root route
@app.route('/')
def index():
    return jsonify({
        "message": "API is running",
        "available_endpoints": [
            "/submit-form",
            "/get-form",
            "/upload-video",
            "/get-videos",
            "/submit-appointment",
            "/get-appointments"
        ]
    })

# Endpoint to take in form data
@app.route('/submit-form', methods=['POST'])
def submit_form():
    data = request.json
    ref = database.reference('form_data')
    new_ref = ref.push(data)
    return jsonify({"msg": "Form data saved", "id": new_ref.key})

#Endpoint to fetch form data
@app.route('/get-form', methods=['GET'])
def get_form():
    ref = database.reference('form_data')
    data = ref.get()
    return jsonify(data or {})

# Upload video
@app.route('/upload-video', methods=['POST'])
def upload_video():
    if 'video' not in request.files:
        return jsonify({"error": "No video provided"}), 400

    video = request.files['video']
    filename = secure_filename(video.filename)
    path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    video.save(path)

    # Save file path reference to Firebase
    ref = database.reference('videos')
    ref.push({"filename": filename, "filepath": path})

    return jsonify({"msg": "Video uploaded", "path": path})

# Fetch stored video info
@app.route('/get-videos', methods=['GET'])
def get_videos():
    ref = database.reference('videos')
    videos = ref.get()
    return jsonify(videos or {})

# Store appointment details
@app.route('/submit-appointment', methods=['POST'])
def submit_appointment():
    data = request.json
    ref = database.reference('appointments')
    new_ref = ref.push(data)
    return jsonify({"msg": "Appointment saved", "id": new_ref.key})

# Fetch appointment details
@app.route('/get-appointments', methods=['GET'])
def get_appointments():
    ref = database.reference('appointments')
    data = ref.get()
    return jsonify(data if data else {})  # Safeguard against None


if __name__ == '__main__':
    app.run(debug=True)
