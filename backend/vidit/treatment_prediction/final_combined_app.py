import torch
import torch.nn as nn
import torch.optim as optim
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import numpy as np
import pandas as pd
import tensorflow as tf
import joblib
import os
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io
import numpy as np
from db import database
import google.generativeai as genai
# Add this at the top with other imports
from collections import defaultdict

app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = 'uploads/'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
GEMINI_API_KEY = "AIzaSyAUZnNebSHqmIVfl46QzCIv-i-dartnuv0"

genai.configure(api_key=GEMINI_API_KEY)
medical_model = genai.GenerativeModel("gemini-1.5-pro")

# System prompt to ensure medical accuracy
MEDICAL_PROMPT = """
You are MediBot, an AI assistant specialized in providing factual medical information. 
Your role is strictly limited to healthcare topics. Follow these guidelines:

### Strict Medical Protocol:
1. **Scope Limitation**:
   - Only respond to medically relevant questions (symptoms, conditions, treatments, medications, procedures)
   - If asked non-medical questions, respond: "I specialize only in medical topics. How can I assist with health-related questions?"

2. **Response Format**:
   - Structure answers clearly:
     [Condition/Topic]
     - Key Facts: <2-3 bullet points>
     - Clinical Presentation: <symptoms>
     - Management: <general approaches>
     - When to Seek Care: <red flags>
   - Keep responses under 100 words unless complex topic

3. **Medication Responses**:
   - Generic/Brand names (if applicable)
   - Mechanism: <1 sentence>
   - Standard dosing range
   - Contraindications (major ones only)
   - Black box warnings (if any)

4. **Safety Controls**:
   - Never suggest diagnoses - use: "This may indicate [condition], but requires professional evaluation"
   - For emergencies: "This sounds serious. Please seek immediate medical attention or call [local emergency number]"
   - Always end with: "Consult your healthcare provider for personalized advice"

5. **Knowledge Boundaries**:
   - If uncertain: "Medical guidelines vary on this topic. The current evidence suggests...[brief summary], but consult a specialist"
   - For alternative medicine: "While some use [therapy], clinical evidence is [limited/emerging/contradictory]
   """
def get_medical_response(user_query):
    """Get a safe, medically-reviewed response from Gemini."""
    try:
        response = medical_model.generate_content(
            MEDICAL_PROMPT + user_query,
            safety_settings={
                'HARM_CATEGORY_HARASSMENT': 'BLOCK_MEDIUM_AND_ABOVE',
            }
        )
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"

# Add this after GEMINI_API_KEY setup
conversation_history = defaultdict(list)

@app.route('/ask', methods=['POST'])
def ask_medical_question():
    data = request.json
    user_input = data.get('query', '').strip()
    user_id = data.get('user_id', 'default_user')

    if not user_input:
        return jsonify({"error": "Please enter a question."}), 400

    
    # Proceed with user's own data
    history = conversation_history.get(user_id, [])
    context = "\n".join(history[-3:])
    
    # Fetch user-provided data (if exists

    full_query = f"{context}\nQuestion: {user_input}"
    answer = get_medical_response(full_query)

    # Update history and return response
    conversation_history[user_id] = history[-9:] + [f"User: {user_input}", f"Assistant: {answer}"]
    return jsonify({"response": answer, "conversation_id": user_id})

# Global variables for models
treatment_models = {
    'rf_model': None,
    'gb_model': None,
    'feature_names': None,
    'is_trained': False
}

# Define the DQN Model
class DQN(nn.Module):
    def __init__(self, input_dim, output_dim):
        super(DQN, self).__init__()
        self.fc1 = nn.Linear(input_dim, 128)
        self.bn1 = nn.BatchNorm1d(128)
        self.fc2 = nn.Linear(128, 64)
        self.bn2 = nn.BatchNorm1d(64)
        self.fc3 = nn.Linear(64, output_dim)

    def forward(self, x):
        x = torch.relu(self.bn1(self.fc1(x)))
        x = torch.relu(self.bn2(self.fc2(x)))
        x = self.fc3(x)
        return x

# Load the trained model
dqn_model = DQN(input_dim=6, output_dim=4)
dqn_model.load_state_dict(torch.load("DQN_model.pth"))
dqn_model.eval()

# Define the treatment options
treatment_options = ["No Treatment", "Chemotherapy", "Targeted Therapy", "Bone Marrow Transplant"]

# Load ethical violation model and scaler
ethical_model_path = "D:/unisys/2025-Ethical-System/backend/vidit/treatment_prediction/models/ethical_violation_classifier.h5"
ethical_scaler_path = "D:/unisys/2025-Ethical-System/backend/vidit/treatment_prediction/models/scaler.pkl"
def load_ethical_model():
    try:
        ethical_model = tf.keras.models.load_model('D:/unisys/2025-Ethical-System/backend/vidit/treatment_prediction/models/ethical_violation_classifier.h5')
        ethical_scaler = joblib.load('D:/unisys/2025-Ethical-System/backend/vidit/treatment_prediction/models/scaler.pkl')
        print("Ethical violation model loaded successfully")
        return ethical_model, ethical_scaler
    except Exception as e:
        print(f"Error loading ethical model: {str(e)}")
        return None, None

ethical_model, ethical_scaler = load_ethical_model()

# Model loading functions
def load_treatment_models():
    try:
        treatment_models['rf_model'] = joblib.load('models/rf_model.joblib')
        treatment_models['gb_model'] = joblib.load('models/gb_model.joblib')
        treatment_models['feature_names'] = joblib.load('models/feature_names.pkl')
        treatment_models['is_trained'] = True
        return True
    except Exception as e:
        print(f"Error loading models: {str(e)}")
        return False

# API Endpoints
@app.route('/predict', methods=['POST'])
def predict_ethical():
    try:
        data = request.get_json()
        df = pd.DataFrame([data])
        df = pd.get_dummies(df, columns=["treatment_type", "leukemia_stage", "prior_treatment_history"])
        
        expected_columns = [
            "dosage", "patient_age", "patient_consent", "financial_burden", 
            "compliance_with_guidelines", "overtreatment_risk",
            "treatment_type_chemotherapy", "treatment_type_immunotherapy", "treatment_type_targeted",
            "leukemia_stage_early", "leukemia_stage_intermediate", "leukemia_stage_advanced",
            "prior_treatment_history_none", "prior_treatment_history_partial", "prior_treatment_history_extensive"
        ]
        
        for col in expected_columns:
            if col not in df.columns:
                df[col] = 0
        
        input_data = ethical_scaler.transform(df[expected_columns])
        prediction = ethical_model.predict(input_data)[0][0]
        return jsonify({
            "ethical_violation": "Non-Ethical" if prediction > 0.5 else "Ethical",
            "confidence": float(prediction)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/effectiveness', methods=['POST'])
def effectiveness_analysis():
    try:
        if not treatment_models['is_trained']:
            return jsonify({"error": "Models not loaded"}), 500
            
        data = request.get_json()
        sample = pd.DataFrame(0, index=[0], columns=treatment_models['feature_names'])
        
        for feature, value in data.items():
            if feature in sample.columns:
                sample.loc[0, feature] = float(value)
        
        rf_prob = treatment_models['rf_model'].predict_proba(sample)[0, 1]
        gb_prob = treatment_models['gb_model'].predict_proba(sample)[0, 1]
        avg_prob = (rf_prob + gb_prob) / 2
        
        return jsonify({
            "rf_probability": float(rf_prob),
            "gb_probability": float(gb_prob),
            "avg_probability": float(avg_prob),
            "likely_effective": bool(avg_prob > 0.5)  # Explicitly convert to bool
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/dqn_predict', methods=['POST'])
def dqn_predict():
    try:
        data = request.get_json()
        input_values = [
            float(data.get("WBC_Count")),
            float(data.get("ANC")),
            float(data.get("Platelet_Count")),
            float(data.get("Hemoglobin")),
            float(data.get("Disease_Stage")),
            float(data.get("Survival_Probability"))
        ]

        input_tensor = torch.FloatTensor(input_values).unsqueeze(0)
        with torch.no_grad():
            action = torch.argmax(dqn_model(input_tensor)).item()
            recommended_treatment = treatment_options[action]

        stage = input_values[4]
        if stage == 4:
            condition = "Advanced Leukemia"
            correct_treatment = "Bone Marrow Transplant"
        elif stage == 3:
            condition = "Severe"
            correct_treatment = "Chemotherapy"
        elif stage == 2:
            condition = "Moderate"
            correct_treatment = "Targeted Therapy"
        else:
            condition = "Mild"
            correct_treatment = "No Treatment"

        reward = 10 if recommended_treatment == correct_treatment else -5

        return jsonify({
            "Condition": condition,
            "Recommended_Treatment": recommended_treatment,
            "Correct_Treatment": correct_treatment,
            "Reward_Score": reward
        })
    except Exception as e:
        return jsonify({"error": str(e)})

# Image classification constants
IMAGE_MODEL_PATH = "D:\\luekemia_models\\saved_models\\resnet50_leukemia_model.pth"
IMG_SIZE = 224
CLASS_LABELS = [
    'Benign',
    '[Malignant] early Pre-B',
    '[Malignant] Pre-B',
    '[Malignant] Pro-B'
]

# Initialize image classification model
def initialize_image_model(num_classes):
    try:
        model = models.resnet50(weights=None)
    except:
        model = models.resnet50(pretrained=False)
    
    num_features = model.fc.in_features
    model.fc = nn.Linear(num_features, num_classes)
    return model

# Load image model
def load_image_model():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = initialize_image_model(len(CLASS_LABELS))
    checkpoint = torch.load(IMAGE_MODEL_PATH, map_location=device)
    
    if isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
        model.load_state_dict(checkpoint['model_state_dict'])
    else:
        model.load_state_dict(checkpoint)
    
    model.to(device)
    model.eval()
    return model

# Image preprocessing
def preprocess_image(image):
    transform = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    return transform(image).unsqueeze(0)

# Image prediction
def image_predict(image, model):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    image = image.to(device)
    
    with torch.no_grad():
        outputs = model(image)
        _, preds = torch.max(outputs, 1)
        probs = torch.nn.functional.softmax(outputs, dim=1)
    
    predicted_class = CLASS_LABELS[preds.item()]
    probabilities = probs[0].cpu().numpy()
    class_probabilities = {CLASS_LABELS[i]: float(probabilities[i]) for i in range(len(CLASS_LABELS))}
    return predicted_class, class_probabilities

# Load image model at startup
image_model = load_image_model()
print("Image classification model loaded successfully!")

# Image classification endpoint
@app.route('/image_predict', methods=['POST'])
def image_predict_api():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})
    
    try:
        img_bytes = file.read()
        img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
        processed_img = preprocess_image(img)
        predicted_class, class_probabilities = image_predict(processed_img, image_model)
        sorted_probs = sorted(class_probabilities.items(), key=lambda x: x[1], reverse=True)
        
        return jsonify({
            'prediction': predicted_class,
            'probabilities': class_probabilities,
            'sorted_probabilities': sorted_probs
        })
    except Exception as e:
        return jsonify({'error': str(e)})

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
    print(f"[INFO] Received data in submit-form endpoint: {data}")
    
    # Determine the type of data being submitted based on keys
    data_type = "Unknown"
    if 'ethical_violation' in str(data):
        data_type = "Ethical Analysis"
    elif 'likely_effective' in str(data) or 'avg_probability' in str(data):
        data_type = "Effectiveness Analysis"
    elif 'Recommended_Treatment' in str(data):
        data_type = "DQN Treatment Prediction"
    elif 'prediction' in str(data) and 'probabilities' in str(data):
        data_type = "Image Analysis"
    
    print(f"[INFO] Data type identified: {data_type}")
    
    # Encrypt and save to Firebase
    try:
        from db import encrypt_data
        encrypted_data = encrypt_data(data)
        ref = database.reference('form_data')
        new_ref = ref.push(encrypted_data)
        print(f"[SUCCESS] Data successfully saved to Firebase with ID: {new_ref.key}")
        return jsonify({"msg": "Form data saved", "id": new_ref.key})
    except Exception as e:
        print(f"[ERROR] Failed to save data to Firebase: {str(e)}")
        return jsonify({"error": str(e)}), 500

#Endpoint to fetch form data
@app.route('/get-form', methods=['GET'])
def get_form():
    from db import decrypt_data
    ref = database.reference('form_data')
    encrypted_data = ref.get()
    if encrypted_data:
        decrypted_data = {k: decrypt_data(v) for k, v in encrypted_data.items()}
        return jsonify({
            'encrypted': encrypted_data,
            'decrypted': decrypted_data
        })
    return jsonify({})

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
    try:
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400
            
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "Invalid or empty JSON data"}), 400
            
        required_fields = ['id', 'patientName', 'date', 'time', 'type']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400
            
        ref = database.reference('appointments')
        new_ref = ref.push(data)
        return jsonify({"msg": "Appointment saved", "id": new_ref.key})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Fetch appointment details
@app.route('/get-appointments', methods=['GET'])
def get_appointments():
    ref = database.reference('appointments')
    data = ref.get()
    
    # Convert Firebase object to array if data exists
    if data:
        appointments_list = [{"id": key, **value} for key, value in data.items()]
        return jsonify(appointments_list)
    return jsonify([])  # Return empty array if no data

if __name__ == '__main__':
    load_treatment_models()
    app.run(debug=True)