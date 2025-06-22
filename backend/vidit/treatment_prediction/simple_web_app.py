from flask import Flask, request, jsonify, send_file
import os
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import io
import base64
import json
import pickle
import joblib
from treatment_effectiveness_model import load_cohort_data, load_patient_data, load_icd_data, load_learn_data, prepare_data, feature_engineering, train_model, analyze_treatment_patterns
from visualize_patient_treatment import visualize_patient_treatment

app = Flask(__name__)

# Global variables to store trained models and data
models = {
    'rf_model': None,
    'gb_model': None,
    'X_test': None,
    'feature_names': None,
    'is_trained': False
}

# Create models directory if it doesn't exist
os.makedirs('models', exist_ok=True)

# Function to save models
def save_models():
    if models['rf_model'] is not None and models['gb_model'] is not None:
        try:
            # Save Random Forest model
            joblib.dump(models['rf_model'], 'models/rf_model.joblib')

            # Save Gradient Boosting model
            joblib.dump(models['gb_model'], 'models/gb_model.joblib')

            # Save feature names
            if models['feature_names'] is not None:
                with open('models/feature_names.pkl', 'wb') as f:
                    pickle.dump(models['feature_names'], f)

            return True
        except Exception as e:
            print(f"Error saving models: {str(e)}")
            return False
    return False

# Function to load models
def load_models():
    try:
        # Check if model files exist
        if os.path.exists('models/rf_model.joblib') and os.path.exists('models/gb_model.joblib'):
            # Load Random Forest model
            models['rf_model'] = joblib.load('models/rf_model.joblib')

            # Load Gradient Boosting model
            models['gb_model'] = joblib.load('models/gb_model.joblib')

            # Load feature names if available
            if os.path.exists('models/feature_names.pkl'):
                with open('models/feature_names.pkl', 'rb') as f:
                    models['feature_names'] = pickle.load(f)

            models['is_trained'] = True
            return True
    except Exception as e:
        print(f"Error loading models: {str(e)}")

    return False

# Try to load models at startup
load_models()

# Serve static HTML file
@app.route('/')
def index():
    return send_file('static/index.html')

# API endpoint to get list of patients
@app.route('/api/patients')
def get_patients():
    patient_files = []
    data_dir = 'Individual patient maintenance therapy data'
    if os.path.exists(data_dir):
        for file in os.listdir(data_dir):
            if file.endswith('.csv'):
                patient_files.append(file.split('.')[0])
    
    return jsonify(sorted(patient_files))

# API endpoint to train model
@app.route('/api/train_model', methods=['POST'])
def train_model_route():
    try:
        # Load all data
        cohort_data = load_cohort_data()
        patient_data = load_patient_data()
        icd_data = load_icd_data()
        learn_data = load_learn_data()
        
        if cohort_data.empty:
            return jsonify({
                'status': 'error',
                'message': 'No cohort demographic data loaded.'
            })
        
        if patient_data.empty:
            return jsonify({
                'status': 'error',
                'message': 'No patient data loaded.'
            })
        
        # Prepare and combine data
        combined_data = prepare_data(cohort_data, patient_data, icd_data, learn_data)
        
        if len(combined_data) == 0:
            return jsonify({
                'status': 'error',
                'message': 'No data after merging. Check that UPN formats match across datasets.'
            })
        
        # Feature engineering
        processed_data = feature_engineering(combined_data)
        
        # Train model
        rf_model, gb_model, X_test, y_test = train_model(processed_data)

        # Store models for later use
        models['rf_model'] = rf_model
        models['gb_model'] = gb_model
        models['X_test'] = X_test
        models['feature_names'] = X_test.columns.tolist()
        models['is_trained'] = True

        # Save models to disk
        save_models()
        
        # Analyze treatment patterns
        effective_patients, ineffective_patients = analyze_treatment_patterns(combined_data, patient_data)
        
        # Get feature importance if available
        top_features = []
        if rf_model is not None and hasattr(rf_model, 'named_steps') and hasattr(rf_model.named_steps['classifier'], 'feature_importances_'):
            feature_importance = rf_model.named_steps['classifier'].feature_importances_
            feature_names = X_test.columns
            
            # Sort feature importance
            indices = feature_importance.argsort()[::-1]
            
            # Get top 15 features
            for i in range(min(15, len(feature_names))):
                top_features.append({
                    'name': feature_names[indices[i]],
                    'importance': float(feature_importance[indices[i]])
                })
        
        return jsonify({
            'status': 'success',
            'message': 'Model trained successfully',
            'total_patients': len(combined_data),
            'effective_treatments': int(combined_data['treatment_effective'].sum()),
            'ineffective_treatments': int(len(combined_data) - combined_data['treatment_effective'].sum()),
            'effectiveness_rate': float(combined_data['treatment_effective'].mean() * 100),
            'top_features': top_features
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'status': 'error',
            'message': f'Error during model training: {str(e)}'
        })

# API endpoint to analyze patient
@app.route('/api/analyze_patient', methods=['POST'])
def analyze_patient():
    try:
        data = request.get_json()
        upn = data.get('upn')
        
        if not upn:
            return jsonify({
                'status': 'error',
                'message': 'No patient UPN provided'
            })
        
        # Use the visualize_patient_treatment function
        result = visualize_patient_treatment(upn)
        
        if result is None:
            return jsonify({
                'status': 'error',
                'message': f'Failed to analyze patient {upn}'
            })
        
        # Get the image path
        img_path = f'{upn}_treatment_analysis.png'
        
        # Check if the image exists
        if os.path.exists(img_path):
            with open(img_path, 'rb') as img_file:
                img_data = base64.b64encode(img_file.read()).decode('utf-8')
        else:
            img_data = None
        
        return jsonify({
            'status': 'success',
            'upn': upn,
            'anc_stability': float(result['anc_stability']),
            'plt_stability': float(result['plt_stability']),
            'likely_effective': bool(result['likely_effective']),
            'image': img_data
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'status': 'error',
            'message': f'Error analyzing patient: {str(e)}'
        })

# API endpoint to check if model is trained
@app.route('/api/model_status')
def model_status():
    return jsonify({
        'is_trained': models['is_trained']
    })

# API endpoint to get feature names
@app.route('/api/feature_names')
def get_feature_names():
    if not models['is_trained'] or models['feature_names'] is None:
        return jsonify({
            'status': 'error',
            'message': 'Model not trained or feature names not available'
        })

    # Define key patient information fields that should always be included
    key_patient_fields = [
        # Blood counts
        'ANC_mean', 'ANC_min', 'ANC_max', 'ANC_std',
        'PLT_mean', 'PLT_min', 'PLT_max', 'PLT_std',
        'WBC_mean', 'WBC_min', 'WBC_max', 'WBC_std',

        # Medication dosages
        '6MP_mg_mean', '6MP_DI_mean', '6MP_mg_max', '6MP_DI_max',
        'MTX_mg_mean', 'MTX_DI_mean', 'MTX_mg_max', 'MTX_DI_max',

        # Patient characteristics
        'Age', 'Sex', 'bmi', 'weight', 'height',

        # Disease characteristics
        'relapse_count', 'toxicity',

        # Lab values
        'alt', 'ast', 'anc_stability', 'plt_stability'
    ]

    # Get feature importance if available
    if models['rf_model'] is not None and hasattr(models['rf_model'], 'named_steps') and hasattr(models['rf_model'].named_steps['classifier'], 'feature_importances_'):
        feature_importance = models['rf_model'].named_steps['classifier'].feature_importances_
        feature_names = models['feature_names']

        # Sort feature importance
        indices = feature_importance.argsort()[::-1]

        # Get all features with their importance
        all_features_with_importance = []
        for i in range(len(feature_names)):
            all_features_with_importance.append({
                'name': feature_names[indices[i]],
                'importance': float(feature_importance[indices[i]])
            })

        # Get key patient fields that exist in the model
        key_features = []
        for field in key_patient_fields:
            # Find the field in all_features_with_importance
            for feature in all_features_with_importance:
                if feature['name'] == field:
                    key_features.append(feature)
                    break

            # If not found with exact match, try to find it as a substring
            if not any(f['name'] == field for f in key_features):
                for feature in all_features_with_importance:
                    if field in feature['name']:
                        key_features.append(feature)
                        break

        # Add any top features that aren't already in key_features
        top_features = []
        for i in range(min(15, len(feature_names))):
            feature = {
                'name': feature_names[indices[i]],
                'importance': float(feature_importance[indices[i]])
            }
            if not any(f['name'] == feature['name'] for f in key_features):
                top_features.append(feature)

        # Combine key features and top features
        combined_features = key_features + top_features

        return jsonify({
            'status': 'success',
            'all_features': models['feature_names'],
            'key_features': key_features,
            'top_features': top_features,
            'combined_features': combined_features
        })

    return jsonify({
        'status': 'success',
        'all_features': models['feature_names'],
        'key_features': [],
        'top_features': [],
        'combined_features': []
    })

# API endpoint to make predictions with custom input
@app.route('/api/predict', methods=['POST'])
def predict():
    if not models['is_trained']:
        return jsonify({
            'status': 'error',
            'message': 'Model not trained yet. Please train the model first.'
        })

    try:
        # Get JSON data
        data = request.get_json()

        if not data or not isinstance(data, dict):
            return jsonify({
                'status': 'error',
                'message': 'Invalid input data. Please provide a JSON object with feature values.'
            })

        # Create a sample dataframe with the same columns as the training data
        if models['feature_names'] is None:
            return jsonify({
                'status': 'error',
                'message': 'Feature names not available. Please retrain the model.'
            })

        # Create a DataFrame with one row and all features initialized to 0
        sample = pd.DataFrame(0, index=[0], columns=models['feature_names'])

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
                        'status': 'error',
                        'message': f'Invalid value for feature {feature}: {value}. Expected a number.'
                    })
            else:
                print(f"Warning: Feature '{feature}' not found in model features.")

        # Make predictions
        rf_prob = models['rf_model'].predict_proba(sample)[0, 1]
        gb_prob = models['gb_model'].predict_proba(sample)[0, 1]

        # Average the probabilities
        avg_prob = (rf_prob + gb_prob) / 2

        return jsonify({
            'status': 'success',
            'rf_probability': float(rf_prob),
            'gb_probability': float(gb_prob),
            'avg_probability': float(avg_prob),
            'likely_effective': bool(avg_prob > 0.5)
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'status': 'error',
            'message': f'Error making prediction: {str(e)}'
        })

if __name__ == '__main__':
    # Create static directory if it doesn't exist
    os.makedirs('static', exist_ok=True)
    
    # Run the app on port 5050
    app.run(debug=True, port=5050)