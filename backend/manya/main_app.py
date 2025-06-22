import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify, render_template
from pyngrok import ngrok

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
model = DQN(input_dim=6, output_dim=4)
model.load_state_dict(torch.load("DQN_model.pth"))
model.eval()

# Define the treatment options
treatment_options = ["No Treatment", "Chemotherapy", "Targeted Therapy", "Bone Marrow Transplant"]

# Define Flask App
app = Flask(__name__, template_folder="templates")


@app.route('/')
def home():
    return render_template("index.html")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get input data from form
        data = request.form
        input_values = [
            float(data.get("WBC_Count")),
            float(data.get("ANC")),
            float(data.get("Platelet_Count")),
            float(data.get("Hemoglobin")),
            float(data.get("Disease_Stage")),
            float(data.get("Survival_Probability"))
        ]

        # Convert to tensor
        input_tensor = torch.FloatTensor(input_values).unsqueeze(0)

        # Get model prediction
        with torch.no_grad():
            action = torch.argmax(model(input_tensor)).item()
            recommended_treatment = treatment_options[action]

        # Define condition classification
        stage = input_values[4]  # Disease Stage
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

        # Calculate reward
        reward = 10 if recommended_treatment == correct_treatment else -5

        return jsonify({
            "Condition": condition,
            "Recommended_Treatment": recommended_treatment,
            "Correct_Treatment": correct_treatment,
            "Reward_Score": reward
        })
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    # Authenticate ngrok
    ngrok.set_auth_token("2v8P3AiNDuKRi84kKEQeRuJc3lx_78dZ2DiRYBmnD8EPDS7us")

    # Start ngrok tunnel
    public_url = ngrok.connect(5000)
    print(f"Public URL: {public_url}")

    app.run(port=5000)