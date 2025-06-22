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

app = Flask(__name__)
CORS(app)

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

if __name__ == '__main__':
    load_treatment_models()
    app.run(debug=True)