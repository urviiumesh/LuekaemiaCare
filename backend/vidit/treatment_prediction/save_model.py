import os
import pickle
import joblib
import sys

# Create models directory if it doesn't exist
os.makedirs('models', exist_ok=True)

def save_model_from_treatment_effectiveness():
    """
    This function imports the treatment_effectiveness_model module,
    runs the model, and saves the trained models for later use.
    """
    print("Loading treatment effectiveness model...")
    
    # Import the module
    from treatment_effectiveness_model import load_cohort_data, load_patient_data, load_icd_data, load_learn_data, prepare_data, feature_engineering, train_model
    
    # Load all data
    print("Loading data...")
    cohort_data = load_cohort_data()
    patient_data = load_patient_data()
    icd_data = load_icd_data()
    learn_data = load_learn_data()
    
    if cohort_data.empty:
        print("Error: No cohort demographic data loaded.")
        return False
    
    if patient_data.empty:
        print("Error: No patient data loaded.")
        return False
    
    # Prepare and combine data
    print("Preparing and combining data...")
    combined_data = prepare_data(cohort_data, patient_data, icd_data, learn_data)
    
    if len(combined_data) == 0:
        print("Error: No data after merging. Check that UPN formats match across datasets.")
        return False
    
    # Feature engineering
    print("Performing feature engineering...")
    processed_data = feature_engineering(combined_data)
    
    # Train model
    print("Training models...")
    rf_model, gb_model, X_test, y_test = train_model(processed_data)
    
    # Save models
    print("Saving models...")
    try:
        # Save Random Forest model
        joblib.dump(rf_model, 'models/rf_model.joblib')
        print("Random Forest model saved to models/rf_model.joblib")
        
        # Save Gradient Boosting model
        joblib.dump(gb_model, 'models/gb_model.joblib')
        print("Gradient Boosting model saved to models/gb_model.joblib")
        
        # Save feature names
        feature_names = X_test.columns.tolist()
        with open('models/feature_names.pkl', 'wb') as f:
            pickle.dump(feature_names, f)
        print(f"Feature names saved to models/feature_names.pkl ({len(feature_names)} features)")
        
        # Save a sample of X_test for reference
        X_test.head(5).to_csv('models/sample_input.csv')
        print("Sample input data saved to models/sample_input.csv")
        
        return True
    except Exception as e:
        print(f"Error saving models: {str(e)}")
        return False

if __name__ == "__main__":
    success = save_model_from_treatment_effectiveness()
    if success:
        print("Models saved successfully. You can now use the web interface to make predictions.")
    else:
        print("Failed to save models. Please check the error messages above.")