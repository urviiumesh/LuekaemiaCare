import firebase_admin
from firebase_admin import credentials,db
from cryptography.fernet import Fernet
import base64
import os

# Generate or load encryption key
ENCRYPTION_KEY_FILE = 'encryption.key'

def generate_or_load_key():
    if os.path.exists(ENCRYPTION_KEY_FILE):
        with open(ENCRYPTION_KEY_FILE, 'rb') as key_file:
            return key_file.read()
    else:
        key = Fernet.generate_key()
        with open(ENCRYPTION_KEY_FILE, 'wb') as key_file:
            key_file.write(key)
        return key

ENCRYPTION_KEY = generate_or_load_key()
cipher_suite = Fernet(ENCRYPTION_KEY)

def encrypt_data(data):
    if isinstance(data, dict):
        return {k: encrypt_data(v) for k, v in data.items()}
    elif isinstance(data, str):
        return cipher_suite.encrypt(data.encode()).decode()
    elif isinstance(data, (int, float)):
        return cipher_suite.encrypt(str(data).encode()).decode()
    return data

def decrypt_data(data):
    if isinstance(data, dict):
        return {k: decrypt_data(v) for k, v in data.items()}
    elif isinstance(data, str):
        try:
            return cipher_suite.decrypt(data.encode()).decode()
        except:
            return data
    return data

cred = credentials.Certificate('credentials.json')
firebase_admin.initialize_app(cred,{"databaseURL" : "https://meghalaya-5b3e5-default-rtdb.firebaseio.com/"})

# Add test form data
ref = db.reference('form_data')
ref.set({
    'submission1': encrypt_data({
        'name': 'Alice Johnson',
        'age': 35,
        'email': 'alice@example.com',
        'message': 'Requesting consultation for treatment options'
    }),
    'submission2': encrypt_data({
        'name': 'Bob Wilson',
        'age': 42,
        'email': 'bob@example.com',
        'message': 'Follow-up inquiry about medication'
    })
})

# Add test video data
ref = db.reference('videos')
ref.set({
    'video1': {
        'filename': 'patient_consultation.mp4',
        'filepath': 'uploads/patient_consultation.mp4',
        'uploaded_at': '2024-04-14'
    },
    'video2': {
        'filename': 'treatment_procedure.mp4',
        'filepath': 'uploads/treatment_procedure.mp4',
        'uploaded_at': '2024-04-14'
    }
})

# Add test appointment data
ref = db.reference('appointments')
ref.set({
    'appointment1': {
        'patientName': 'John Doe',
        'date': '2024-04-15',
        'time': '10:00 AM',
        'reason': 'Regular Checkup'
    },
    'appointment2': {
        'patientName': 'Jane Smith',
        'date': '2024-04-16',
        'time': '2:30 PM',
        'reason': 'Follow-up'
    }
})

ref = db.reference('prediction-model')
ref.set({
  'combined-dosage': 250,
  'combined-leukemia-stage': 'Intermediate',
  'combined-prior-treatment': 'Partial',
  'combined-anc-mean': 1800,
  'combined-plt-mean': 150000,
  'combined-anc-stability': 85,
  'combined-plt-stability': 90,
  'combined-patient-consent': 'Yes',
  'combined-financial-burden': 0.4,
  'combined-compliance': 'Yes',
  'combined-overtreatment': 0.2,

  'combined-ethical-result': 'Ethically Acceptable with Monitoring',
  'combined-ethical-confidence': 'High',
  'combined-effectiveness-result': 'Likely Effective',
  'combined-effectiveness-probability': '0.87',
  'combined-recommendation': 'Proceed with Treatment Under Regular Monitoring'
})

ref = db.reference('dqn')
ref.set({
  #Inputs
  'wbc-count': 'double',
  'anc': 'double',
  'platelet-count': 'double',
  'hemoglobin-level': 'double',
  'disease-stage': 'double',
  'survival-probability': 'double',

  #output
  'predicted-condition': 'string',
  'recommended-treatment': 'string',
  'treatment-reward-score': 'double'
})
database = db