from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
import tensorflow as tf
import joblib

app = Flask(__name__)

# Load trained model and scaler
model = tf.keras.models.load_model("ethical_violation_classifier.h5")
scaler = joblib.load("scaler.pkl")

# Define categorical feature mappings (same as training)
categorical_cols = ["treatment_type", "leukemia_stage", "prior_treatment_history"]
expected_columns = [
    "dosage", "patient_age", "patient_consent", "financial_burden", 
    "compliance_with_guidelines", "overtreatment_risk",
    "treatment_type_chemotherapy", "treatment_type_immunotherapy", "treatment_type_targeted",
    "leukemia_stage_early", "leukemia_stage_intermediate", "leukemia_stage_advanced",
    "prior_treatment_history_none", "prior_treatment_history_partial", "prior_treatment_history_extensive"
]

@app.route("/predict", methods=["POST"])
def predict():
    try:
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
        input_data = scaler.transform(df)

        # Get prediction
        prediction = model.predict(input_data)[0][0]
        result = "Non-Ethical" if prediction > 0.5 else "Ethical"

        return jsonify({"ethical_violation": result, "confidence": float(prediction)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
