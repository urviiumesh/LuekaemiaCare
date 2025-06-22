import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import sys
import os

def visualize_patient_treatment(upn):
    """
    Visualize treatment data for a specific patient

    Parameters:
    -----------
    upn : str
        Patient UPN (e.g., 'UPN_1')

    Returns:
    --------
    dict or None
        Dictionary with effectiveness metrics if successful, None if failed
    """
    try:
        # Check if patient file exists
        file_path = os.path.join('Individual patient maintenance therapy data', f'{upn}.csv')
        if not os.path.exists(file_path):
            print(f"Error: Patient file {file_path} not found")
            return None

        print(f"Loading data for patient {upn}...")

        # Load patient data
        patient_data = pd.read_csv(file_path)

        # Load demographic data
        demo_data = pd.read_csv('Cohort_Demographics.csv')
        patient_demo = demo_data[demo_data['UPN'] == upn]

        if patient_demo.empty:
            print(f"Error: Patient {upn} not found in demographic data")
            return None

        print(f"Successfully loaded data for patient {upn}")

        # Create figure with subplots
        try:
            fig, axes = plt.subplots(3, 1, figsize=(12, 15))
            fig.suptitle(f"Treatment Analysis for {upn}", fontsize=16)

            # Add patient demographics
            demo_text = (f"Age: {patient_demo['Age'].values[0]}, "
                        f"Sex: {patient_demo['Sex'].values[0]}, "
                        f"Lineage: {patient_demo['Lineage'].values[0]}, "
                        f"WBC Count: {patient_demo['WBC_Count'].values[0]}")
            fig.text(0.5, 0.95, demo_text, ha='center', fontsize=12)

            # Plot 1: Blood counts over time
            ax1 = axes[0]
            ax1.set_title("Blood Counts Over Time")
            ax1.plot(patient_data['Weeks'], patient_data['ANC'], 'b-', label='ANC')
            ax1.axhline(y=1.0, color='b', linestyle='--', alpha=0.5, label='ANC Threshold (1.0)')
            ax1.set_ylabel('ANC', color='b')
            ax1.tick_params(axis='y', labelcolor='b')

            ax1_twin = ax1.twinx()
            ax1_twin.plot(patient_data['Weeks'], patient_data['PLT'], 'r-', label='PLT')
            ax1_twin.axhline(y=150, color='r', linestyle='--', alpha=0.5, label='PLT Threshold (150)')
            ax1_twin.set_ylabel('PLT', color='r')
            ax1_twin.tick_params(axis='y', labelcolor='r')

            # Combine legends
            lines1, labels1 = ax1.get_legend_handles_labels()
            lines2, labels2 = ax1_twin.get_legend_handles_labels()
            ax1.legend(lines1 + lines2, labels1 + labels2, loc='upper right')

            # Plot 2: Medication dosage over time
            ax2 = axes[1]
            ax2.set_title("Medication Dosage Over Time")
            ax2.plot(patient_data['Weeks'], patient_data['6MP_mg'], 'g-', label='6MP (mg)')
            ax2.set_ylabel('6MP Dosage (mg)', color='g')
            ax2.tick_params(axis='y', labelcolor='g')

            ax2_twin = ax2.twinx()
            ax2_twin.plot(patient_data['Weeks'], patient_data['MTX_mg'], 'm-', label='MTX (mg)')
            ax2_twin.set_ylabel('MTX Dosage (mg)', color='m')
            ax2_twin.tick_params(axis='y', labelcolor='m')

            # Combine legends
            lines1, labels1 = ax2.get_legend_handles_labels()
            lines2, labels2 = ax2_twin.get_legend_handles_labels()
            ax2.legend(lines1 + lines2, labels1 + labels2, loc='upper right')

            # Plot 3: Dose intensity over time
            ax3 = axes[2]
            ax3.set_title("Dose Intensity Over Time")
            ax3.plot(patient_data['Weeks'], patient_data['6MP_DI'], 'g-', label='6MP DI')
            ax3.plot(patient_data['Weeks'], patient_data['MTX_DI'], 'm-', label='MTX DI')
            ax3.set_xlabel('Weeks')
            ax3.set_ylabel('Dose Intensity (%)')
            ax3.legend()

            # Calculate treatment effectiveness metrics
            anc_stability = (patient_data['ANC'] > 1.0).mean() * 100
            plt_stability = (patient_data['PLT'] > 150).mean() * 100

            # Add effectiveness metrics as text
            effectiveness_text = (
                f"ANC Stability: {anc_stability:.1f}% of measurements above threshold\n"
                f"PLT Stability: {plt_stability:.1f}% of measurements above threshold\n"
                f"Treatment likely {'effective' if anc_stability > 70 and plt_stability > 70 else 'ineffective'} "
                f"based on blood count stability"
            )
            fig.text(0.5, 0.03, effectiveness_text, ha='center', fontsize=12, bbox=dict(facecolor='white', alpha=0.8))

            plt.tight_layout(rect=[0, 0.05, 1, 0.95])
            plt.savefig(f'{upn}_treatment_analysis.png')
            plt.show()

            print(f"Analysis for {upn} complete. Results saved to {upn}_treatment_analysis.png")

            # Return effectiveness assessment
            return {
                'upn': upn,
                'anc_stability': anc_stability,
                'plt_stability': plt_stability,
                'likely_effective': anc_stability > 70 and plt_stability > 70
            }
        except Exception as e:
            print(f"Error creating visualizations: {str(e)}")

            # Even if visualization fails, we can still return the effectiveness assessment
            try:
                anc_stability = (patient_data['ANC'] > 1.0).mean() * 100
                plt_stability = (patient_data['PLT'] > 150).mean() * 100

                print(f"Basic analysis for {upn}:")
                print(f"ANC Stability: {anc_stability:.1f}%")
                print(f"PLT Stability: {plt_stability:.1f}%")

                return {
                    'upn': upn,
                    'anc_stability': anc_stability,
                    'plt_stability': plt_stability,
                    'likely_effective': anc_stability > 70 and plt_stability > 70
                }
            except Exception as e2:
                print(f"Error calculating effectiveness metrics: {str(e2)}")
                return None
    except Exception as e:
        print(f"Error loading patient data: {str(e)}")
        return None

if __name__ == "__main__":
    try:
        if len(sys.argv) > 1:
            upn = sys.argv[1]
        else:
            upn = input("Enter patient UPN (e.g., UPN_1): ")

        result = visualize_patient_treatment(upn)

        if result:
            print("\nTreatment Effectiveness Summary:")
            print(f"ANC Stability: {result['anc_stability']:.1f}%")
            print(f"PLT Stability: {result['plt_stability']:.1f}%")
            print(f"Treatment Assessment: {'Likely Effective' if result['likely_effective'] else 'Likely Ineffective'}")
        else:
            print(f"\nFailed to analyze patient {upn}.")
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()