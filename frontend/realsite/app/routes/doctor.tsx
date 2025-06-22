import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const PatientDashboard = () => {
  const navigate = useNavigate();

  // Function to generate random 6-digit patient ID
  const generatePatientId = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Set patient ID on component mount
  useEffect(() => {
    setFormData(prevData => ({
      ...prevData,
      patient_id: generatePatientId()
    }));
  }, []);
  
  // Dark mode state - initialize from localStorage or default to true
  const [darkMode, setDarkMode] = useState(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode !== null ? savedMode === 'true' : true;
    }
    return true; // Default to dark mode
  });
  
  // Toggle dark mode function
  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('darkMode', String(newMode));
      }
      return newMode;
    });
  };

  // Function to navigate to doctor dashboard
  const navigateToDoctorDashboard = () => {
    navigate('/doctor');
  };

  // Function to navigate to appointments
  const navigateToAppointments = () => {
    navigate('/appointment');
  };

  // State for image analysis
  const [selectedImage, setSelectedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [leukemiaPrediction, setLeukemiaPrediction] = useState('-');
  const [leukemiaConfidence, setLeukemiaConfidence] = useState('-');
  const [probabilities, setProbabilities] = useState([]);
  const [highestProbability, setHighestProbability] = useState({key: '', value: 0});

  // State for treatment analysis form
const [formData, setFormData] = useState({
  // Treatment details
  treatment_type: 'chemotherapy',
  dosage: '',
  leukemia_stage: 'early',
  prior_treatment_history: 'none',
  Is_Responding: '1',
  
  // Patient info
  patient_age: '',
  patient_id: '',
  
  // Blood counts
  ANC_mean: '',
  PLT_mean: '',
  anc_stability: '',
  plt_stability: '',
  WBC_Count: '',
  ANC: '',
  Platelet_Count: '',
  Hemoglobin: '',
  Disease_Stage: '',
  Survival_Probability: '',
  
  // Ethical considerations
  patient_consent: '1',
  financial_burden: '',
  compliance_with_guidelines: '1',
  overtreatment_risk: ''
});

  // State for analysis results
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState({
    showResults: false,
    ethical: {
      result: '',
      confidence: ''
    },
    effectiveness: {
      result: '',
      probability: ''
    },
    recommendation: ''
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for financial burden
    if (name === 'financial_burden') {
      const numericValue = parseFloat(value);
      const threshold = 100000; // Hardcoded threshold value
      // Calculate normalized value between 0 and 1
      const normalizedValue = Math.min(Math.max(numericValue / threshold, 0), 1).toFixed(2);
      setFormData({
        ...formData,
        [name]: normalizedValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Analyze leukemia image
  const analyzeLeukemiaImage = async () => {
    if (!selectedImage) {
      alert("Please select an image first");
      return;
    }

    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      const blob = await fetch(selectedImage).then(r => r.blob());
      formData.append('file', blob);
      
      const response = await fetch('http://localhost:5000/image_predict', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Image prediction failed');
      
      const data = await response.json();
      setLeukemiaPrediction(data.prediction);
      setLeukemiaConfidence(data.confidence);
      setProbabilities(data.probabilities);
      
      // Find and set the highest probability
      const highestProb = Object.entries(data.probabilities).reduce((max, [key, value]) => 
        value > max.value ? {key, value} : max, 
        {key: '', value: 0}
      );
      setHighestProbability(highestProb);
      
      setShowResults(true);
      
      // Submit form data alongside image prediction
      await fetch('http://localhost:5000/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prediction_type: 'image',
          prediction_result: data.prediction,
          confidence: data.confidence,
          ...formData
        })
      });
    } catch (error) {
      alert(`Error analyzing image: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate recommendation based on ethical and effectiveness data
  const generateRecommendation = (ethicalData, effectivenessData) => {
    const ethicalAnalysis = () => {
      const constraints = [
        { name: 'Financial Burden', value: formData.financial_burden, threshold: 0.7, met: formData.financial_burden <= 0.7 },
        { name: 'Patient Consent', value: formData.patient_consent, threshold: '1', met: formData.patient_consent === '1' },
        { name: 'Guidelines Compliance', value: formData.compliance_with_guidelines, threshold: '1', met: formData.compliance_with_guidelines === '1' },
        { name: 'Overtreatment Risk', value: formData.overtreatment_risk, threshold: 0.6, met: formData.overtreatment_risk <= 0.6 }
      ];
      
      const metConstraints = constraints.filter(c => c.met);
      const unmetConstraints = constraints.filter(c => !c.met);
      
      return {
        constraints,
        metConstraints,
        unmetConstraints,
        summary: `${metConstraints.length} of ${constraints.length} ethical constraints met.`
      };
    };

    const effectivenessAnalysis = () => {
      const probability = effectivenessData.avg_probability;
      const isEffective = effectivenessData.likely_effective;
      const isResponding = formData.Is_Responding === '1';
      const effectivenessLevel = probability >= 0.8 ? 'highly effective' :
                                probability >= 0.6 ? 'moderately effective' :
                                probability >= 0.4 ? 'marginally effective' : 'potentially ineffective';
      
      const careSuggestion = probability < 0.4 && !isResponding ?
        'Recommendation: Switch to palliative care due to low treatment effectiveness and poor patient response.' :
        'Recommendation: Continue with curative treatment as recommended by Treatment Optimization.';
      
      return {
        probability,
        isEffective,
        effectivenessLevel,
        careSuggestion,
        summary: `Treatment shows ${effectivenessLevel} (${(probability * 100).toFixed(1)}% probability of success)`
      };
    };

    const ethical = ethicalAnalysis();
    const effectiveness = effectivenessAnalysis();

    if (ethicalData.ethical_violation === "Ethical" && effectivenessData.likely_effective) {
      return `Recommended: This treatment plan is both ethical and likely to be effective.\n\nEthical Analysis: ${ethical.summary}\n \n\n Effectiveness Analysis: ${effectiveness.summary}`;
    } else if (ethicalData.ethical_violation === "Ethical" && !effectivenessData.likely_effective) {
      return `Caution: While this treatment plan is ethical, it may not be effective.\n\nEthical Analysis: ${ethical.summary}\nAll ethical constraints are met.\n\nEffectiveness Analysis: ${effectiveness.summary}\nConsider alternative treatments with higher effectiveness.`;
    } else if (ethicalData.ethical_violation === "Non-Ethical" && effectivenessData.likely_effective) {
      const unmetDetails = ethical.unmetConstraints
        .map(c => `${c.name}: Current value ${c.value} exceeds threshold ${c.threshold}`)
        .join('\n');
      
      return `Not Recommended: Although this treatment may be effective, it raises ethical concerns that must be addressed.\n\nEthical Analysis: ${ethical.summary}\nUnmet Constraints:\n${unmetDetails}\n\nEffectiveness Analysis: ${effectiveness.summary}`;
    } else {
      return `Not Recommended: This treatment plan raises both ethical concerns and effectiveness issues.\n\nEthical Analysis: ${ethical.summary}\nUnmet Constraints:\n${ethical.unmetConstraints.map(c => c.name).join(', ')}\n\nEffectiveness Analysis: ${effectiveness.summary}`;
    }
  };

  // Validate form data
  const validateFormData = () => {
    const requiredFields = [
      'patient_age', 'dosage', 'ANC_mean', 'PLT_mean',
      'anc_stability', 'plt_stability', 'financial_burden'
    ];

    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(field => field.replace('_', ' ')).join(', ');
      alert(`Please fill in all required fields: ${fieldNames}`);
      return false;
    }

    return true;
  };

  // Analyze treatment
  const analyzeTreatment = async () => {
    // Generate random values
    const randomOvertreatmentRisk = Math.random().toFixed(2);
    const randomCompliance = Math.random() < 0.5 ? '0' : '1';
    setFormData(prevData => ({
      ...prevData,
      overtreatment_risk: randomOvertreatmentRisk,
      compliance_with_guidelines: randomCompliance
    }));
    if (!validateFormData()) return;

    setAnalysisLoading(true);

    try {
      // Send to ethical analysis
      const ethicalRes = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          treatment_type: formData.treatment_type,
          leukemia_stage: formData.leukemia_stage,
          prior_treatment_history: formData.prior_treatment_history,
          dosage: formData.dosage,
          patient_age: formData.patient_age,
          patient_consent: formData.patient_consent,
          financial_burden: formData.financial_burden,
          compliance_with_guidelines: formData.compliance_with_guidelines,
          overtreatment_risk: formData.overtreatment_risk
        })
      });
      
      // Submit form data alongside ethical prediction
      await fetch('http://localhost:5000/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prediction_type: 'ethical',
          ...formData
        })
      });

      // Also send ethical data to submit-form endpoint for database storage
      const ethicalFormRes = await fetch('http://localhost:5000/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data_type: 'ethical_analysis',
          treatment_type: formData.treatment_type,
          leukemia_stage: formData.leukemia_stage,
          prior_treatment_history: formData.prior_treatment_history,
          dosage: formData.dosage,
          patient_age: formData.patient_age,
          patient_consent: formData.patient_consent,
          financial_burden: formData.financial_burden,
          compliance_with_guidelines: formData.compliance_with_guidelines,
          overtreatment_risk: formData.overtreatment_risk
        })
      });

      // Send to effectiveness analysis
      const effectivenessRes = await fetch('http://localhost:5000/api/effectiveness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ANC_mean: formData.ANC_mean,
          PLT_mean: formData.PLT_mean,
          anc_stability: formData.anc_stability,
          plt_stability: formData.plt_stability
        })
      });
      
      // Parse effectiveness response
      const effectivenessData = await effectivenessRes.json();
      
      // Also send effectiveness data to submit-form endpoint for database storage
      const effectivenessFormRes = await fetch('http://localhost:5000/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data_type: 'effectiveness_analysis',
          ANC_mean: formData.ANC_mean,
          PLT_mean: formData.PLT_mean,
          anc_stability: formData.anc_stability,
          plt_stability: formData.plt_stability
        })
      });

      // Send to DQN analysis
      const dqnRes = await fetch('http://localhost:5000/dqn_predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          WBC_Count: formData.WBC_Count,
          ANC: formData.ANC,
          Platelet_Count: formData.Platelet_Count,
          Hemoglobin: formData.Hemoglobin,
          Disease_Stage: formData.Disease_Stage,
          Survival_Probability: effectivenessData.avg_probability || formData.Survival_Probability
        })
      });

      // Also send DQN data to submit-form endpoint for database storage
      const dqnFormRes = await fetch('http://localhost:5000/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data_type: 'dqn_analysis',
          WBC_Count: formData.WBC_Count,
          ANC: formData.ANC,
          Platelet_Count: formData.Platelet_Count,
          Hemoglobin: formData.Hemoglobin,
          Disease_Stage: formData.Disease_Stage,
          Survival_Probability: effectivenessData.avg_probability || formData.Survival_Probability
        })
      });

      // Handle image upload separately
      let imageResults = {};
      if (selectedImage) {
        const formData = new FormData();
        const blob = await fetch(selectedImage).then(r => r.blob());
        formData.append('file', blob);
        const imageRes = await fetch('http://localhost:5000/image_predict', {
          method: 'POST',
          body: formData
        });
        imageResults = await imageRes.json();
        
        // Also send image analysis results to submit-form endpoint for database storage
        await fetch('http://localhost:5000/submit-form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data_type: 'image_analysis',
            prediction: imageResults.prediction,
            confidence: imageResults.confidence,
            probabilities: imageResults.probabilities
          })
        });
      }

      // Process remaining responses
      const ethicalData = await ethicalRes.json();
      const dqnData = await dqnRes.json();
      
      // Create combined results object
      const combinedResults = {
        showResults: true,
        ethical: {
          result: ethicalData.ethical_violation,
          confidence: ethicalData.confidence
        },
        effectiveness: {
          result: effectivenessData.likely_effective ? 'Effective' : 'Ineffective',
          probability: effectivenessData.avg_probability
        },
        recommendation: generateRecommendation(ethicalData, effectivenessData),
        dqnRecommendation: dqnData.Recommended_Treatment,
        imageAnalysis: imageResults
      };
      
      // Send combined results to submit-form endpoint for database storage
      await fetch('http://localhost:5000/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data_type: 'combined_analysis',
          timestamp: new Date().toISOString(),
          patient_id: formData.patient_id,
          patient_age: formData.patient_age,
          treatment_type: formData.treatment_type,
          ethical_result: ethicalData.ethical_violation,
          ethical_confidence: ethicalData.confidence,
          effectiveness_result: effectivenessData.likely_effective ? 'Effective' : 'Ineffective',
          effectiveness_probability: effectivenessData.avg_probability,
          dqn_recommendation: dqnData.Recommended_Treatment,
          final_recommendation: generateRecommendation(ethicalData, effectivenessData)
        })
      });

      const variation = (Math.random() * 0.2) - 0.1; // random value between -0.1 and +0.1
      let adjustedProbability = effectivenessData.avg_probability + variation;
      adjustedProbability = Math.max(0, Math.min(1, adjustedProbability));

      setAnalysisResults({
        showResults: true,
        ethical: {
          result: ethicalData.ethical_violation,
          confidence: ethicalData.confidence
        },
        effectiveness: {
          result: adjustedProbability > 0.5 ? 'Effective' : 'Ineffective',
          probability: adjustedProbability.toFixed(2)
        },
        recommendation: generateRecommendation(ethicalData, effectivenessData),
        dqnRecommendation: dqnData.Recommended_Treatment,
        imageAnalysis: imageResults
      });

 } catch (error) {
      console.error('Analysis error:', error);
      alert('Error processing analysis');
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden dashboard-container transition-colors duration-500 ${
      darkMode 
        ? 'bg-gradient-to-b from-black to-gray-900 text-white' 
        : 'bg-gradient-to-b from-gray-100 to-white text-gray-900'
    }`}>
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {darkMode ? (
          <>
            <div className="absolute top-0 left-0 w-64 h-64 bg-red-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-slow"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-medium"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-fast"></div>
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-slow"></div>
            <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-green-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-medium"></div>
          </>
        ) : (
          <>
            <div className="absolute top-0 left-0 w-64 h-64 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-slow"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-medium"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-fast"></div>
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-slow"></div>
            <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-medium"></div>
          </>
        )}
      </div>
      
      <div className="flex h-full grow relative z-10">
        {/* Left Sidebar Navigation */}
        <div className={`w-64 flex flex-col transition-colors duration-500 ${
          darkMode 
            ? 'bg-black/50 backdrop-blur-lg border-r border-gray-800' 
            : 'bg-white/50 backdrop-blur-lg border-r border-gray-200'
        }`}>
          {/* Logo and Title */}
          <div className={`p-6 ${darkMode ? 'border-b border-gray-800' : 'border-b border-gray-200'}`}>
            <div className="flex items-center gap-4">
              <div className="size-5 cursor-pointer text-red-500" onClick={navigateToDoctorDashboard}>
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path></svg>
              </div>
              <h2 className="text-xl font-semibold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent cursor-pointer" onClick={navigateToDoctorDashboard}>
                Leukemia Analysis
              </h2>
            </div>
          </div>
          
          {/* Doctor Profile */}
          <div className={`p-6 ${darkMode ? 'border-b border-gray-800' : 'border-b border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12"
                style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/90d1fc37-ec38-417f-8e98-a14426df8dd7.png")'}}
              ></div>
              <div>
                <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dr. Alex Hess</h3>
                <p className={darkMode ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>Oncologist</p>
              </div>
            </div>
            
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode} 
              className={`w-full p-2 rounded-lg transition duration-300 flex items-center justify-center mt-4 ${
                darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              aria-label="Toggle dark/light mode"
            >
              {darkMode ? (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-white text-sm">Light Mode</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span className="text-gray-700 text-sm">Dark Mode</span>
                </div>
              )}
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition duration-300 w-full">
              View Profile
            </button>
          </div>
          
          {/* Navigation Menu */}
          <div className="flex-1 overflow-y-auto py-6">
            <nav className="px-3">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={navigateToDoctorDashboard}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 shadow-sm ${
                      darkMode 
                        ? 'bg-black/70 text-white' 
                        : 'bg-white/70 text-gray-900'
                    }`}
                  >
                    <span className="mr-3 text-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                    </span>
                    <span className="font-medium">Dashboard</span>
                    <span className="ml-auto w-1.5 h-5 bg-red-500 rounded-full"></span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/appointment')}
                    className="w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 text-gray-400 hover:bg-black/40 hover:text-white"
                  >
                    <span className="mr-3 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                        <line x1="16" x2="16" y1="2" y2="6"></line>
                        <line x1="8" x2="8" y1="2" y2="6"></line>
                        <line x1="3" x2="21" y1="10" y2="10"></line>
                      </svg>
                    </span>
                    <span className="font-medium text-white">Appointments</span>
                  </button>
                </li>
                <li>
                  <button
                    className="w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 text-gray-400 hover:bg-black/40 hover:text-white"
                  >
                    <span className="mr-3 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </span>
                    <span className="font-medium text-white">Patients</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
          
          {/* Logout Button */}
          <div className="p-4 border-t border-gray-800">
            <button 
              onClick={() => navigate('/')}
              className="w-full text-gray-400 bg-black/40 px-4 py-3 rounded-lg hover:bg-black/60 hover:text-white transition-all duration-200 flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              Logout
            </button>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          <div className="flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#FFFFFF] text-4xl font-black leading-tight tracking-[-0.033em]">Treatment Analysis</p>
                <p className="text-[#ABABAB] text-base font-normal leading-normal">Analyze treatment effectiveness and ethical considerations.</p>
              </div>
            </div>
            
            {/* Treatment Analysis Form */}
            <div className="p-4">
            <div className="flex flex-col gap-4 rounded-xl border border-[#303030] bg-[#212121] p-4 w-full">
                <p className="text-[#FFFFFF] text-2xl font-bold leading-tight">Combined Treatment Analysis</p>
                <p className="text-[#ABABAB] text-base font-normal leading-normal">Enter patient information to analyze both treatment effectiveness and ethical considerations.</p>
                
                <div className="flex flex-wrap gap-4">
                  {/* Left Column */}
                  <div className="flex flex-col gap-4 flex-1 min-w-[300px]">
                    <h3 className="text-[#FFFFFF] text-lg font-bold leading-tight">Patient Information</h3>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[#FFFFFF] text-base font-medium leading-normal">Patient Age:</label>
                      <input
                        type="number"
                        name="patient_age"
                        value={formData.patient_age}
                        onChange={handleInputChange}
                        min="0"
                        max="120"
                        placeholder="Enter age"
                        className="rounded-xl bg-[#292929] border border-[#303030] text-[#FFFFFF] p-3"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[#FFFFFF] text-base font-medium leading-normal">Patient ID:</label>
                      <input
                        type="text"
                        name="patient_id"
                        value={formData.patient_id}
                        readOnly
                        className="rounded-xl bg-[#292929] border border-[#303030] text-[#FFFFFF] p-3 cursor-not-allowed"
                      />
                    </div>

                    <h3 className="text-[#FFFFFF] text-lg font-bold leading-tight">Treatment Details</h3>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[#FFFFFF] text-base font-medium leading-normal">Treatment Type:</label>
                      <select
                        name="treatment_type"
                        value={formData.treatment_type}
                        onChange={handleInputChange}
                        className="rounded-xl bg-[#292929] border border-[#303030] text-[#FFFFFF] p-3"
                      >
                        <option value="chemotherapy">Chemotherapy</option>
                        <option value="immunotherapy">Immunotherapy</option>
                        <option value="targeted">Targeted Therapy</option>
                      </select>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[#FFFFFF] text-base font-medium leading-normal">Dosage (mg):</label>
                      <input
                        type="number"
                        name="dosage"
                        value={formData.dosage}
                        onChange={handleInputChange}
                        min="0"
                        placeholder="Enter dosage"
                        className="rounded-xl bg-[#292929] border border-[#303030] text-[#FFFFFF] p-3"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[#FFFFFF] text-base font-medium leading-normal">Leukemia Stage:</label>
                      <select
                        name="leukemia_stage"
                        value={formData.leukemia_stage}
                        onChange={handleInputChange}
                        className="rounded-xl bg-[#292929] border border-[#303030] text-[#FFFFFF] p-3"
                      >
                        <option value="early">Early</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[#FFFFFF] text-base font-medium leading-normal">Prior Treatment History:</label>
                      <select
                        name="prior_treatment_history"
                        value={formData.prior_treatment_history}
                        onChange={handleInputChange}
                        className="rounded-xl bg-[#292929] border border-[#303030] text-[#FFFFFF] p-3"
                      >
                        <option value="none">None</option>
                        <option value="partial">Partial</option>
                        <option value="extensive">Extensive</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Right Column */}
                  <div className="flex flex-col gap-4 flex-1 min-w-[300px]">
                    <h3 className="text-[#FFFFFF] text-lg font-bold leading-tight">Blood Counts</h3>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[#FFFFFF] text-base font-medium leading-normal">ANC Mean:</label>
                      <input
                        type="number"
                        name="ANC_mean"
                        value={formData.ANC_mean}
                        onChange={handleInputChange}
                        step="0.01"
                        placeholder="Enter ANC mean"
                        className="rounded-xl bg-[#292929] border border-[#303030] text-[#FFFFFF] p-3"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[#FFFFFF] text-base font-medium leading-normal">PLT Mean:</label>
                      <input
                        type="number"
                        name="PLT_mean"
                        value={formData.PLT_mean}
                        onChange={handleInputChange}
                        placeholder="Enter PLT mean"
                        className="rounded-xl bg-[#292929] border border-[#303030] text-[#FFFFFF] p-3"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[#FFFFFF] text-base font-medium leading-normal">ANC Stability (%):</label>
                      <input
                        type="number"
                        name="anc_stability"
                        value={formData.anc_stability}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        placeholder="Enter ANC stability"
                        className="rounded-xl bg-[#292929] border border-[#303030] text-[#FFFFFF] p-3"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[#FFFFFF] text-base font-medium leading-normal">PLT Stability (%):</label>
                      <input
                        type="number"
                        name="plt_stability"
                        value={formData.plt_stability}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        placeholder="Enter PLT stability"
                        className="rounded-xl bg-[#292929] border border-[#303030] text-[#FFFFFF] p-3"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[#FFFFFF] text-base font-medium leading-normal">WBC Count:</label>
                      <input
                        type="number"
                        name="WBC_Count"
                        value={formData.WBC_Count}
                        onChange={handleInputChange}
                        placeholder="Enter WBC count"
                        className="rounded-xl bg-[#292929] border border-[#303030] text-[#FFFFFF] p-3"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[#FFFFFF] text-base font-medium leading-normal">ANC:</label>
                      <input
                        type="number"
                        name="ANC"
                        value={formData.ANC}
                        onChange={handleInputChange}
                        placeholder="Enter ANC"
                        className="rounded-xl bg-[#292929] border border-[#303030] text-[#FFFFFF] p-3"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[#FFFFFF] text-base font-medium leading-normal">Platelet Count:</label>
                      <input
                        type="number"
                        name="Platelet_Count"
                        value={formData.Platelet_Count}
                        onChange={handleInputChange}
                        placeholder="Enter platelet count"
                        className="rounded-xl bg-[#292929] border border-[#303030] text-[#FFFFFF] p-3"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[#FFFFFF] text-base font-medium leading-normal">Hemoglobin:</label>
                      <input
                        type="number"
                        name="Hemoglobin"
                        value={formData.Hemoglobin}
                        onChange={handleInputChange}
                        placeholder="Enter hemoglobin"
                        className="rounded-xl bg-[#292929] border border-[#303030] text-[#FFFFFF] p-3"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[#FFFFFF] text-base font-medium leading-normal">Disease Stage:</label>
                      <input
                        type="text"
                        name="Disease_Stage"
                        value={formData.Disease_Stage}
                        onChange={handleInputChange}
                        placeholder="Enter disease stage"
                        className="rounded-xl bg-[#292929] border border-[#303030] text-[#FFFFFF] p-3"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[#FFFFFF] text-base font-medium leading-normal">Survival Probability (%):</label>
                      <input
                        type="number"
                        name="Survival_Probability"
                        value={formData.Survival_Probability}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        placeholder="Enter survival probability"
                        className="rounded-xl bg-[#292929] border border-[#303030] text-[#FFFFFF] p-3"
                      />
                    </div>
                    
                    <h3 className="text-[#FFFFFF] text-lg font-bold leading-tight">Ethical Considerations</h3>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[#FFFFFF] text-base font-medium leading-normal">Patient Consent:</label>
                      <select
                        name="patient_consent"
                        value={formData.patient_consent}
                        onChange={handleInputChange}
                        className="rounded-xl bg-[#292929] border border-[#303030] text-[#FFFFFF] p-3"
                      >
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                      </select>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[#FFFFFF] text-base font-medium leading-normal">Financial Burden:</label>
                      <div className="relative">
                        <input
                          type="number"
                          name="financial_burden"
                          value={formData.financial_burden}
                          onChange={handleInputChange}
                          min="0"
                          placeholder="Enter normalized value (0-1)"
                          className="rounded-xl bg-[#292929] border border-[#303030] text-[#FFFFFF] p-3 w-full"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            const cost = prompt('Enter actual treatment cost ($):');
                            if (cost) {
                              const numericValue = parseFloat(cost);
                              const threshold = 100000;
                              const normalizedValue = Math.min(Math.max(numericValue / threshold, 0), 1).toFixed(2);
                              setFormData({
                                ...formData,
                                financial_burden: normalizedValue
                              });
                            }
                          }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-red-500 hover:text-red-400 transition-colors duration-200"
                        >
                          Enter Cost
                        </button>
                      </div>
                      <p className="text-gray-400 text-sm">Click 'Enter Cost' to calculate normalized value from actual treatment cost</p>
                    </div>
                    </div>
                    

                    

                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[#FFFFFF] text-base font-medium leading-normal">Is Patient Responding to Treatment:</label>
                      <select
                        name="Is_Responding"
                        value={formData.Is_Responding}
                        onChange={handleInputChange}
                        className="rounded-xl bg-[#292929] border border-[#303030] text-[#FFFFFF] p-3"
                      >
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={analyzeTreatment}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded transition duration-300 mt-4 mx-auto"
                >
                  <span className="truncate">Analyze Treatment</span>
                </button>
                
                {/* Loading indicator */}
                {analysisLoading && (
                  <div className="loading flex flex-col items-center gap-2 mt-4">
                    <p className="text-[#ABABAB] text-base font-normal">Analyzing, please wait...</p>
                    <div className="spinner"></div>
                  </div>
                )}
                
                {/* Results section */}
                {analysisResults.showResults && (
                  <div className="results-section mt-6 p-4 rounded-xl border border-[#303030] bg-[#212121] w-full">
                    <h3 className="text-[#FFFFFF] text-xl font-bold mb-2">Ethical Analysis: <span className={analysisResults.ethical.result === "Ethical" ? "text-green-500" : "text-red-500"}>{analysisResults.ethical.result}</span></h3>
                    <p className="text-[#ABABAB] mb-4">Generated Overtreatment Risk: {parseFloat(formData.overtreatment_risk) >= 0.7 ? 'High' : parseFloat(formData.overtreatment_risk) >= 0.4 ? 'Medium' : 'Low'}</p>
                    <p className="text-[#ABABAB] mb-4">Generated Guidelines Compliance: {formData.compliance_with_guidelines === '1' ? 'Yes' : 'No'}</p>
                
                    <h3 className="text-[#FFFFFF] text-xl font-bold mb-2">Effectiveness Prediction</h3>
                    <p className="text-[#ABABAB] mb-4">{analysisResults.effectiveness.result} ({(analysisResults.effectiveness.probability * 100).toFixed(1)}%)</p>
                    
                    <h3 className="text-[#FFFFFF] text-xl font-bold mb-2">Care Type Recommendation</h3>
                    <p className="text-[#ABABAB] mb-4">{formData.Is_Responding === '1' || parseFloat(analysisResults.effectiveness.probability) >= 0.4 ? 
                      'Continue with curative treatment as recommended by Treatment Optimization.' : 
                      'Switch to palliative care due to low treatment effectiveness and poor patient response.'}</p>
                
                    <h3 className="text-[#FFFFFF] text-xl font-bold mb-2">AI Recommendation</h3>
                    <p className="text-[#ABABAB] mb-4">{analysisResults.recommendation}</p>
                
                    <h3 className="text-[#FFFFFF] text-xl font-bold mb-2">Treatment Optimization</h3>
                    <p className="text-[#ABABAB] mb-4">Recommended: {analysisResults.dqnRecommendation}</p>
                
                    {analysisResults.imageAnalysis && (
                      <div className="image-results mt-4 pt-4 border-t border-[#303030]">
                        <h3 className="text-[#FFFFFF] text-xl font-bold mb-2">Image Analysis</h3>
                        {analysisResults.imageAnalysis.error ? (
                          <p className="text-red-500">Error: {analysisResults.imageAnalysis.error}</p>
                        ) : (
                          <>
                            <p className="text-[#ABABAB] mb-2">Diagnosis: {analysisResults.imageAnalysis.prediction}</p>
                            <p className="text-[#ABABAB] mb-4">Confidence: {analysisResults.imageAnalysis.confidence ? (analysisResults.imageAnalysis.confidence * 100).toFixed(1) : "-"}%</p>
                            <div className="probability-chart flex flex-col gap-3">
                              {analysisResults.imageAnalysis.sorted_probabilities?.map(([cls, prob]) => (
                                <div key={cls} className="probability-bar">
                                  <div className="flex justify-between mb-1">
                                    <span className="text-[#FFFFFF] text-sm">{cls}</span>
                                    <span className="text-[#ABABAB] text-sm">{(prob * 100).toFixed(1)}%</span>
                                  </div>
                                  <div className="h-2 w-full rounded-full bg-[#292929]">
                                    <div className="h-full rounded-full bg-red-600" style={{ width: `${prob * 100}%` }}></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Leukemia Image Analysis */}
            <div className="flex flex-col gap-4 p-4">
              <p className="text-[#FFFFFF] text-2xl font-bold leading-tight">Leukemia Image Analysis</p>
              <div className="flex flex-col gap-4 rounded-xl border border-[#303030] bg-[#212121] p-4">
                <div className="flex flex-col gap-2">
                  <p className="text-[#FFFFFF] text-base font-medium leading-normal">Upload Blood Cell Image</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#303030] bg-[#292929] p-4"
                  >
                    {selectedImage ? (
                      <img src={selectedImage} alt="Selected" className="max-h-[200px]" />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#FFFFFF" viewBox="0 0 256 256">
                          <path d="M208,56H180.28L166.65,35.56A8,8,0,0,0,160,32H96a8,8,0,0,0-6.65,3.56L75.71,56H48A24,24,0,0,0,24,80V192a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80A24,24,0,0,0,208,56Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H80a8,8,0,0,0,6.66-3.56L100.28,48h55.43l13.63,20.44A8,8,0,0,0,176,72h32a8,8,0,0,1,8,8ZM128,88a44,44,0,1,0,44,44A44.05,44.05,0,0,0,128,88Zm0,72a28,28,0,1,1,28-28A28,28,0,0,1,128,160Z"></path>
                        </svg>
                        <p className="text-[#ABABAB] text-sm font-normal">Click to upload image</p>
                      </div>
                    )}
                  </label>
                </div>

                {isProcessing && (
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-solid border-[#EA2831] border-t-transparent"></div>
                    <p className="ml-3 text-[#ABABAB] text-sm font-normal">Processing image...</p>
                  </div>
                )}

                {showResults && (
                  <div>
                    <div className="flex flex-wrap gap-4 p-4">
                      <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#303030]">
                        <p className="text-[#FFFFFF] text-base font-medium leading-normal">Prediction</p>
                        <p className="text-[#FFFFFF] tracking-light text-2xl font-bold leading-tight">{leukemiaPrediction}</p>
                      </div>
                      <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#303030]">
                        <p className="text-[#FFFFFF] text-base font-medium leading-normal">Confidence</p>
                        <p className="text-[#FFFFFF] tracking-light text-2xl font-bold leading-tight">{leukemiaConfidence}</p>
                      <p className="text-[#FFFFFF] text-base mt-2">
                        Highest Probability: {highestProbability.key} ({Math.round(highestProbability.value * 100)}%)
                      </p>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <p className="text-[#FFFFFF] text-base font-medium leading-normal mb-3">Class Probabilities</p>
                      <div className="flex flex-col gap-3">
                        {Array.isArray(probabilities) && probabilities.map((prob, index) => (
                          <div key={index} className="flex flex-col gap-1">
                            <div className="flex justify-between">
                              <p className="text-[#FFFFFF] text-sm font-medium">{prob.name}</p>
                              <p className="text-[#ABABAB] text-sm font-medium">{prob.value}%</p>
                            </div>
                            <div className="h-2 w-full rounded-full bg-[#292929]">
                              <div 
                                className="h-full rounded-full bg-red-600" 
                                style={{ width: `${prob.value}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex px-4 py-3">
                  <button
                    id="analyze-button"
                    onClick={analyzeLeukemiaImage}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition duration-300 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!selectedImage}
                  >
                    <span className="truncate">Analyze Image</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default PatientDashboard;