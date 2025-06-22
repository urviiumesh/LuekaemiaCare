import pandas as pd
import numpy as np
import glob
import os
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix, roc_curve, auc
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer

# Define data loading functions
def load_cohort_data():
    print("Loading demographic data...")
    try:
        cohort_data = pd.read_csv('Cohort_Demographics.csv')
        print(f"Loaded demographic data for {len(cohort_data)} patients")
        return cohort_data
    except Exception as e:
        print(f"ERROR loading demographic data: {str(e)}")
        return pd.DataFrame()

# Load individual patient maintenance therapy data
def load_patient_data():
    print("Loading individual patient therapy data...")
    try:
        # Use os.path.join for cross-platform compatibility
        data_dir = 'Individual patient maintenance therapy data'
        pattern = os.path.join(data_dir, '*.csv')
        print(f"Looking for patient files with pattern: {pattern}")
        patient_files = glob.glob(pattern)
        print(f"Found {len(patient_files)} patient files")

        if not patient_files:
            print("WARNING: No patient files found. Check the directory path.")
            return pd.DataFrame()

        all_patient_data = []

        for file in patient_files:
            try:
                # Extract UPN from filename - handle both Windows and Unix paths
                upn = os.path.basename(file).split('.')[0]
                df = pd.read_csv(file)
                df['UPN'] = upn
                all_patient_data.append(df)
            except Exception as e:
                print(f"Error processing file {file}: {str(e)}")

        if not all_patient_data:
            print("ERROR: Failed to process any patient files.")
            return pd.DataFrame()

        patient_data = pd.concat(all_patient_data, ignore_index=True)
        print(f"Loaded therapy data from {len(patient_files)} patient files with {len(patient_data)} rows")
        return patient_data
    except Exception as e:
        print(f"ERROR loading patient data: {str(e)}")
        return pd.DataFrame()

def load_icd_data():
    print("Loading ICD mock data...")
    try:
        icd_data = pd.read_csv('icd_mock_data.csv')
        icd_data.rename(columns={'patient_id': 'UPN_id'}, inplace=True)
        # Create UPN column from patient_id
        icd_data['UPN'] = 'UPN_' + icd_data['UPN_id'].astype(str)
        print(f"Loaded ICD data for {len(icd_data)} patients")
        return icd_data
    except Exception as e:
        print(f"ERROR loading ICD data: {str(e)}")
        return pd.DataFrame()

def load_learn_data():
    print("Loading learn mock data...")
    try:
        learn_data = pd.read_csv('learn_mock_data.csv')
        learn_data.rename(columns={'patient_id': 'UPN_id'}, inplace=True)
        # Create UPN column from patient_id
        learn_data['UPN'] = 'UPN_' + learn_data['UPN_id'].astype(str)
        print(f"Loaded learn data for {len(learn_data)} patients")
        return learn_data
    except Exception as e:
        print(f"ERROR loading learn data: {str(e)}")
        return pd.DataFrame()

# Data Preparation
def prepare_data(cohort_data, patient_data, icd_data, learn_data):
    print("Preparing and merging datasets...")
    
    # Aggregate patient data by UPN
    patient_agg = patient_data.groupby('UPN').agg({
        'ANC': ['mean', 'min', 'max', 'std'],
        'PLT': ['mean', 'min', 'max', 'std'],
        '6MP_mg': ['mean', 'min', 'max', 'std'],
        '6MP_DI': ['mean', 'min', 'max', 'std'],
        'MTX_mg': ['mean', 'min', 'max', 'std'],
        'MTX_DI': ['mean', 'min', 'max', 'std'],
        'Cycle': ['max', 'count']
    }).reset_index()
    
    # Flatten multi-level column names
    patient_agg.columns = ['_'.join(col).strip('_') for col in patient_agg.columns.values]
    
    # Process ICD data
    # Extract main diagnosis and count comorbidities
    icd_data['main_diagnosis'] = icd_data['icd_codes'].str.strip('[]\'').str.split(',').str[0]
    icd_data['comorbidity_count'] = icd_data['comorbidities'].str.strip('[]\'').str.split(',').str.len()
    icd_data.loc[icd_data['comorbidities'] == '[]', 'comorbidity_count'] = 0
    
    # Count treatment phases
    icd_data['treatment_phases'] = icd_data['treatment_phases'].str.strip('[]\'')
    icd_data['induction_count'] = icd_data['treatment_phases'].str.count('induction')
    icd_data['maintenance_count'] = icd_data['treatment_phases'].str.count('maintenance')
    icd_data['consolidation_count'] = icd_data['treatment_phases'].str.count('consolidation')
    icd_data['relapse_count'] = icd_data['treatment_phases'].str.count('relapse')
    icd_data['palliative_count'] = icd_data['treatment_phases'].str.count('palliative')
    
    # Merge datasets
    print(f"Patient aggregated data shape: {patient_agg.shape}")

    # Debug patient_agg UPNs
    print(f"Sample UPNs in patient_agg: {patient_agg['UPN'].head().tolist()}")
    print(f"Sample UPNs in cohort_data: {cohort_data['UPN'].head().tolist()}")

    # Use outer join to ensure we don't lose data
    combined_data = cohort_data.merge(patient_agg, on='UPN', how='outer')
    print(f"After first merge: {combined_data.shape}")

    # Process ICD data to match UPN format
    if 'UPN' in icd_data.columns:
        icd_subset = icd_data[['UPN', 'main_diagnosis', 'comorbidity_count',
                            'induction_count', 'maintenance_count',
                            'consolidation_count', 'relapse_count',
                            'palliative_count']]
        combined_data = combined_data.merge(icd_subset, on='UPN', how='left')
        print(f"After ICD merge: {combined_data.shape}")
    else:
        print("WARNING: UPN column not found in ICD data")

    # Process learn data to match UPN format
    if 'UPN' in learn_data.columns:
        learn_subset = learn_data[['UPN', 'bmi', 'alt', 'ast', 'bilirubin',
                                'medication_a', 'medication_b', 'toxicity']]
        combined_data = combined_data.merge(learn_subset, on='UPN', how='left')
        print(f"After learn data merge: {combined_data.shape}")
    else:
        print("WARNING: UPN column not found in learn data")
    
    # Define treatment effectiveness based on clinical parameters
    # A patient is responding well to treatment if:
    # 1. Their ANC (Absolute Neutrophil Count) stays above 1.0 (indicating bone marrow recovery)
    # 2. Their PLT (Platelet count) stays above 150 (indicating good platelet production)
    # 3. They have low toxicity
    # 4. They have few relapses
    
    # Calculate ANC stability (percentage of measurements above 1.0)
    anc_stability = patient_data.groupby('UPN')['ANC'].apply(lambda x: (x > 1.0).mean()).reset_index()
    anc_stability.columns = ['UPN', 'anc_stability']
    
    # Calculate PLT stability (percentage of measurements above 150)
    plt_stability = patient_data.groupby('UPN')['PLT'].apply(lambda x: (x > 150).mean()).reset_index()
    plt_stability.columns = ['UPN', 'plt_stability']
    
    # Merge stability metrics
    combined_data = combined_data.merge(anc_stability, on='UPN', how='left')
    combined_data = combined_data.merge(plt_stability, on='UPN', how='left')
    
    # Define treatment effectiveness
    # A patient is responding well if:
    # - ANC stability > 0.7 (70% of measurements above threshold)
    # - PLT stability > 0.7 (70% of measurements above threshold)
    # - Low relapse count (≤ 1)
    # - Low toxicity (if available)

    # Create default values for stability if not already present
    if 'anc_stability' not in combined_data.columns:
        print("WARNING: anc_stability not found, creating default values")
        combined_data['anc_stability'] = 0.5

    if 'plt_stability' not in combined_data.columns:
        print("WARNING: plt_stability not found, creating default values")
        combined_data['plt_stability'] = 0.5

    # Create a mask for each condition, handling missing values
    anc_condition = combined_data['anc_stability'] > 0.7
    plt_condition = combined_data['plt_stability'] > 0.7

    # Handle relapse count if it exists
    if 'relapse_count' in combined_data.columns:
        relapse_condition = (combined_data['relapse_count'] <= 1) | combined_data['relapse_count'].isna()
    else:
        print("WARNING: relapse_count not found, assuming all patients meet this condition")
        relapse_condition = pd.Series(True, index=combined_data.index)

    # Combine conditions
    effectiveness_condition = anc_condition & plt_condition & relapse_condition

    # If toxicity data is available, include it in the effectiveness definition
    if 'toxicity' in combined_data.columns:
        toxicity_condition = (combined_data['toxicity'] == 0) | combined_data['toxicity'].isna()
        effectiveness_condition = effectiveness_condition & toxicity_condition

    # Set treatment effectiveness
    combined_data['treatment_effective'] = np.where(effectiveness_condition, 1, 0)

    print(f"Treatment effectiveness distribution: {combined_data['treatment_effective'].value_counts().to_dict()}")
    
    print(f"Final dataset has {len(combined_data)} patients and {combined_data.shape[1]} features")
    return combined_data

# Feature Engineering
def feature_engineering(data):
    print("Performing feature engineering...")
    
    # Convert categorical variables to numerical
    data['Sex'] = data['Sex'].map({'M': 1, 'F': 0})
    
    # One-hot encode Lineage
    lineage_dummies = pd.get_dummies(data['Lineage'], prefix='Lineage')
    data = pd.concat([data, lineage_dummies], axis=1)
    
    # One-hot encode main_diagnosis if it exists
    if 'main_diagnosis' in data.columns:
        diagnosis_dummies = pd.get_dummies(data['main_diagnosis'], prefix='Diagnosis')
        data = pd.concat([data, diagnosis_dummies], axis=1)
    
    # Create medication interaction feature if both exist
    if 'medication_a' in data.columns and 'medication_b' in data.columns:
        data['med_interaction'] = data['medication_a'] * data['medication_b']
    
    # Create treatment intensity features
    data['treatment_intensity_6MP'] = data['6MP_mg_mean'] * data['6MP_DI_mean']
    data['treatment_intensity_MTX'] = data['MTX_mg_mean'] * data['MTX_DI_mean']
    
    # Create ANC/PLT ratio features
    data['ANC_PLT_ratio'] = data['ANC_mean'] / data['PLT_mean']
    
    # Drop original categorical columns and any columns with too many missing values
    cols_to_drop = ['Lineage', 'main_diagnosis', 'UPN']
    data = data.drop(columns=[col for col in cols_to_drop if col in data.columns])
    
    # Handle missing values
    for col in data.columns:
        missing_pct = data[col].isna().mean()
        if missing_pct > 0.5:  # If more than 50% missing, drop the column
            data = data.drop(columns=[col])
    
    print(f"After feature engineering: {data.shape[1]} features")
    return data

# Model Training
def train_model(data):
    print("Training model...")

    # Check if we have enough data
    if len(data) < 10:
        print("ERROR: Not enough data to train a model (minimum 10 samples required).")
        return None, None, None, None

    # Check if treatment_effective column exists
    if 'treatment_effective' not in data.columns:
        print("ERROR: 'treatment_effective' column not found in data.")
        return None, None, None, None

    # Check if we have both positive and negative examples
    if data['treatment_effective'].nunique() < 2:
        print("ERROR: Need both positive and negative examples to train a classification model.")
        return None, None, None, None

    # Separate features and target
    X = data.drop(['treatment_effective'], axis=1)
    y = data['treatment_effective']

    # Make sure we have enough samples of each class
    min_samples = min(y.value_counts())
    if min_samples < 5:
        print(f"WARNING: Very few samples ({min_samples}) in the minority class.")

    # Split data
    try:
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    except ValueError as e:
        print(f"ERROR splitting data: {str(e)}")
        # Try without stratification if we have too few samples
        try:
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        except Exception as e2:
            print(f"ERROR splitting data (second attempt): {str(e2)}")
            return None, None, None, None
    
    # Define preprocessing for numeric columns
    numeric_features = X.select_dtypes(include=['int64', 'float64']).columns
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    # Combine preprocessing steps
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features)
        ])
    
    # Create and train model pipeline
    model_rf = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    
    model_gb = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', GradientBoostingClassifier(n_estimators=100, random_state=42))
    ])
    
    # Train models
    model_rf.fit(X_train, y_train)
    model_gb.fit(X_train, y_train)
    
    # Evaluate models
    print("\nRandom Forest Model Evaluation:")
    evaluate_model(model_rf, X_test, y_test)
    
    print("\nGradient Boosting Model Evaluation:")
    evaluate_model(model_gb, X_test, y_test)
    
    # Feature importance for Random Forest
    feature_importance = model_rf.named_steps['classifier'].feature_importances_
    feature_names = X.columns
    
    # Sort feature importance
    indices = np.argsort(feature_importance)[::-1]
    
    # Print feature ranking
    print("\nFeature ranking (top 15):")
    for i in range(min(15, len(feature_names))):
        print(f"{i+1}. {feature_names[indices[i]]} ({feature_importance[indices[i]]:.4f})")
    
    # Plot feature importance
    plt.figure(figsize=(12, 8))
    plt.title("Feature Importance")
    plt.bar(range(min(15, len(feature_names))), 
            feature_importance[indices[:15]],
            align="center")
    plt.xticks(range(min(15, len(feature_names))), 
               [feature_names[i] for i in indices[:15]], 
               rotation=90)
    plt.tight_layout()
    plt.savefig('feature_importance.png')
    
    return model_rf, model_gb, X_test, y_test

def evaluate_model(model, X_test, y_test):
    if model is None or X_test is None or y_test is None:
        print("ERROR: Cannot evaluate model - model or test data is None.")
        return

    try:
        # Make predictions
        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)[:, 1]

        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        conf_matrix = confusion_matrix(y_test, y_pred)

        # Print results
        print(f"Accuracy: {accuracy:.4f}")
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred))

        print("\nConfusion Matrix:")
        print(conf_matrix)

        # Calculate ROC curve
        fpr, tpr, _ = roc_curve(y_test, y_prob)
        roc_auc = auc(fpr, tpr)
        print(f"ROC AUC: {roc_auc:.4f}")

        # Plot ROC curve
        plt.figure(figsize=(8, 6))
        plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (area = {roc_auc:.2f})')
        plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
        plt.xlim([0.0, 1.0])
        plt.ylim([0.0, 1.05])
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.title('Receiver Operating Characteristic')
        plt.legend(loc="lower right")
        plt.savefig('roc_curve.png')
    except Exception as e:
        print(f"ERROR evaluating model: {str(e)}")

def analyze_treatment_patterns(data, patient_data):
    print("\nAnalyzing treatment patterns...")

    try:
        # Check if data contains required columns
        if 'UPN' not in data.columns or 'treatment_effective' not in data.columns:
            print("ERROR: Required columns not found in data. Cannot analyze treatment patterns.")
            return pd.DataFrame(), pd.DataFrame()

        # Merge treatment effectiveness with patient data
        effectiveness_by_upn = data[['UPN', 'treatment_effective']]
        patient_with_effectiveness = patient_data.merge(effectiveness_by_upn, on='UPN', how='left')

        # Analyze drug dosage patterns by effectiveness
        effective_patients = patient_with_effectiveness[patient_with_effectiveness['treatment_effective'] == 1]
        ineffective_patients = patient_with_effectiveness[patient_with_effectiveness['treatment_effective'] == 0]

        print(f"Effective treatments: {len(effective_patients.UPN.unique())} patients")
        print(f"Ineffective treatments: {len(ineffective_patients.UPN.unique())} patients")

        # Check if we have enough data to analyze
        if len(effective_patients) == 0:
            print("WARNING: No effective treatments found. Cannot analyze effective treatment patterns.")

        if len(ineffective_patients) == 0:
            print("WARNING: No ineffective treatments found. Cannot analyze ineffective treatment patterns.")

        if len(effective_patients) == 0 or len(ineffective_patients) == 0:
            return effective_patients, ineffective_patients
    except Exception as e:
        print(f"ERROR analyzing treatment patterns: {str(e)}")
        return pd.DataFrame(), pd.DataFrame()
    
    # Compare 6MP dosage
    print("\n6MP Dosage Comparison:")
    print(f"Effective treatments - Mean 6MP dose: {effective_patients['6MP_mg'].mean():.2f} mg")
    print(f"Ineffective treatments - Mean 6MP dose: {ineffective_patients['6MP_mg'].mean():.2f} mg")
    
    # Compare MTX dosage
    print("\nMTX Dosage Comparison:")
    print(f"Effective treatments - Mean MTX dose: {effective_patients['MTX_mg'].mean():.2f} mg")
    print(f"Ineffective treatments - Mean MTX dose: {ineffective_patients['MTX_mg'].mean():.2f} mg")
    
    # Plot dosage distributions
    plt.figure(figsize=(12, 6))
    
    plt.subplot(1, 2, 1)
    sns.histplot(data=effective_patients, x='6MP_mg', color='green', alpha=0.5, label='Effective')
    sns.histplot(data=ineffective_patients, x='6MP_mg', color='red', alpha=0.5, label='Ineffective')
    plt.title('6MP Dosage Distribution')
    plt.xlabel('6MP Dose (mg)')
    plt.legend()
    
    plt.subplot(1, 2, 2)
    sns.histplot(data=effective_patients, x='MTX_mg', color='green', alpha=0.5, label='Effective')
    sns.histplot(data=ineffective_patients, x='MTX_mg', color='red', alpha=0.5, label='Ineffective')
    plt.title('MTX Dosage Distribution')
    plt.xlabel('MTX Dose (mg)')
    plt.legend()
    
    plt.tight_layout()
    plt.savefig('dosage_distribution.png')
    
    # Analyze blood count patterns
    plt.figure(figsize=(12, 6))
    
    plt.subplot(1, 2, 1)
    sns.histplot(data=effective_patients, x='ANC', color='green', alpha=0.5, label='Effective')
    sns.histplot(data=ineffective_patients, x='ANC', color='red', alpha=0.5, label='Ineffective')
    plt.title('ANC Distribution')
    plt.xlabel('Absolute Neutrophil Count')
    plt.legend()
    
    plt.subplot(1, 2, 2)
    sns.histplot(data=effective_patients, x='PLT', color='green', alpha=0.5, label='Effective')
    sns.histplot(data=ineffective_patients, x='PLT', color='red', alpha=0.5, label='Ineffective')
    plt.title('Platelet Count Distribution')
    plt.xlabel('Platelet Count')
    plt.legend()
    
    plt.tight_layout()
    plt.savefig('blood_count_distribution.png')
    
    return effective_patients, ineffective_patients

# Main function to run the model
def main():
    # Load all data
    cohort_data = load_cohort_data()
    patient_data = load_patient_data()
    icd_data = load_icd_data()
    learn_data = load_learn_data()

    if cohort_data.empty:
        print("ERROR: No cohort demographic data loaded. Cannot proceed with analysis.")
        return {
            'total_patients': 0,
            'effective_treatments': 0,
            'ineffective_treatments': 0,
            'effectiveness_rate': 0
        }

    if patient_data.empty:
        print("ERROR: No patient data loaded. Cannot proceed with analysis.")
        return {
            'total_patients': 0,
            'effective_treatments': 0,
            'ineffective_treatments': 0,
            'effectiveness_rate': 0
        }

    # Prepare and combine data
    combined_data = prepare_data(cohort_data, patient_data, icd_data, learn_data)

    if len(combined_data) == 0:
        print("ERROR: No data after merging. Check that UPN formats match across datasets.")
        return {
            'total_patients': 0,
            'effective_treatments': 0,
            'ineffective_treatments': 0,
            'effectiveness_rate': 0
        }

    # Feature engineering
    processed_data = feature_engineering(combined_data)

    if 'treatment_effective' not in processed_data.columns:
        print("ERROR: 'treatment_effective' column not found. Cannot train model.")
        return {
            'total_patients': len(combined_data),
            'effective_treatments': 0,
            'ineffective_treatments': 0,
            'effectiveness_rate': 0
        }

    # Train model
    try:
        model_rf, model_gb, X_test, y_test = train_model(processed_data)

        # Check if model training was successful
        if model_rf is None or model_gb is None:
            print("WARNING: Model training failed. Skipping model evaluation.")

            # We can still analyze treatment patterns even if model training failed
            effective_patients, ineffective_patients = analyze_treatment_patterns(combined_data, patient_data)

            print("\nBasic analysis complete without model training.")

            # Return summary of treatment effectiveness
            return {
                'total_patients': len(combined_data),
                'effective_treatments': combined_data['treatment_effective'].sum(),
                'ineffective_treatments': len(combined_data) - combined_data['treatment_effective'].sum(),
                'effectiveness_rate': combined_data['treatment_effective'].mean() * 100,
                'model_status': 'failed'
            }
        else:
            # Analyze treatment patterns
            effective_patients, ineffective_patients = analyze_treatment_patterns(combined_data, patient_data)

            print("\nAnalysis complete. Results saved to PNG files.")

            # Return summary of treatment effectiveness
            return {
                'total_patients': len(combined_data),
                'effective_treatments': combined_data['treatment_effective'].sum(),
                'ineffective_treatments': len(combined_data) - combined_data['treatment_effective'].sum(),
                'effectiveness_rate': combined_data['treatment_effective'].mean() * 100,
                'model_status': 'success'
            }
    except Exception as e:
        print(f"ERROR during model training or analysis: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'total_patients': len(combined_data) if 'combined_data' in locals() else 0,
            'error': str(e),
            'status': 'failed'
        }

if __name__ == "__main__":
    results = main()
    print("\nTreatment Effectiveness Summary:")
    print(f"Total patients analyzed: {results['total_patients']}")
    print(f"Patients with effective treatment: {results['effective_treatments']} ({results['effectiveness_rate']:.1f}%)")
    print(f"Patients with ineffective treatment: {results['ineffective_treatments']} ({100-results['effectiveness_rate']:.1f}%)")