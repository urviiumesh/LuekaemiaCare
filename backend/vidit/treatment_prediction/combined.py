from flask_cors import CORS
from flask import Flask, request, jsonify, send_file, render_template_string
import numpy as np
import pandas as pd
import tensorflow as tf
import joblib
import os
import base64
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import io

app = Flask(__name__)
CORS(app)
# Create models directory if it doesn't exist
os.makedirs('models', exist_ok=True)

# Global variables to store treatment effectiveness models
treatment_models = {
    'rf_model': None,
    'gb_model': None,
    'feature_names': None,
    'is_trained': False
}

# Load ethical violation model and scaler
ethical_model_path = "D:/unisys/2025-Ethical-System/backend/vidit/treatment_prediction/models/ethical_violation_classifier.h5"
ethical_scaler_path = "D:/unisys/2025-Ethical-System/backend/vidit/treatment_prediction/models/scaler.pkl"

# Define categorical feature mappings for ethical model (same as training)
categorical_cols = ["treatment_type", "leukemia_stage", "prior_treatment_history"]
expected_columns = [
    "dosage", "patient_age", "patient_consent", "financial_burden", 
    "compliance_with_guidelines", "overtreatment_risk",
    "treatment_type_chemotherapy", "treatment_type_immunotherapy", "treatment_type_targeted",
    "leukemia_stage_early", "leukemia_stage_intermediate", "leukemia_stage_advanced",
    "prior_treatment_history_none", "prior_treatment_history_partial", "prior_treatment_history_extensive"
]

# Load treatment effectiveness models
def load_treatment_models():
    try:
        # Check if model files exist
        rf_model_path = 'D:/unisys/2025-Ethical-System/backend/vidit/treatment_prediction/models/rf_model.joblib'
        gb_model_path = 'D:/unisys/2025-Ethical-System/backend/vidit/treatment_prediction/models/gb_model.joblib'
        feature_names_path = 'D:/unisys/2025-Ethical-System/backend/vidit/treatment_prediction/models/feature_names.pkl'
        
        if os.path.exists(rf_model_path) and os.path.exists(gb_model_path):
            # Load Random Forest model
            treatment_models['rf_model'] = joblib.load(rf_model_path)
            
            # Load Gradient Boosting model
            treatment_models['gb_model'] = joblib.load(gb_model_path)
            
            # Load feature names if available
            if os.path.exists(feature_names_path):
                with open(feature_names_path, 'rb') as f:
                    import pickle
                    treatment_models['feature_names'] = pickle.load(f)
            
            treatment_models['is_trained'] = True
            print("Treatment effectiveness models loaded successfully")
            return True
    except Exception as e:
        print(f"Error loading treatment models: {str(e)}")
    
    return False

# Load ethical violation model
def load_ethical_model():
    try:
        # Load the model and scaler
        ethical_model = tf.keras.models.load_model(ethical_model_path)
        ethical_scaler = joblib.load(ethical_scaler_path)
        print("Ethical violation model loaded successfully")
        return ethical_model, ethical_scaler
    except Exception as e:
        print(f"Error loading ethical model: {str(e)}")
        return None, None

# Try to load models at startup
treatment_models_loaded = load_treatment_models()
ethical_model, ethical_scaler = load_ethical_model()

# HTML template for the frontend
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leukemia Treatment Analysis System</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h1, h2, h3 {
            color: #333;
        }
        h1 {
            text-align: center;
            margin-bottom: 30px;
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        .tabs {
            display: flex;
            margin-bottom: 20px;
            border-bottom: 1px solid #ddd;
        }
        .tab {
            padding: 10px 20px;
            cursor: pointer;
            background-color: #f1f1f1;
            margin-right: 5px;
            border-radius: 5px 5px 0 0;
        }
        .tab.active {
            background-color: #3498db;
            color: white;
        }
        .tab-content {
            display: none;
            padding: 20px;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 5px 5px;
        }
        .tab-content.active {
            display: block;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input, select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
        }
        button {
            background-color: #3498db;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background-color: #2980b9;
        }
        .result-container {
            margin-top: 20px;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 5px;
            border-left: 4px solid #3498db;
        }
        .ethical {
            color: #27ae60;
            font-weight: bold;
        }
        .non-ethical {
            color: #e74c3c;
            font-weight: bold;
        }
        .effective {
            color: #27ae60;
            font-weight: bold;
        }
        .ineffective {
            color: #e74c3c;
            font-weight: bold;
        }
        .hidden {
            display: none;
        }
        .row {
            display: flex;
            flex-wrap: wrap;
            margin: 0 -10px;
        }
        .col {
            flex: 1;
            padding: 0 10px;
            min-width: 300px;
        }
        .loading {
            text-align: center;
            display: none;
        }
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 2s linear infinite;
            margin: 0 auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Leukemia Treatment Analysis System</h1>
        
        <div class="tabs">
            <div class="tab active" onclick="openTab(event, 'combined-tab')">Combined Analysis</div>
            <div class="tab" onclick="openTab(event, 'ethical-tab')">Ethical Analysis</div>
            <div class="tab" onclick="openTab(event, 'effectiveness-tab')">Effectiveness Analysis</div>
        </div>
        
        <!-- Combined Analysis Tab -->
        <div id="combined-tab" class="tab-content active">
            <h2>Combined Treatment Analysis</h2>
            <p>Enter patient information to analyze both treatment effectiveness and ethical considerations.</p>
            
            <div class="row">
                <div class="col">
                    <h3>Patient Information</h3>
                    <div class="form-group">
                        <label for="combined-patient-age">Patient Age:</label>
                        <input type="number" id="combined-patient-age" min="0" max="120">
                    </div>
                    
                    <h3>Treatment Details</h3>
                    <div class="form-group">
                        <label for="combined-treatment-type">Treatment Type:</label>
                        <select id="combined-treatment-type">
                            <option value="chemotherapy">Chemotherapy</option>
                            <option value="immunotherapy">Immunotherapy</option>
                            <option value="targeted">Targeted Therapy</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="combined-dosage">Dosage (mg):</label>
                        <input type="number" id="combined-dosage" min="0">
                    </div>
                    
                    <div class="form-group">
                        <label for="combined-leukemia-stage">Leukemia Stage:</label>
                        <select id="combined-leukemia-stage">
                            <option value="early">Early</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="combined-prior-treatment">Prior Treatment History:</label>
                        <select id="combined-prior-treatment">
                            <option value="none">None</option>
                            <option value="partial">Partial</option>
                            <option value="extensive">Extensive</option>
                        </select>
                    </div>
                </div>
                
                <div class="col">
                    <h3>Blood Counts</h3>
                    <div class="form-group">
                        <label for="combined-anc-mean">ANC Mean:</label>
                        <input type="number" id="combined-anc-mean" step="0.01">
                    </div>
                    
                    <div class="form-group">
                        <label for="combined-plt-mean">PLT Mean:</label>
                        <input type="number" id="combined-plt-mean">
                    </div>
                    
                    <div class="form-group">
                        <label for="combined-anc-stability">ANC Stability (%):</label>
                        <input type="number" id="combined-anc-stability" min="0" max="100">
                    </div>
                    
                    <div class="form-group">
                        <label for="combined-plt-stability">PLT Stability (%):</label>
                        <input type="number" id="combined-plt-stability" min="0" max="100">
                    </div>
                    
                    <h3>Ethical Considerations</h3>
                    <div class="form-group">
                        <label for="combined-patient-consent">Patient Consent:</label>
                        <select id="combined-patient-consent">
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="combined-financial-burden">Financial Burden (0-1):</label>
                        <input type="number" id="combined-financial-burden" min="0" max="1" step="0.1">
                    </div>
                    
                    <div class="form-group">
                        <label for="combined-compliance">Compliance with Guidelines:</label>
                        <select id="combined-compliance">
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="combined-overtreatment">Overtreatment Risk (0-1):</label>
                        <input type="number" id="combined-overtreatment" min="0" max="1" step="0.1">
                    </div>
                </div>
            </div>
            
            <button id="combined-analyze-btn">Analyze Treatment</button>
            
            <div class="loading" id="combined-loading">
                <p>Analyzing, please wait...</p>
                <div class="spinner"></div>
            </div>
            
            <div class="result-container hidden" id="combined-results">
                <h3>Analysis Results</h3>
                <div class="row">
                    <div class="col">
                        <h4>Ethical Analysis:</h4>
                        <p>Assessment: <span id="combined-ethical-result"></span></p>
                        <p>Confidence: <span id="combined-ethical-confidence"></span>%</p>
                    </div>
                    <div class="col">
                        <h4>Effectiveness Analysis:</h4>
                        <p>Assessment: <span id="combined-effectiveness-result"></span></p>
                        <p>Probability: <span id="combined-effectiveness-probability"></span>%</p>
                    </div>
                </div>
                <div>
                    <h4>Overall Recommendation:</h4>
                    <p id="combined-recommendation"></p>
                </div>
            </div>
        </div>
        
        <!-- Ethical Analysis Tab -->
        <div id="ethical-tab" class="tab-content">
            <h2>Ethical Treatment Analysis</h2>
            <p>Analyze the ethical considerations of a treatment plan.</p>
            
            <div class="form-group">
                <label for="ethical-treatment-type">Treatment Type:</label>
                <select id="ethical-treatment-type">
                    <option value="chemotherapy">Chemotherapy</option>
                    <option value="immunotherapy">Immunotherapy</option>
                    <option value="targeted">Targeted Therapy</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="ethical-dosage">Dosage (mg):</label>
                <input type="number" id="ethical-dosage" min="0">
            </div>
            
            <div class="form-group">
                <label for="ethical-patient-age">Patient Age:</label>
                <input type="number" id="ethical-patient-age" min="0" max="120">
            </div>
            
            <div class="form-group">
                <label for="ethical-leukemia-stage">Leukemia Stage:</label>
                <select id="ethical-leukemia-stage">
                    <option value="early">Early</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="ethical-prior-treatment">Prior Treatment History:</label>
                <select id="ethical-prior-treatment">
                    <option value="none">None</option>
                    <option value="partial">Partial</option>
                    <option value="extensive">Extensive</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="ethical-patient-consent">Patient Consent:</label>
                <select id="ethical-patient-consent">
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="ethical-financial-burden">Financial Burden (0-1):</label>
                <input type="number" id="ethical-financial-burden" min="0" max="1" step="0.1">
            </div>
            
            <div class="form-group">
                <label for="ethical-compliance">Compliance with Guidelines:</label>
                <select id="ethical-compliance">
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="ethical-overtreatment">Overtreatment Risk (0-1):</label>
                <input type="number" id="ethical-overtreatment" min="0" max="1" step="0.1">
            </div>
            
            <button id="ethical-analyze-btn">Analyze Ethics</button>
            
            <div class="loading" id="ethical-loading">
                <p>Analyzing, please wait...</p>
                <div class="spinner"></div>
            </div>
            
            <div class="result-container hidden" id="ethical-results">
                <h3>Ethical Analysis Results</h3>
                <p>Assessment: <span id="ethical-result"></span></p>
                <p>Confidence: <span id="ethical-confidence"></span>%</p>
            </div>
        </div>
        
        <!-- Effectiveness Analysis Tab -->
        <div id="effectiveness-tab" class="tab-content">
            <h2>Treatment Effectiveness Analysis</h2>
            <p>Analyze the potential effectiveness of a treatment plan.</p>
            
            <div class="form-group">
                <label for="effectiveness-patient-age">Patient Age:</label>
                <input type="number" id="effectiveness-patient-age" min="0" max="120">
            </div>
            
            <div class="form-group">
                <label for="effectiveness-anc-mean">ANC Mean:</label>
                <input type="number" id="effectiveness-anc-mean" step="0.01">
            </div>
            
            <div class="form-group">
                <label for="effectiveness-plt-mean">PLT Mean:</label>
                <input type="number" id="effectiveness-plt-mean">
            </div>
            
            <div class="form-group">
                <label for="effectiveness-anc-stability">ANC Stability (%):</label>
                <input type="number" id="effectiveness-anc-stability" min="0" max="100">
            </div>
            
            <div class="form-group">
                <label for="effectiveness-plt-stability">PLT Stability (%):</label>
                <input type="number" id="effectiveness-plt-stability" min="0" max="100">
            </div>
            
            <div class="form-group">
                <label for="effectiveness-6mp-mean">6MP Mean Dose (mg):</label>
                <input type="number" id="effectiveness-6mp-mean" step="0.01">
            </div>
            
            <div class="form-group">
                <label for="effectiveness-mtx-mean">MTX Mean Dose (mg):</label>
                <input type="number" id="effectiveness-mtx-mean" step="0.01">
            </div>
            
            <button id="effectiveness-analyze-btn">Analyze Effectiveness</button>
            
            <div class="loading" id="effectiveness-loading">
                <p>Analyzing, please wait...</p>
                <div class="spinner"></div>
            </div>
            
            <div class="result-container hidden" id="effectiveness-results">
                <h3>Effectiveness Analysis Results</h3>
                <p>Assessment: <span id="effectiveness-result"></span></p>
                <p>Probability: <span id="effectiveness-probability"></span>%</p>
            </div>
        </div>
    </div>
    
    <script>
        // Tab functionality
        function openTab(evt, tabName) {
            const tabContents = document.getElementsByClassName("tab-content");
            for (let i = 0; i < tabContents.length; i++) {
                tabContents[i].classList.remove("active");
            }

            const tabs = document.getElementsByClassName("tab");
            for (let i = 0; i < tabs.length; i++) {
                tabs[i].classList.remove("active");
            }

            document.getElementById(tabName).classList.add("active");
            evt.currentTarget.classList.add("active");
        }
        
        // Combined Analysis
        document.getElementById("combined-analyze-btn").addEventListener("click", async function() {
            const loading = document.getElementById("combined-loading");
            const results = document.getElementById("combined-results");
            
            loading.style.display = "block";
            results.classList.add("hidden");
            
            // Get form values
            const data = {
                // Treatment details
                treatment_type: document.getElementById("combined-treatment-type").value,
                dosage: parseFloat(document.getElementById("combined-dosage").value),
                leukemia_stage: document.getElementById("combined-leukemia-stage").value,
                prior_treatment_history: document.getElementById("combined-prior-treatment").value,
                
                // Patient info
                patient_age: parseInt(document.getElementById("combined-patient-age").value),
                
                // Blood counts
                ANC_mean: parseFloat(document.getElementById("combined-anc-mean").value),
                PLT_mean: parseFloat(document.getElementById("combined-plt-mean").value),
                anc_stability: parseFloat(document.getElementById("combined-anc-stability").value) / 100,
                plt_stability: parseFloat(document.getElementById("combined-plt-stability").value) / 100,
                
                // Ethical considerations
                patient_consent: parseInt(document.getElementById("combined-patient-consent").value),
                financial_burden: parseFloat(document.getElementById("combined-financial-burden").value),
                compliance_with_guidelines: parseInt(document.getElementById("combined-compliance").value),
                overtreatment_risk: parseFloat(document.getElementById("combined-overtreatment").value)
            };
            
            try {
                // Make both API calls in parallel
                const [ethicalResponse, effectivenessResponse] = await Promise.all([
                    fetch('/api/ethical', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    }),
                    fetch('/api/effectiveness', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    })
                ]);
                
                const ethicalData = await ethicalResponse.json();
                const effectivenessData = await effectivenessResponse.json();
                
                // Update results
                const ethicalResult = document.getElementById("combined-ethical-result");
                ethicalResult.textContent = ethicalData.ethical_violation;
                ethicalResult.className = ethicalData.ethical_violation === "Ethical" ? "ethical" : "non-ethical";
                
                document.getElementById("combined-ethical-confidence").textContent = 
                    (ethicalData.ethical_violation === "Ethical" ? 
                        (100 - ethicalData.confidence * 100).toFixed(1) : 
                        (ethicalData.confidence * 100).toFixed(1));
                
                const effectivenessResult = document.getElementById("combined-effectiveness-result");
                effectivenessResult.textContent = effectivenessData.likely_effective ? "Likely Effective" : "Likely Ineffective";
                effectivenessResult.className = effectivenessData.likely_effective ? "effective" : "ineffective";
                
                document.getElementById("combined-effectiveness-probability").textContent = 
                    (effectivenessData.avg_probability * 100).toFixed(1);
                
                // Generate recommendation
                const recommendation = document.getElementById("combined-recommendation");
                if (ethicalData.ethical_violation === "Ethical" && effectivenessData.likely_effective) {
                    recommendation.textContent = "Recommended: This treatment plan is both ethical and likely to be effective.";
                    recommendation.className = "ethical";
                } else if (ethicalData.ethical_violation === "Ethical" && !effectivenessData.likely_effective) {
                    recommendation.textContent = "Caution: While this treatment plan is ethical, it may not be effective. Consider alternative treatments.";
                    recommendation.className = "ineffective";
                } else if (ethicalData.ethical_violation === "Non-Ethical" && effectivenessData.likely_effective) {
                    recommendation.textContent = "Not Recommended: Although this treatment may be effective, it raises ethical concerns that should be addressed.";
                    recommendation.className = "non-ethical";
                } else {
                    recommendation.textContent = "Not Recommended: This treatment plan raises ethical concerns and is unlikely to be effective.";
                    recommendation.className = "non-ethical";
                }
                
                // Show results
                results.classList.remove("hidden");
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred during analysis. Please try again.");
            } finally {
                loading.style.display = "none";
            }
        });
        
        // Ethical Analysis
        document.getElementById("ethical-analyze-btn").addEventListener("click", async function() {
            const loading = document.getElementById("ethical-loading");
            const results = document.getElementById("ethical-results");
            
            loading.style.display = "block";
            results.classList.add("hidden");
            
            // Get form values
            const data = {
                treatment_type: document.getElementById("ethical-treatment-type").value,
                dosage: parseFloat(document.getElementById("ethical-dosage").value),
                patient_age: parseInt(document.getElementById("ethical-patient-age").value),
                leukemia_stage: document.getElementById("ethical-leukemia-stage").value,
                prior_treatment_history: document.getElementById("ethical-prior-treatment").value,
                patient_consent: parseInt(document.getElementById("ethical-patient-consent").value),
                financial_burden: parseFloat(document.getElementById("ethical-financial-burden").value),
                compliance_with_guidelines: parseInt(document.getElementById("ethical-compliance").value),
                overtreatment_risk: parseFloat(document.getElementById("ethical-overtreatment").value)
            };
            
            try {
                const response = await fetch('/api/ethical', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                // Update results
                const ethicalResult = document.getElementById("ethical-result");
                ethicalResult.textContent = result.ethical_violation;
                ethicalResult.className = result.ethical_violation === "Ethical" ? "ethical" : "non-ethical";
                
                document.getElementById("ethical-confidence").textContent = 
                    (result.ethical_violation === "Ethical" ? 
                        (100 - result.confidence * 100).toFixed(1) : 
                        (result.confidence * 100).toFixed(1));
                
                // Show results
                results.classList.remove("hidden");
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred during analysis. Please try again.");
            } finally {
                loading.style.display = "none";
            }
        });
        
        // Effectiveness Analysis
        document.getElementById("effectiveness-analyze-btn").addEventListener("click", async function() {
            const loading = document.getElementById("effectiveness-loading");
            const results = document.getElementById("effectiveness-results");
            
            loading.style.display = "block";
            results.classList.add("hidden");
            
            // Get form values
            const data = {
                Age: parseInt(document.getElementById("effectiveness-patient-age").value),
                ANC_mean: parseFloat(document.getElementById("effectiveness-anc-mean").value),
                PLT_mean: parseFloat(document.getElementById("effectiveness-plt-mean").value),
                anc_stability: parseFloat(document.getElementById("effectiveness-anc-stability").value) / 100,
                plt_stability: parseFloat(document.getElementById("effectiveness-plt-stability").value) / 100,
                "6MP_mg_mean": parseFloat(document.getElementById("effectiveness-6mp-mean").value),
                "MTX_mg_mean": parseFloat(document.getElementById("effectiveness-mtx-mean").value)
            };
            
            try {
                const response = await fetch('/api/effectiveness', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                // Update results
                const effectivenessResult = document.getElementById("effectiveness-result");
                effectivenessResult.textContent = result.likely_effective ? "Likely Effective" : "Likely Ineffective";
                effectivenessResult.className = result.likely_effective ? "effective" : "ineffective";
                
                document.getElementById("effectiveness-probability").textContent = 
                    (result.avg_probability * 100).toFixed(1);
                
                // Show results
                results.classList.remove("hidden");
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred during analysis. Please try again.");
            } finally {
                loading.style.display = "none";
            }
        });
    </script>
</body>
</html>
"""

# Serve HTML template
@app.route('/')
def index():
    return render_template_string(HTML_TEMPLATE)

# API endpoint for ethical analysis
@app.route("/api/ethical", methods=["POST"])
def ethical_analysis():
    try:
        if ethical_model is None or ethical_scaler is None:
            return jsonify({"error": "Ethical model not loaded"}), 500
            
        data = request.get_json()

        # Convert input data into a DataFrame
        df = pd.DataFrame([data])

        # One-hot encode categorical variables
        df = pd.get_dummies(df, columns=categorical_cols)

        # Ensure all expected columns exist (add missing ones with 0)
        for col in expected_columns:
            if col not in df.columns:
                df[col] = 0

        # Reorder columns to match training data
        df = df[expected_columns]

        # Standardize input data
        input_data = ethical_scaler.transform(df)

        # Get prediction
        prediction = ethical_model.predict(input_data)[0][0]
        result = "Non-Ethical" if prediction > 0.5 else "Ethical"

        return jsonify({"ethical_violation": result, "confidence": float(prediction)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API endpoint for treatment effectiveness analysis
@app.route("/api/effectiveness", methods=["POST"])
def effectiveness_analysis():
    try:
        if not treatment_models['is_trained']:
            return jsonify({
                "status": "error",
                "message": "Treatment effectiveness models not loaded"
            }), 500
            
        # Get JSON data
        data = request.get_json()

        if not data or not isinstance(data, dict):
            return jsonify({
                "status": "error",
                "message": "Invalid input data. Please provide a JSON object with feature values."
            }), 500

        # Create a sample dataframe with the same columns as the training data
        if treatment_models['feature_names'] is None:
            return jsonify({
                "status": "error",
                "message": "Feature names not available."
            }), 500

        # Create a DataFrame with one row and all features initialized to 0
        sample = pd.DataFrame(0, index=[0], columns=treatment_models['feature_names'])

        # Update the sample with provided values
        for feature, value in data.items():
            if feature in sample.columns:
                try:
                    # Convert value to appropriate type
                    if isinstance(value, str) and value.lower() in ['true', 'yes']:
                        value = 1
                    elif isinstance(value, str) and value.lower() in ['false', 'no']:
                        value = 0
                    else:
                        value = float(value)

                    sample.loc[0, feature] = value
                except ValueError:
                    return jsonify({
                        "status": "error",
                        "message": f"Invalid value for feature {feature}: {value}. Expected a number."
                    }), 500
            else:
                print(f"Warning: Feature '{feature}' not found in model features.")

        # Make predictions
        rf_prob = treatment_models['rf_model'].predict_proba(sample)[0, 1]
        gb_prob = treatment_models['gb_model'].predict_proba(sample)[0, 1]

        # Average the probabilities
        avg_prob =(rf_prob+gb_prob) / 2

        return jsonify({
            "status": "success",
            "rf_probability": float(rf_prob),
            "gb_probability": float(gb_prob),
            "avg_probability": float(avg_prob),
            "likely_effective": bool(avg_prob > 0.5)
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "status": "error",
            "message": f"Error making prediction: {str(e)}"
        }), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)