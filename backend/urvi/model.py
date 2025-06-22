import numpy as np
import pandas as pd
import joblib  # To save the scaler
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.optimizers import Adam

# -----------------------------
# Step 1: Create a Synthetic Dataset
# -----------------------------
n_samples = 1000

# Generate synthetic features
np.random.seed(42)
treatment_types = np.random.choice(["chemotherapy", "immunotherapy", "targeted"], size=n_samples)
dosage = np.random.uniform(10, 100, size=n_samples)
patient_age = np.random.randint(18, 81, size=n_samples)
leukemia_stage = np.random.choice(["early", "intermediate", "advanced"], size=n_samples)
prior_treatment_history = np.random.choice(["none", "partial", "extensive"], size=n_samples)
patient_consent = np.random.choice([0, 1], size=n_samples)
financial_burden = np.random.uniform(0, 1, size=n_samples)
compliance_with_guidelines = np.random.choice([0, 1], size=n_samples)
overtreatment_risk = np.random.uniform(0, 1, size=n_samples)

# Define a simple rule for generating labels:
# If there is no consent OR overtreatment risk is high (>0.7) OR treatment deviates from guidelines (compliance == 0),
# then label as non-ethical (1), else ethical (0)
labels = ((patient_consent == 0) | (overtreatment_risk > 0.7) | (compliance_with_guidelines == 0)).astype(int)

# Create DataFrame
df = pd.DataFrame({
    "treatment_type": treatment_types,
    "dosage": dosage,
    "patient_age": patient_age,
    "leukemia_stage": leukemia_stage,
    "prior_treatment_history": prior_treatment_history,
    "patient_consent": patient_consent,
    "financial_burden": financial_burden,
    "compliance_with_guidelines": compliance_with_guidelines,
    "overtreatment_risk": overtreatment_risk,
    "ethical_violation": labels
})

# -----------------------------
# Step 2: Preprocess the Data
# -----------------------------
# One-hot encode the categorical features
categorical_cols = ["treatment_type", "leukemia_stage", "prior_treatment_history"]
df_encoded = pd.get_dummies(df, columns=categorical_cols)

# Separate features and labels
X = df_encoded.drop("ethical_violation", axis=1).values
y = df_encoded["ethical_violation"].values

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Standardize numerical features
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# **Save the scaler**
joblib.dump(scaler, "scaler.pkl")
print("Scaler saved as scaler.pkl")

# -----------------------------
# Step 3: Build the MLP Model
# -----------------------------
model = Sequential([
    Dense(128, activation='relu', input_shape=(X_train.shape[1],)),
    Dropout(0.2),
    Dense(64, activation='relu'),
    Dropout(0.2),
    Dense(1, activation='sigmoid')  # Output layer for binary classification
])

model.compile(optimizer=Adam(learning_rate=0.001),
              loss='binary_crossentropy',
              metrics=['accuracy'])

model.summary()

# -----------------------------
# Step 4: Train the Model
# -----------------------------
history = model.fit(X_train, y_train,
                    epochs=20,
                    batch_size=32,
                    validation_split=0.2)

# Evaluate on test data
test_loss, test_accuracy = model.evaluate(X_test, y_test)
print(f"Test accuracy: {test_accuracy:.2f}")

# -----------------------------
# Step 5: Save the Model (Optional)
# -----------------------------
model.save("ethical_violation_classifier.h5")
print("Model saved as ethical_violation_classifier.h5")
