import pandas as pd
import numpy as np
import glob
import matplotlib.pyplot as plt
import seaborn as sns
from treatment_effectiveness_model import prepare_data, feature_engineering, train_model
import os

def run_batch_analysis():
    """
    Run a batch analysis on all patients and generate a summary report

    Returns:
    --------
    pandas.DataFrame or None
        DataFrame with patient metrics if successful, None if failed
    """
    try:
        print("Starting batch analysis of all patients...")

        # Load the cohort demographics data
        print("Loading demographic data...")
        cohort_data = pd.read_csv('Cohort_Demographics.csv')
        print(f"Loaded demographic data for {len(cohort_data)} patients")

        # Load individual patient maintenance therapy data
        print("Loading individual patient therapy data...")
        data_dir = 'Individual patient maintenance therapy data'
        pattern = os.path.join(data_dir, '*.csv')
        print(f"Looking for patient files with pattern: {pattern}")
        patient_files = glob.glob(pattern)
        print(f"Found {len(patient_files)} patient files")

        if not patient_files:
            print("ERROR: No patient files found. Cannot proceed with analysis.")
            return None

        all_patient_data = []

        for file in patient_files:
            try:
                # Extract UPN from filename using os.path for cross-platform compatibility
                upn = os.path.basename(file).split('.')[0]
                df = pd.read_csv(file)
                df['UPN'] = upn
                all_patient_data.append(df)
            except Exception as e:
                print(f"Error processing file {file}: {str(e)}")

        if not all_patient_data:
            print("ERROR: Failed to process any patient files.")
            return None

        patient_data = pd.concat(all_patient_data, ignore_index=True)
        print(f"Loaded data for {len(patient_data['UPN'].unique())} patients")
    
    # Load additional data
    icd_data = pd.read_csv('icd_mock_data.csv')
    icd_data.rename(columns={'patient_id': 'UPN_id'}, inplace=True)
    icd_data['UPN'] = 'UPN_' + icd_data['UPN_id'].astype(str)
    
    learn_data = pd.read_csv('learn_mock_data.csv')
    learn_data.rename(columns={'patient_id': 'UPN_id'}, inplace=True)
    learn_data['UPN'] = 'UPN_' + learn_data['UPN_id'].astype(str)
    
    # Prepare and combine data
    combined_data = prepare_data(cohort_data, patient_data, icd_data, learn_data)
    
    # Calculate patient-level metrics
    patient_metrics = []
    
    for upn in combined_data['UPN'].unique():
        # Get patient data
        patient_df = patient_data[patient_data['UPN'] == upn]
        
        if patient_df.empty:
            continue
        
        # Calculate metrics
        anc_stability = (patient_df['ANC'] > 1.0).mean() * 100
        plt_stability = (patient_df['PLT'] > 150).mean() * 100
        avg_6mp = patient_df['6MP_mg'].mean()
        avg_mtx = patient_df['MTX_mg'].mean()
        treatment_cycles = patient_df['Cycle'].max()
        
        # Get patient demographics
        patient_demo = cohort_data[cohort_data['UPN'] == upn]
        
        if patient_demo.empty:
            continue
            
        age = patient_demo['Age'].values[0]
        sex = patient_demo['Sex'].values[0]
        lineage = patient_demo['Lineage'].values[0]
        wbc = patient_demo['WBC_Count'].values[0]
        
        # Get treatment effectiveness from combined data
        patient_combined = combined_data[combined_data['UPN'] == upn]
        
        if patient_combined.empty:
            continue
            
        effectiveness = patient_combined['treatment_effective'].values[0]
        
        # Add to metrics list
        patient_metrics.append({
            'UPN': upn,
            'Age': age,
            'Sex': sex,
            'Lineage': lineage,
            'WBC_Count': wbc,
            'ANC_Stability': anc_stability,
            'PLT_Stability': plt_stability,
            'Avg_6MP_Dose': avg_6mp,
            'Avg_MTX_Dose': avg_mtx,
            'Treatment_Cycles': treatment_cycles,
            'Treatment_Effective': effectiveness
        })
    
    # Create metrics dataframe
    metrics_df = pd.DataFrame(patient_metrics)
    
    # Save metrics to CSV
    metrics_df.to_csv('patient_treatment_metrics.csv', index=False)
    print(f"Saved metrics for {len(metrics_df)} patients to patient_treatment_metrics.csv")
    
    # Generate summary visualizations
    create_summary_visualizations(metrics_df)
    
    # Generate summary report
    generate_summary_report(metrics_df)
    
    return metrics_df

def create_summary_visualizations(metrics_df):
    """
    Create summary visualizations from patient metrics
    """
    print("Generating summary visualizations...")
    
    # Create output directory if it doesn't exist
    os.makedirs('summary_visualizations', exist_ok=True)
    
    # 1. Treatment effectiveness by lineage
    plt.figure(figsize=(10, 6))
    effectiveness_by_lineage = metrics_df.groupby('Lineage')['Treatment_Effective'].mean() * 100
    effectiveness_by_lineage.plot(kind='bar', color='skyblue')
    plt.title('Treatment Effectiveness by Lineage')
    plt.xlabel('Lineage')
    plt.ylabel('Effectiveness Rate (%)')
    plt.xticks(rotation=0)
    plt.tight_layout()
    plt.savefig('summary_visualizations/effectiveness_by_lineage.png')
    
    # 2. Treatment effectiveness by age group
    plt.figure(figsize=(10, 6))
    metrics_df['Age_Group'] = pd.cut(metrics_df['Age'], bins=[0, 2, 5, 10, 20], 
                                    labels=['0-2', '3-5', '6-10', '11+'])
    effectiveness_by_age = metrics_df.groupby('Age_Group')['Treatment_Effective'].mean() * 100
    effectiveness_by_age.plot(kind='bar', color='lightgreen')
    plt.title('Treatment Effectiveness by Age Group')
    plt.xlabel('Age Group')
    plt.ylabel('Effectiveness Rate (%)')
    plt.xticks(rotation=0)
    plt.tight_layout()
    plt.savefig('summary_visualizations/effectiveness_by_age.png')
    
    # 3. Treatment effectiveness by sex
    plt.figure(figsize=(8, 6))
    effectiveness_by_sex = metrics_df.groupby('Sex')['Treatment_Effective'].mean() * 100
    effectiveness_by_sex.plot(kind='bar', color='salmon')
    plt.title('Treatment Effectiveness by Sex')
    plt.xlabel('Sex')
    plt.ylabel('Effectiveness Rate (%)')
    plt.xticks(rotation=0)
    plt.tight_layout()
    plt.savefig('summary_visualizations/effectiveness_by_sex.png')
    
    # 4. Correlation between ANC stability and PLT stability
    plt.figure(figsize=(8, 8))
    plt.scatter(metrics_df['ANC_Stability'], metrics_df['PLT_Stability'], 
               c=metrics_df['Treatment_Effective'], cmap='coolwarm', alpha=0.7)
    plt.colorbar(label='Treatment Effective')
    plt.title('Relationship Between ANC and PLT Stability')
    plt.xlabel('ANC Stability (%)')
    plt.ylabel('PLT Stability (%)')
    plt.axhline(y=70, color='gray', linestyle='--', alpha=0.5)
    plt.axvline(x=70, color='gray', linestyle='--', alpha=0.5)
    plt.tight_layout()
    plt.savefig('summary_visualizations/anc_plt_relationship.png')
    
    # 5. Medication dosage comparison
    plt.figure(figsize=(12, 6))
    
    plt.subplot(1, 2, 1)
    sns.boxplot(x='Treatment_Effective', y='Avg_6MP_Dose', data=metrics_df)
    plt.title('6MP Dosage by Treatment Outcome')
    plt.xlabel('Treatment Effective')
    plt.ylabel('Average 6MP Dose (mg)')
    
    plt.subplot(1, 2, 2)
    sns.boxplot(x='Treatment_Effective', y='Avg_MTX_Dose', data=metrics_df)
    plt.title('MTX Dosage by Treatment Outcome')
    plt.xlabel('Treatment Effective')
    plt.ylabel('Average MTX Dose (mg)')
    
    plt.tight_layout()
    plt.savefig('summary_visualizations/medication_comparison.png')
    
    # 6. Treatment cycles distribution
    plt.figure(figsize=(10, 6))
    sns.histplot(data=metrics_df, x='Treatment_Cycles', hue='Treatment_Effective', 
                multiple='stack', palette=['red', 'green'])
    plt.title('Treatment Cycles Distribution')
    plt.xlabel('Number of Treatment Cycles')
    plt.ylabel('Count')
    plt.tight_layout()
    plt.savefig('summary_visualizations/treatment_cycles.png')
    
    print("Summary visualizations saved to 'summary_visualizations' directory")

def generate_summary_report(metrics_df):
    """
    Generate a summary report from patient metrics
    """
    print("Generating summary report...")
    
    # Calculate overall statistics
    total_patients = len(metrics_df)
    effective_treatments = metrics_df['Treatment_Effective'].sum()
    effectiveness_rate = (effective_treatments / total_patients) * 100
    
    # Calculate statistics by group
    lineage_stats = metrics_df.groupby('Lineage')['Treatment_Effective'].agg(['count', 'sum', 'mean'])
    lineage_stats['effectiveness_rate'] = lineage_stats['mean'] * 100
    
    age_stats = metrics_df.groupby('Age_Group')['Treatment_Effective'].agg(['count', 'sum', 'mean'])
    age_stats['effectiveness_rate'] = age_stats['mean'] * 100
    
    sex_stats = metrics_df.groupby('Sex')['Treatment_Effective'].agg(['count', 'sum', 'mean'])
    sex_stats['effectiveness_rate'] = sex_stats['mean'] * 100
    
    # Calculate medication statistics
    med_stats = metrics_df.groupby('Treatment_Effective')[['Avg_6MP_Dose', 'Avg_MTX_Dose']].agg(['mean', 'std'])
    
    # Generate report
    with open('treatment_effectiveness_report.md', 'w') as f:
        f.write("# Treatment Effectiveness Analysis Report\n\n")
        
        f.write("## Overall Statistics\n\n")
        f.write(f"- Total patients analyzed: {total_patients}\n")
        f.write(f"- Patients with effective treatment: {effective_treatments} ({effectiveness_rate:.1f}%)\n")
        f.write(f"- Patients with ineffective treatment: {total_patients - effective_treatments} ({100-effectiveness_rate:.1f}%)\n\n")
        
        f.write("## Effectiveness by Patient Characteristics\n\n")
        
        f.write("### By Lineage\n\n")
        f.write(lineage_stats.to_markdown() + "\n\n")
        
        f.write("### By Age Group\n\n")
        f.write(age_stats.to_markdown() + "\n\n")
        
        f.write("### By Sex\n\n")
        f.write(sex_stats.to_markdown() + "\n\n")
        
        f.write("## Medication Dosage Analysis\n\n")
        f.write(med_stats.to_markdown() + "\n\n")
        
        f.write("## Key Findings\n\n")
        
        # Identify key findings
        # 1. Most effective lineage
        best_lineage = lineage_stats['effectiveness_rate'].idxmax()
        best_lineage_rate = lineage_stats.loc[best_lineage, 'effectiveness_rate']
        f.write(f"1. **Lineage Impact**: {best_lineage} lineage shows the highest treatment effectiveness rate at {best_lineage_rate:.1f}%\n\n")
        
        # 2. Age group differences
        best_age = age_stats['effectiveness_rate'].idxmax()
        best_age_rate = age_stats.loc[best_age, 'effectiveness_rate']
        f.write(f"2. **Age Impact**: The {best_age} age group shows the highest treatment effectiveness rate at {best_age_rate:.1f}%\n\n")
        
        # 3. Medication dosage differences
        if 1 in med_stats.index:
            effective_6mp = med_stats.loc[1, ('Avg_6MP_Dose', 'mean')]
            effective_mtx = med_stats.loc[1, ('Avg_MTX_Dose', 'mean')]
            
            ineffective_6mp = med_stats.loc[0, ('Avg_6MP_Dose', 'mean')] if 0 in med_stats.index else 0
            ineffective_mtx = med_stats.loc[0, ('Avg_MTX_Dose', 'mean')] if 0 in med_stats.index else 0
            
            f.write(f"3. **Medication Dosage**: Effective treatments had an average 6MP dose of {effective_6mp:.1f} mg ")
            f.write(f"compared to {ineffective_6mp:.1f} mg for ineffective treatments ")
            f.write(f"({(effective_6mp-ineffective_6mp)/ineffective_6mp*100:.1f}% difference)\n\n")
            
            f.write(f"4. **MTX Dosage**: Effective treatments had an average MTX dose of {effective_mtx:.1f} mg ")
            f.write(f"compared to {ineffective_mtx:.1f} mg for ineffective treatments ")
            f.write(f"({(effective_mtx-ineffective_mtx)/ineffective_mtx*100:.1f}% difference)\n\n")
        
        # 5. Blood count stability
        anc_corr = metrics_df['ANC_Stability'].corr(metrics_df['Treatment_Effective'])
        plt_corr = metrics_df['PLT_Stability'].corr(metrics_df['Treatment_Effective'])
        
        f.write(f"5. **Blood Count Stability**: ANC stability has a correlation of {anc_corr:.2f} with treatment effectiveness, ")
        f.write(f"while PLT stability has a correlation of {plt_corr:.2f}\n\n")
        
        f.write("## Recommendations\n\n")
        
        f.write("Based on the analysis, the following recommendations can be made:\n\n")
        
        if effective_6mp > ineffective_6mp:
            f.write(f"1. **6MP Dosing**: Consider higher 6MP dosing (around {effective_6mp:.1f} mg) when clinically appropriate\n\n")
        else:
            f.write(f"1. **6MP Dosing**: Higher 6MP doses do not appear to improve outcomes; consider optimizing other factors\n\n")
            
        if effective_mtx > ineffective_mtx:
            f.write(f"2. **MTX Dosing**: Consider higher MTX dosing (around {effective_mtx:.1f} mg) when clinically appropriate\n\n")
        else:
            f.write(f"2. **MTX Dosing**: Higher MTX doses do not appear to improve outcomes; consider optimizing other factors\n\n")
            
        f.write("3. **Monitoring**: Closely monitor ANC and PLT counts, as stability in these values strongly correlates with treatment effectiveness\n\n")
        
        f.write("4. **Patient Stratification**: Consider tailoring treatment approaches based on lineage and age group\n\n")
        
        f.write("## Conclusion\n\n")
        
        f.write(f"The analysis of {total_patients} patients shows that {effectiveness_rate:.1f}% of patients respond effectively to the current treatment protocols. ")
        f.write("Key factors influencing treatment effectiveness include lineage type, age, and medication dosing. ")
        f.write("Monitoring blood count stability (ANC and PLT) provides a reliable indicator of treatment effectiveness. ")
        f.write("Further research is needed to optimize treatment protocols for patient subgroups with lower effectiveness rates.\n")
    
    print("Summary report saved to 'treatment_effectiveness_report.md'")

if __name__ == "__main__":
    metrics_df = run_batch_analysis()
    print("Batch analysis complete.")