import os
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io
import numpy as np
from flask import Flask, request, render_template, jsonify

app = Flask(__name__)

# Define constants
MODEL_PATH = "D:\\luekemia_models\\saved_models\\resnet50_leukemia_model.pth"
IMG_SIZE = 224

# Define the class labels
class_labels = [
    'Benign',
    '[Malignant] early Pre-B',
    '[Malignant] Pre-B',
    '[Malignant] Pro-B'
]

# Set device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Initialize ResNet-50 model
def initialize_model(num_classes):
    try:
        # For PyTorch 1.13+
        model = models.resnet50(weights=None)
    except:
        # For older PyTorch versions
        model = models.resnet50(pretrained=False)
    
    # Replace the final fully connected layer
    num_features = model.fc.in_features
    model.fc = nn.Linear(num_features, num_classes)
    
    return model

# Load the trained model
def load_model():
    model = initialize_model(len(class_labels))
    
    # Load the saved model state
    checkpoint = torch.load(MODEL_PATH, map_location=device)
    
    # Handle different saved formats
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
    
    image = transform(image).unsqueeze(0)
    return image

# Make prediction
def predict(image, model):
    image = image.to(device)
    
    with torch.no_grad():
        outputs = model(image)
        _, preds = torch.max(outputs, 1)
        probs = torch.nn.functional.softmax(outputs, dim=1)
        
    predicted_class = class_labels[preds.item()]
    probabilities = probs[0].cpu().numpy()
    
    # Create a dictionary of class probabilities
    class_probabilities = {class_labels[i]: float(probabilities[i]) for i in range(len(class_labels))}
    
    return predicted_class, class_probabilities

# Load model at startup
model = load_model()
print("Model loaded successfully!")

@app.route('/')
def home():
    return render_template('main.html')

@app.route('/predict', methods=['POST'])
def predict_api():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})
    
    try:
        # Read and preprocess the image
        img_bytes = file.read()
        img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
        processed_img = preprocess_image(img)
        
        # Make prediction
        predicted_class, class_probabilities = predict(processed_img, model)
        
        # Sort probabilities for display
        sorted_probs = sorted(class_probabilities.items(), key=lambda x: x[1], reverse=True)
        
        return jsonify({
            'prediction': predicted_class,
            'probabilities': class_probabilities,
            'sorted_probabilities': sorted_probs
        })
    
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    # Create templates directory if it doesn't exist
    os.makedirs('templates', exist_ok=True)
    app.run(debug=True, host='0.0.0.0', port=5000)