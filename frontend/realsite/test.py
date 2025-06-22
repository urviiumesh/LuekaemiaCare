import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import Dense, Dropout, Input, Concatenate
from tensorflow.keras.optimizers import Adam
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import joblib

class EnhancedEthicalTreatmentModel:
    def _init_(self):
        # Core components
        self.ethical_classifier = None
        self.risk_reward_mapper = None
        self.alternative_suggestor = None
        self.patient_modification_detector = None
        self.conflict_detector = None
        self.bias_detector = None
        self.cultural_sensitivity_analyzer = None
        self.incentive_bias_detector = None
        self.overtreatment_detector = None
        self.palliative_care_advisor = None
        self.cost_effectiveness_analyzer = None
        self.low_value_detector = None
        
        # Data transformers
        self.scaler = None
        self.categorical_cols = ["treatment_type", "leukemia_stage", "prior_treatment_history"]
        self.expected_columns = [
            "dosage", "patient_age", "patient_consent", "financial_burden", 
            "compliance_with_guidelines", "overtreatment_risk",
            "treatment_type_chemotherapy", "treatment_type_immunotherapy", "treatment_type_targeted",
            "leukemia_stage_early", "leukemia_stage_intermediate", "leukemia_stage_advanced",
            "prior_treatment_history_none", "prior_treatment_history_partial", "prior_treatment_history_extensive"
        ]
        
        # Additional feature columns for enhanced model
        self.enhanced_columns = [
            "patient_comorbidities", "cultural_religious_restrictions", 
            "quality_of_life_impact", "treatment_cost", "expected_survival_benefit",
            "experimental_status", "palliative_indicator", "gender", "race", 
            "income_level", "insurance_type", "doctor_specialty", "hospital_type"
        ]
        
    def train(self, data_path, synthetic_enhance=True):
        """Train all components of the ethical treatment model"""
        # Load base dataset
        df = pd.read_csv(data_path)
        
        # Enhance with synthetic data if needed
        if synthetic_enhance:
            df = self._enhance_dataset(df)
            
        # Preprocess data
        df_encoded = pd.get_dummies(df, columns=self.categorical_cols)
        features = df_encoded.drop("ethical_violation", axis=1).values
        labels = df_encoded["ethical_violation"].values
        
        # Standard scaling
        self.scaler = StandardScaler()
        scaled_features = self.scaler.fit_transform(features)
        
        # Save the scaler
        joblib.dump(self.scaler, "enhanced_scaler.pkl")
        
        # Train core ethical classifier (base model enhancement)
        self._train_ethical_classifier(scaled_features, labels)
        
        # Train specialized components
        self._train_risk_reward_mapper(df)
        self._train_alternative_suggestor(df)
        self._train_conflict_detector(df)
        self._train_bias_detector(df)
        self._train_incentive_bias_detector(df)
        self._train_overtreatment_detector(df)
        
        print("Enhanced Ethical Treatment Model training complete")
        
    def _enhance_dataset(self, df):
        """Add synthetic data with additional features"""
        n_samples = len(df)
        
        # Generate synthetic additional features
        np.random.seed(42)
        
        # Add patient comorbidities (0-5 scale)
        df["patient_comorbidities"] = np.random.randint(0, 6, size=n_samples)
        
        # Cultural/religious restrictions (binary)
        df["cultural_religious_restrictions"] = np.random.choice([0, 1], size=n_samples)
        
        # Quality of life impact (0-1 scale)
        df["quality_of_life_impact"] = np.random.uniform(0, 1, size=n_samples)
        
        # Treatment cost ($1000-$100000)
        df["treatment_cost"] = np.random.uniform(1000, 100000, size=n_samples)
        
        # Expected survival benefit (months)
        df["expected_survival_benefit"] = np.random.uniform(0, 60, size=n_samples)
        
        # Experimental status (0=standard, 1=experimental, 2=compassionate use)
        df["experimental_status"] = np.random.choice([0, 1, 2], size=n_samples)
        
        # Palliative indicator
        df["palliative_indicator"] = np.random.choice([0, 1], size=n_samples)
        
        # Demographics for bias detection
        df["gender"] = np.random.choice(["male", "female", "other"], size=n_samples)
        df["race"] = np.random.choice(["white", "black", "asian", "hispanic", "other"], size=n_samples)
        df["income_level"] = np.random.choice(["low", "middle", "high"], size=n_samples)
        df["insurance_type"] = np.random.choice(["private", "public", "none"], size=n_samples)
        
        # Provider information
        df["doctor_specialty"] = np.random.choice(["oncology", "hematology", "general"], size=n_samples)
        df["hospital_type"] = np.random.choice(["academic", "community", "private"], size=n_samples)
        
        return df
        
    def _train_ethical_classifier(self, X, y):
        """Train the core ethical classifier with an enhanced architecture"""
        # Create a more sophisticated model
        inputs = Input(shape=(X.shape[1],))
        x = Dense(256, activation='relu')(inputs)
        x = Dropout(0.3)(x)
        x = Dense(128, activation='relu')(x)
        x = Dropout(0.2)(x)
        x = Dense(64, activation='relu')(x)
        x = Dropout(0.2)(x)
        outputs = Dense(1, activation='sigmoid')(x)
        
        self.ethical_classifier = Model(inputs=inputs, outputs=outputs)
        self.ethical_classifier.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='binary_crossentropy',
            metrics=['accuracy']
        )
        
        # Train with more epochs and early stopping
        self.ethical_classifier.fit(
            X, y, 
            epochs=30, 
            batch_size=32,
            validation_split=0.2,
            callbacks=[
                tf.keras.callbacks.EarlyStopping(
                    monitor='val_loss',
                    patience=5,
                    restore_best_weights=True
                )
            ]
        )
        
        # Save the model
        self.ethical_classifier.save("enhanced_ethical_classifier.h5")
        
    def _train_risk_reward_mapper(self, df):
        """Maps treatments on a scale of standard vs experimental vs compassionate use"""
        # Simple K-means clustering for risk-reward mapping
        features = df[["overtreatment_risk", "expected_survival_benefit", "experimental_status"]].copy()
        kmeans = KMeans(n_clusters=3, random_state=42)
        kmeans.fit(features)
        
        # Save the risk-reward mapper
        joblib.dump(kmeans, "risk_reward_mapper.pkl")
        self.risk_reward_mapper = kmeans
        
    def _train_alternative_suggestor(self, df):
        """Train a model to suggest ethical alternatives"""
        # Group similar treatments and outcomes
        treatment_features = df[["treatment_type_chemotherapy", "treatment_type_immunotherapy", 
                              "treatment_type_targeted", "leukemia_stage_early", 
                              "leukemia_stage_intermediate", "leukemia_stage_advanced",
                              "prior_treatment_history_none", "prior_treatment_history_partial", 
                              "prior_treatment_history_extensive", "patient_age"]]
        
        # Create clusters of similar patient profiles
        kmeans = KMeans(n_clusters=5, random_state=42)
        kmeans.fit(treatment_features)
        
        # Save the alternative suggestor
        joblib.dump(kmeans, "alternative_suggestor.pkl")
        self.alternative_suggestor = kmeans
        
    def _train_conflict_detector(self, df):
        """Trains a model to detect treatment conflicts"""
        # For a real implementation, this would involve a more complex drug interaction database
        # Here we simulate with a simple neural network
        
        # Extract relevant features
        features = df[["patient_comorbidities", "treatment_type_chemotherapy", 
                     "treatment_type_immunotherapy", "treatment_type_targeted"]].values
        
        # Create synthetic conflict labels (would be real data in production)
        conflicts = np.random.choice([0, 1], size=len(features), p=[0.9, 0.1])
        
        # Train a simple binary classifier
        model = Sequential([
            Dense(64, activation='relu', input_shape=(features.shape[1],)),
            Dropout(0.2),
            Dense(32, activation='relu'),
            Dense(1, activation='sigmoid')
        ])
        
        model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        model.fit(features, conflicts, epochs=10, batch_size=32, validation_split=0.2)
        
        # Save the model
        model.save("conflict_detector.h5")
        self.conflict_detector = model
        
    def _train_bias_detector(self, df):
        """Train a model to detect demographic bias in treatment decisions"""
        # One-hot encode categorical demographic variables
        demographics = pd.get_dummies(df[["gender", "race", "income_level", "insurance_type"]])
        
        # Extract treatment and ethical features
        treatment_ethics = df[["treatment_type_chemotherapy", "treatment_type_immunotherapy", 
                             "treatment_type_targeted", "ethical_violation"]]
        
        # Combine features
        features = pd.concat([demographics, treatment_ethics], axis=1)
        
        # Generate synthetic bias labels (would be real data in production)
        # Higher probability of bias for certain combinations
        bias_prob = np.where(
            (df["income_level"] == "low") & (df["ethical_violation"] == 1),
            0.3,  # 30% chance of bias for low income with ethical violation
            0.05  # 5% chance otherwise
        )
        bias_labels = np.random.binomial(1, bias_prob)
        
        # Train bias detector model
        model = Sequential([
            Dense(128, activation='relu', input_shape=(features.shape[1],)),
            Dropout(0.3),
            Dense(64, activation='relu'),
            Dropout(0.2),
            Dense(1, activation='sigmoid')
        ])
        
        model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        model.fit(features, bias_labels, epochs=15, batch_size=32, validation_split=0.2)
        
        # Save the model
        model.save("bias_detector.h5")
        self.bias_detector = model
        
    def _train_incentive_bias_detector(self, df):
        """Detect if financial incentives are influencing treatment decisions"""
        # Extract relevant features
        features = df[["treatment_cost", "expected_survival_benefit", 
                     "doctor_specialty", "hospital_type", "financial_burden"]].copy()
        
        # Handle categorical features
        features = pd.get_dummies(features, columns=["doctor_specialty", "hospital_type"])
        
        # Generate synthetic incentive bias labels (would be real data in production)
        # Higher probability of incentive bias for high-cost, low-benefit treatments
        incentive_prob = np.where(
            (df["treatment_cost"] > 50000) & (df["expected_survival_benefit"] < 20),
            0.4,  # 40% chance of incentive bias for expensive treatments with low benefit
            0.1   # 10% chance otherwise
        )
        incentive_labels = np.random.binomial(1, incentive_prob)
        
        # Train incentive bias detector model
        model = Sequential([
            Dense(128, activation='relu', input_shape=(features.shape[1],)),
            Dropout(0.3),
            Dense(64, activation='relu'),
            Dropout(0.2),
            Dense(1, activation='sigmoid')
        ])
        
        model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        model.fit(features, incentive_labels, epochs=15, batch_size=32, validation_split=0.2)
        
        # Save the model
        model.save("incentive_bias_detector.h5")
        self.incentive_bias_detector = model
        
    def _train_overtreatment_detector(self, df):
        """Detect patterns of overtreatment"""
        # Extract relevant features
        features = df[["overtreatment_risk", "patient_age", "leukemia_stage_early", 
                     "leukemia_stage_intermediate", "leukemia_stage_advanced",
                     "expected_survival_benefit", "palliative_indicator"]].values
                     
        # Create overtreatment labels
        overtreatment_labels = np.where(
            (df["overtreatment_risk"] > 0.7) & 
            ((df["patient_age"] > 70) | (df["leukemia_stage_advanced"] == 1)) &
            (df["expected_survival_benefit"] < 12),
            1,  # Overtreatment
            0   # Appropriate treatment
        )
        
        # Train overtreatment detector model
        model = Sequential([
            Dense(64, activation='relu', input_shape=(features.shape[1],)),
            Dropout(0.2),
            Dense(32, activation='relu'),
            Dense(1, activation='sigmoid')
        ])
        
        model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        model.fit(features, overtreatment_labels, epochs=10, batch_size=32, validation_split=0.2)
        
        # Save the model
        model.save("overtreatment_detector.h5")
        self.overtreatment_detector = model
        
    def predict(self, patient_data):
        """Make comprehensive ethical analysis of a treatment plan"""
        # Process input data
        df = pd.DataFrame([patient_data])
        
        # One-hot encode categorical variables
        df = pd.get_dummies(df, columns=self.categorical_cols)
        
        # Ensure all expected columns exist
        for col in self.expected_columns:
            if col not in df.columns:
                df[col] = 0
                
        # Handle missing enhanced columns (for basic model compatibility)
        for col in self.enhanced_columns:
            if col not in df.columns:
                if col in ["patient_comorbidities", "experimental_status"]:
                    df[col] = 0
                elif col in ["treatment_cost"]:
                    df[col] = 5000  # default value
                elif col in ["expected_survival_benefit"]:
                    df[col] = 24  # default 2 years
                elif col in ["quality_of_life_impact"]:
                    df[col] = 0.5  # middle value
                else:
                    df[col] = 0
        
        # Reorder columns to match training data
        df_base = df[self.expected_columns]
        
        # Standardize input data
        input_data = self.scaler.transform(df_base)
        
        # Get core ethical prediction
        ethical_score = self.ethical_classifier.predict(input_data)[0][0]
        ethical_result = "Non-Ethical" if ethical_score > 0.5 else "Ethical"
        
        # Run specialized component predictions
        results = {
            "ethical_violation": ethical_result,
            "confidence": float(ethical_score),
            "components": self._run_component_analysis(df)
        }
        
        # Generate explanation
        results["explanation"] = self._generate_explanation(results)
        
        return results
    
    def _run_component_analysis(self, df):
        """Run all specialized ethical components"""
        components = {}
        
        # These would be real model predictions in a full implementation
        # Here we use simulated results for demonstration
        components["risk_reward_mapping"] = {
            "risk_level": "high" if df["overtreatment_risk"].values[0] > 0.7 else "medium" if df["overtreatment_risk"].values[0] > 0.4 else "low",
            "reward_level": "high" if df["expected_survival_benefit"].values[0] > 36 else "medium" if df["expected_survival_benefit"].values[0] > 12 else "low",
            "treatment_category": "standard" if df["experimental_status"].values[0] == 0 else "experimental" if df["experimental_status"].values[0] == 1 else "compassionate_use"
        }
        
        # Patient consent verification
        components["consent_verification"] = {
            "consent_obtained": bool(df["patient_consent"].values[0]),
            "consent_adequate": bool(df["patient_consent"].values[0] and (df["experimental_status"].values[0] == 0 or df["overtreatment_risk"].values[0] < 0.6))
        }
        
        # Cultural/religious sensitivity check
        components["cultural_sensitivity"] = {
            "potential_conflict": bool(df["cultural_religious_restrictions"].values[0]),
            "severity": "high" if df["cultural_religious_restrictions"].values[0] == 1 else "none"
        }
        
        # Overtreatment detection
        components["overtreatment_analysis"] = {
            "overtreatment_risk": float(df["overtreatment_risk"].values[0]),
            "overtreatment_detected": bool(df["overtreatment_risk"].values[0] > 0.7)
        }
        
        # Curative to palliative switch recommendation
        palliative_recommended = (
            df["expected_survival_benefit"].values[0] < 6 and 
            df["leukemia_stage_advanced"].values[0] == 1 and
            df["patient_age"].values[0] > 70
        )
        components["palliative_care_recommendation"] = {
            "palliative_recommended": bool(palliative_recommended),
            "current_palliative_focus": bool(df["palliative_indicator"].values[0])
        }
        
        # Cost-effectiveness analysis
        components["cost_effectiveness"] = {
            "cost": float(df["treatment_cost"].values[0]),
            "expected_benefit_months": float(df["expected_survival_benefit"].values[0]),
            "cost_per_benefit_month": float(df["treatment_cost"].values[0] / max(1, df["expected_survival_benefit"].values[0])),
            "assessment": "poor" if (df["treatment_cost"].values[0] / max(1, df["expected_survival_benefit"].values[0])) > 5000 else
                          "fair" if (df["treatment_cost"].values[0] / max(1, df["expected_survival_benefit"].values[0])) > 2000 else
                          "good"
        }
        
        return components
    
    def _generate_explanation(self, results):
        """Generate human-readable explanations for each stakeholder"""
        explanations = {}
        
        # Doctor explanation
        doctor_explanation = []
        if results["ethical_violation"] == "Non-Ethical":
            doctor_explanation.append("⚠ Treatment plan flagged with ethical concerns.")
            
            if not results["components"]["consent_verification"]["consent_obtained"]:
                doctor_explanation.append("- Missing patient consent for proposed treatment.")
                
            if results["components"]["overtreatment_analysis"]["overtreatment_detected"]:
                doctor_explanation.append("- Potential overtreatment detected for patient condition.")
                
            if results["components"]["palliative_care_recommendation"]["palliative_recommended"]:
                doctor_explanation.append("- Consider transitioning to palliative care given limited survival benefit.")
                
            if results["components"]["cultural_sensitivity"]["potential_conflict"]:
                doctor_explanation.append("- Treatment may conflict with patient's cultural/religious preferences.")
                
            if results["components"]["cost_effectiveness"]["assessment"] == "poor":
                doctor_explanation.append(f"- Cost-effectiveness ratio is poor ({results['components']['cost_effectiveness']['cost_per_benefit_month']:.0f} per month of benefit).")
        else:
            doctor_explanation.append("✓ Treatment plan appears ethically sound.")
            doctor_explanation.append(f"- Risk-reward profile: {results['components']['risk_reward_mapping']['risk_level']} risk, {results['components']['risk_reward_mapping']['reward_level']} potential benefit.")
            
        explanations["doctor"] = "\n".join(doctor_explanation)
        
        # Patient explanation (simpler language)
        patient_explanation = []
        if results["ethical_violation"] == "Non-Ethical":
            patient_explanation.append("There are some concerns about this treatment plan that you should discuss with your doctor:")
            
            if not results["components"]["consent_verification"]["consent_adequate"]:
                patient_explanation.append("- It appears you may need more information about this treatment before deciding.")
                
            if results["components"]["cultural_sensitivity"]["potential_conflict"]:
                patient_explanation.append("- This treatment might conflict with cultural or religious preferences you've indicated.")
                
            if results["components"]["cost_effectiveness"]["assessment"] == "poor":
                patient_explanation.append("- This treatment has a high cost relative to its expected benefit.")
        else:
            patient_explanation.append("This treatment plan appears to be appropriate for your condition.")
            patient_explanation.append(f"- The expected benefit is about {results['components']['cost_effectiveness']['expected_benefit_months']:.0f} months.")
            
        explanations["patient"] = "\n".join(patient_explanation)
        
        # Family explanation
        family_explanation = []
        if results["ethical_violation"] == "Non-Ethical":
            family_explanation.append("There are some aspects of this treatment plan you may want to discuss further:")
            
            if results["components"]["palliative_care_recommendation"]["palliative_recommended"]:
                family_explanation.append("- The system suggests discussing palliative care options given the current prognosis.")
                
            if results["components"]["cost_effectiveness"]["assessment"] == "poor":
                family_explanation.append("- The treatment has a significant cost relative to expected outcomes.")
        else:
            family_explanation.append("The proposed treatment plan appears appropriate.")
            family_explanation.append(f"- The treatment is categorized as {results['components']['risk_reward_mapping']['treatment_category']}.")
            
        explanations["family"] = "\n".join(family_explanation)
        
        return explanations