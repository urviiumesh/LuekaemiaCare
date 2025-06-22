import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { View, Text, TouchableOpacity, ScrollView } from '../components/ReactNativeWeb';
import { jsPDF } from 'jspdf';

const PatientsNew = () => {
  const navigate = useNavigate();
  
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
  
  // State for active page
  const [activePage, setActivePage] = useState('overview');

  // Function to navigate to doctor dashboard
  const navigateToLoginPage = () => {
    navigate('/');
  };
  
  // State for patient details
  const [patientDetails, setPatientDetails] = useState({
    name: 'John Smith',
    age: 42,
    gender: 'Male',
    bloodType: 'A+',
    diagnosis: 'Acute Lymphoblastic Leukemia (ALL)',
    diagnosisDate: '2023-11-15',
    physician: 'Dr. Alex Hess',
    patientId: 'PT-20231115-001'
  });

  // State for treatment progress
  const [treatmentProgress, setTreatmentProgress] = useState({
    currentPhase: 'Induction',
    startDate: '2023-11-20',
    completedSteps: 1,
    totalSteps: 5,
    nextAppointment: '2024-01-15',
    bloodCounts: {
      wbc: 3.5,
      rbc: 4.2,
      platelets: 150,
      anc: 1.8
    },
    progressNotes: [
      { date: '2023-11-20', note: 'Treatment initiated. Patient tolerated first dose well.' },
      { date: '2023-12-05', note: 'Blood counts improving. Continuing with scheduled protocol.' },
      { date: '2023-12-20', note: 'Mild side effects observed. Medication adjusted.' }
    ]
  });
  
  // State for treatment selection and consent
  const [treatmentOptions, setTreatmentOptions] = useState([
    { id: 1, name: 'Standard Chemotherapy', description: 'Traditional multi-drug regimen', duration: '6-8 months' },
    { id: 2, name: 'Targeted Therapy', description: 'Molecular targeted approach', duration: '12 months' },
    { id: 3, name: 'Immunotherapy', description: 'Immune system enhancement', duration: '12-18 months' },
    { id: 4, name: 'Clinical Trial Protocol', description: 'Experimental treatment option', duration: 'Variable' }
  ]);
  
  const [selectedTreatment, setSelectedTreatment] = useState(1);
  const [consentGiven, setConsentGiven] = useState(false);
  const [videoRecording, setVideoRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [videoRecordingTime, setVideoRecordingTime] = useState(0);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  
  // Audio consent states
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [audioRecordingComplete, setAudioRecordingComplete] = useState(false);
  const [audioRecorder, setAudioRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioURL, setAudioURL] = useState(null);
  const [audioRecordingTime, setAudioRecordingTime] = useState(0);
  const audioRef = useRef(null);

  // Handle treatment selection
  const handleTreatmentSelection = (id) => {
    setSelectedTreatment(id);
    setConsentGiven(false);
    setRecordingComplete(false);
  };

  // Handle video consent
  // ...

// Add state for available devices
const [videoDevices, setVideoDevices] = useState([]);

// Function to enumerate devices
const enumerateDevices = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices.filter(device => device.kind === 'videoinput');
    setVideoDevices(videoInputs);
    return videoInputs.length > 0;
  } catch (err) {
    console.error('Error enumerating devices:', err);
    return false;
  }
};

const startAudioConsent = async () => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Audio recording is not supported in this browser');
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    // Create a local array to store chunks
    const chunks = [];
    
    const recorder = new MediaRecorder(stream);
    setAudioRecorder(recorder);
    setAudioChunks([]);

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
        setAudioChunks(chunks);
      }
    };

    recorder.onstop = () => {
      console.log('Audio recording stopped, chunks:', chunks.length);
      
      const audioBlob = new Blob(chunks, { type: 'audio/webm' });
      if (audioBlob.size === 0) {
        console.error("Recorded audio has no data");
        return;
      }
      
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioURL(audioUrl);
      setAudioRecordingComplete(true);
      stream.getTracks().forEach(track => track.stop());
      
      // Store the blob for potential download
      window.recordedAudioBlob = audioBlob;
    };

    // Request data every second
    recorder.start(1000);
    setIsAudioRecording(true);
    
    // Add a visual indicator for recording time
    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      setAudioRecordingTime(elapsedSeconds);
    }, 1000);
    
    // Store the interval ID to clear it later
    window.audioRecordingTimerInterval = timerInterval;
    
  } catch (err) {
    console.error('Error starting audio recording:', err);
    alert(`Could not start audio recording: ${err.message}. Please check your microphone permissions.`);
  }
};

const stopAudioRecording = () => {
  try {
    if (audioRecorder && audioRecorder.state !== 'inactive') {
      console.log('Stopping audio recording...');
      audioRecorder.stop();
      setIsAudioRecording(false);
      
      // Clear the timer interval
      if (window.audioRecordingTimerInterval) {
        clearInterval(window.audioRecordingTimerInterval);
        setAudioRecordingTime(0);
      }
    } else {
      console.warn('AudioRecorder is not active or not available');
    }
  } catch (error) {
    console.error("Error stopping audio recording:", error);
    alert("There was a problem stopping the audio recording. Please try again.");
  }
};

const startVideoConsent = async () => {
  try {
    // First check if browser supports media devices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('MediaDevices API not supported in this browser');
    }

    // Check for available video devices
    const hasVideoDevices = await enumerateDevices();
    if (!hasVideoDevices) {
      throw new Error('No video input devices found');
    }

    // Show a message to the user about camera permissions
    const permissionMessage = document.createElement('div');
    permissionMessage.className = 'fixed inset-0 flex items-center justify-center z-50';
    permissionMessage.style.backgroundColor = darkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)';
    
    const dialogBgColor = darkMode ? 'bg-gray-900' : 'bg-white';
    const titleColor = darkMode ? 'text-white' : 'text-gray-900';
    const textColor = darkMode ? 'text-gray-300' : 'text-gray-600';
    
    permissionMessage.innerHTML = `
      <div class="${dialogBgColor} p-6 rounded-lg max-w-md text-center shadow-xl">
        <h3 class="${titleColor} text-lg font-medium mb-4">Camera Permission Required</h3>
        <p class="${textColor} mb-4">Please allow access to your camera and microphone when prompted by your browser.</p>
        <p class="${textColor} mb-4">If you've previously denied permission, you'll need to reset it in your browser settings.</p>
        <div class="flex justify-center">
          <button id="permission-ok" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">OK, I Understand</button>
        </div>
      </div>
    `;
    document.body.appendChild(permissionMessage);
    
    // Wait for user to acknowledge
    await new Promise(resolve => {
      document.getElementById('permission-ok').addEventListener('click', () => {
        document.body.removeChild(permissionMessage);
        resolve();
      });
    });
    
    // Try to get video stream with specific constraints
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user',
        ...(videoDevices.length > 0 ? { deviceId: { exact: videoDevices[0].deviceId } } : {})
      },
      audio: true
    });
    
    // Store the stream reference
    streamRef.current = stream;
    
    // Display the live video feed
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true; // Mute to prevent feedback
      await videoRef.current.play().catch(e => {
        console.warn("Could not autoplay video preview:", e);
        // Try again with user interaction
        const playButton = document.createElement('button');
        playButton.textContent = 'Click to Start Camera';
        playButton.className = 'absolute inset-0 w-full h-full bg-black/70 text-white flex items-center justify-center';
        videoRef.current.parentNode.appendChild(playButton);
        playButton.onclick = async () => {
          await videoRef.current.play();
          playButton.remove();
        };
      });
    }
    
    // Setup media recorder with proper MIME type
    let options;
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
      options = { mimeType: 'video/webm;codecs=vp9,opus' };
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      options = { mimeType: 'video/webm' };
    } else if (MediaRecorder.isTypeSupported('video/mp4')) {
      options = { mimeType: 'video/mp4' };
    }
    
    const recorder = new MediaRecorder(stream, options);
    setMediaRecorder(recorder);
    
    // Clear previous chunks
    setRecordedChunks([]);
    
    // Create a local array to store chunks
    const chunks = [];
    
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
        setRecordedChunks(chunks);
      }
    };
    
    // Define onstop handler
    recorder.onstop = () => {
      console.log('Recording stopped, chunks:', chunks.length);
      
      // Create the video blob
      let mimeType = 'video/webm';
      if (!MediaRecorder.isTypeSupported('video/webm')) {
        if (MediaRecorder.isTypeSupported('video/mp4')) {
          mimeType = 'video/mp4';
        }
      }
      
      const blob = new Blob(chunks, { type: mimeType });
      if (blob.size === 0) {
        console.error("Recorded video has no data");
        return;
      }
      
      const videoURL = URL.createObjectURL(blob);
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = videoURL;
        videoRef.current.muted = false;
        videoRef.current.controls = true;
        videoRef.current.play().catch(e => console.warn("Could not autoplay video preview:", e));
      }
      
      // Store the blob for potential download
      window.recordedVideoBlob = blob;
      
      setRecordingComplete(true);
    };
    
    // Start recording
    recorder.start(1000); // Collect data every 1s
    setVideoRecording(true);
    
    // Start a timer to show recording duration
    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      // Don't use setRecordingComplete here as it's used to indicate recording is done
      // Instead, update a different state for the timer
      setVideoRecordingTime(elapsedSeconds);
    }, 1000);
    
    // Store the interval ID to clear it later
    window.recordingTimerInterval = timerInterval;
    
    } catch (err) {
      console.error('Error accessing media devices:', err);
      
      // Clean up any partial stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      // Show a more helpful error message with instructions
      const errorModal = document.createElement('div');
      errorModal.className = 'fixed inset-0 flex items-center justify-center z-50';
      errorModal.style.backgroundColor = darkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)';
      
      const dialogBgColor = darkMode ? 'bg-gray-900' : 'bg-white';
      const textColor = darkMode ? 'text-white' : 'text-gray-900';
      const errorBoxBg = darkMode ? 'bg-black/50' : 'bg-gray-100';
      const errorBoxText = darkMode ? 'text-gray-300' : 'text-gray-700';
      
      errorModal.innerHTML = `
        <div class="${dialogBgColor} p-6 rounded-lg max-w-md shadow-xl">
          <h3 class="text-red-500 text-lg font-medium mb-4">Camera Access Error</h3>
          <p class="${textColor} mb-3">We couldn't access your camera or microphone.</p>
          <div class="${errorBoxBg} p-4 rounded mb-4 ${errorBoxText} text-sm">
            <p class="font-medium text-red-500 mb-2">Error: ${err.message}</p>
            <p class="mb-2">To fix this issue:</p>
            <ol class="list-decimal pl-5 space-y-1">
              <li>Check that your camera is connected and working</li>
              <li>Make sure no other application is using your camera</li>
              <li>Reset camera permissions in your browser settings:</li>
            </ol>
            <ul class="pl-8 mt-2 space-y-1">
              <li>Chrome: Settings → Privacy and Security → Site Settings → Camera</li>
              <li>Firefox: Options → Privacy & Security → Permissions → Camera</li>
              <li>Edge: Settings → Cookies and Site Permissions → Camera</li>
            </ul>
          </div>
          <div class="flex justify-center">
            <button id="error-ok" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">OK</button>
          </div>
        </div>
      `;
      document.body.appendChild(errorModal);
      
      // Remove the modal when user clicks OK
      document.getElementById('error-ok').addEventListener('click', () => {
        document.body.removeChild(errorModal);
      });
    }
  };
  
  const stopRecording = () => {
    try {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        console.log('Stopping recording...');
        
        // Stop recording - this will trigger the onstop event handler
        mediaRecorder.stop();
        setVideoRecording(false);
        
        // Stop all tracks in the stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // Clear the timer interval
        if (window.recordingTimerInterval) {
          clearInterval(window.recordingTimerInterval);
          setVideoRecordingTime(0);
        }
        
        // Note: The actual video processing is now handled in the mediaRecorder.onstop event
        // which was defined in startVideoConsent
      } else {
        console.warn('MediaRecorder is not active or not available');
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
      alert("There was a problem stopping the recording. Please refresh the page and try again.");
      
      // Clean up resources
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (window.recordingTimerInterval) {
        clearInterval(window.recordingTimerInterval);
        setVideoRecordingTime(0);
      }
      
      setVideoRecording(false);
      setRecordingComplete(false);
    }
  };

  // Handle consent submission
  const submitConsent = () => {
    if (recordingComplete || audioRecordingComplete) {
      setConsentGiven(true);
      alert('Consent recorded successfully!');
    } else {
      alert('Please complete either video or audio consent recording first.');
    }
  };
  
  // Generate and download patient details as PDF
  const downloadPatientDetailsPDF = () => {
    const password = prompt('Please enter the 6-digit password to download:');
    if (password !== '123456') {
      alert('Invalid password. Please try again.');
      return;
    }
    
    try {
      // Create a new PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(22);
      doc.setTextColor(220, 53, 69); // Red color
      doc.text('Patient Medical Report', 105, 20, { align: 'center' });
      
      // Add patient details section
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Patient Information', 20, 40);
      
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      let yPos = 50;
      
      // Add patient details
      Object.entries(patientDetails).forEach(([key, value]) => {
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        doc.text(`${formattedKey}: ${value}`, 20, yPos);
        yPos += 8;
      });
      
      // Add treatment progress section
      yPos += 10;
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Treatment Progress', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      doc.text(`Current Phase: ${treatmentProgress.currentPhase}`, 20, yPos);
      yPos += 8;
      doc.text(`Start Date: ${treatmentProgress.startDate}`, 20, yPos);
      yPos += 8;
      doc.text(`Progress: ${treatmentProgress.completedSteps} of ${treatmentProgress.totalSteps} steps`, 20, yPos);
      yPos += 8;
      doc.text(`Next Appointment: ${treatmentProgress.nextAppointment}`, 20, yPos);
      yPos += 15;
      
      // Add blood counts
      doc.setFontSize(14);
      doc.text('Latest Blood Counts', 20, yPos);
      yPos += 10;
      
      Object.entries(treatmentProgress.bloodCounts).forEach(([key, value]) => {
        doc.text(`${key.toUpperCase()}: ${value}`, 20, yPos);
        yPos += 8;
      });
      yPos += 10;
      
      // Add progress notes
      doc.setFontSize(14);
      doc.text('Progress Notes', 20, yPos);
      yPos += 10;
      
      treatmentProgress.progressNotes.forEach(note => {
        doc.text(`${note.date}: ${note.note}`, 20, yPos);
        yPos += 8;
      });
      
      // Add treatment plan if consent was given
      if (consentGiven) {
        yPos += 10;
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Treatment Plan', 20, yPos);
        yPos += 10;
        
        const selectedTreatmentOption = treatmentOptions.find(opt => opt.id === selectedTreatment);
        
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        doc.text(`Selected Treatment: ${selectedTreatmentOption.name}`, 20, yPos);
        yPos += 8;
        doc.text(`Description: ${selectedTreatmentOption.description}`, 20, yPos);
        yPos += 8;
        doc.text(`Expected Duration: ${selectedTreatmentOption.duration}`, 20, yPos);
        yPos += 8;
        doc.text(`Consent Status: Consent provided on ${new Date().toLocaleDateString()}`, 20, yPos);
      }
      
      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Generated on ${new Date().toLocaleString()} - Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      }
      
      // Save the PDF
      doc.save(`${patientDetails.name.replace(/\s+/g, '_')}_Medical_Report.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
    }
  };

  // Navigation items
  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'home' },
    { id: 'details', label: 'Patient Details', icon: 'user' },
    { id: 'progress', label: 'Treatment Progress', icon: 'chart-line' },
    { id: 'consent', label: 'Treatment & Consent', icon: 'file-signature' },
  ];

  // Render icon based on name
  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'home':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
        );
      case 'user':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        );
      case 'chart-line':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
          </svg>
        );
      case 'file-signature':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  // Render Overview Page
  const renderOverviewPage = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Patient Summary Card */}
        <div className="bg-black/50 backdrop-blur-lg border border-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">Patient Summary</h2>
            <button 
              onClick={downloadPatientDetailsPDF}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition duration-300 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Download PDF
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm">Name</span>
              <span className="text-white text-base">{patientDetails.name}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm">Patient ID</span>
              <span className="text-white text-base">{patientDetails.patientId}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm">Diagnosis</span>
              <span className="text-white text-base">{patientDetails.diagnosis}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm">Physician</span>
              <span className="text-white text-base">{patientDetails.physician}</span>
            </div>
          </div>
          <button 
            onClick={() => setActivePage('details')}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition duration-300"
          >
            View Full Details
          </button>
        </div>

        {/* Treatment Status Card */}
        <div className="bg-black/50 backdrop-blur-lg border border-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-3 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">Treatment Status</h2>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm">Current Phase</span>
              <span className="text-white text-base font-medium">{treatmentProgress.currentPhase}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm">Next Appointment</span>
              <span className="text-white text-base">{treatmentProgress.nextAppointment}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-gray-400 text-sm">Progress</span>
              <span className="text-white text-sm">
                {treatmentProgress.completedSteps} of {treatmentProgress.totalSteps} steps
              </span>
            </div>
            <div className="w-full bg-black/70 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full" 
                style={{ width: `${(treatmentProgress.completedSteps / treatmentProgress.totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
          <button 
            onClick={() => setActivePage('progress')}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition duration-300"
          >
            View Full Progress
          </button>
        </div>

        {/* Consent Status Card */}
        <div className="bg-black/50 backdrop-blur-lg border border-gray-800 rounded-xl p-6 shadow-lg md:col-span-2">
          <h2 className="text-xl font-bold mb-3 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">Consent Status</h2>
          {consentGiven ? (
            <div className="bg-black/70 p-4 rounded-lg border border-green-600">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <div>
                  <h4 className="text-white font-medium">Consent Recorded</h4>
                  <p className="text-gray-400 text-sm">
                    You have consented to {treatmentOptions.find(opt => opt.id === selectedTreatment)?.name}. 
                    Your treatment will begin as scheduled.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-black/70 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <h4 className="text-white font-medium">Consent Required</h4>
                  <p className="text-gray-400 text-sm">
                    Please provide consent to begin your treatment.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActivePage('consent')}
                className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition duration-300"
              >
                Provide Consent
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Patient Details Page
  const renderDetailsPage = () => {
    return (
      <div className="bg-black/50 backdrop-blur-lg border border-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">Patient Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm">Name</span>
            <span className="text-white text-base">{patientDetails.name}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm">Age</span>
            <span className="text-white text-base">{patientDetails.age}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm">Gender</span>
            <span className="text-white text-base">{patientDetails.gender}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm">Blood Type</span>
            <span className="text-white text-base">{patientDetails.bloodType}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm">Diagnosis</span>
            <span className="text-white text-base">{patientDetails.diagnosis}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm">Diagnosis Date</span>
            <span className="text-white text-base">{patientDetails.diagnosisDate}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm">Physician</span>
            <span className="text-white text-base">{patientDetails.physician}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-400 text-sm">Patient ID</span>
            <span className="text-white text-base">{patientDetails.patientId}</span>
          </div>
        </div>

        {/* Additional medical history section could be added here */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">Medical History</h3>
          <div className="bg-black/70 backdrop-blur-sm p-4 rounded-lg border border-gray-800">
            <p className="text-gray-400 text-sm">
              No prior medical conditions reported. Patient has no history of major illnesses or surgeries.
            </p>
          </div>
        </div>

        {/* Emergency contacts section */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">Emergency Contacts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/70 backdrop-blur-sm p-4 rounded-lg border border-gray-800">
              <h4 className="text-red-500 text-base font-medium">Primary Contact</h4>
              <div className="mt-2">
                <p className="text-white-500 text-sm">Mary Smith (Spouse)</p>
                <p className="text-white-500 text-sm">Phone: (555) 123-4567</p>
              </div>
            </div>
            <div className="bg-black/70 backdrop-blur-sm p-4 rounded-lg border border-gray-800">
              <h4 className="text-red-500 text-base font-medium">Secondary Contact</h4>
              <div className="mt-2">
                <p className="text-white-500 text-sm">Robert Smith (Brother)</p>
                <p className="text-white-500 text-sm">Phone: (555) 987-6543</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Treatment Progress Page
  const renderProgressPage = () => {
    return (
      <div className="bg-black/50 backdrop-blur-lg border border-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-2xl font-bold text-white">Treatment Progress</h2>
          <button 
            onClick={downloadPatientDetailsPDF}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition duration-300 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Download PDF
          </button>
        </div>
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400 text-sm">Current Phase</span>
            <span className="text-white text-base font-medium">{treatmentProgress.currentPhase}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400 text-sm">Start Date</span>
            <span className="text-white text-base">{treatmentProgress.startDate}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400 text-sm">Next Appointment</span>
            <span className="text-white text-base">{treatmentProgress.nextAppointment}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-gray-400 text-sm">Progress</span>
            <span className="text-white text-sm">
              {treatmentProgress.completedSteps} of {treatmentProgress.totalSteps} steps
            </span>
          </div>
          <div className="w-full bg-black/70 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-600 to-green-400 h-2 rounded-full" 
              style={{ width: `${(treatmentProgress.completedSteps / treatmentProgress.totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Treatment Phase Timeline */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-5 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">Treatment Timeline</h3>
          <div className="relative">
            {/* Timeline vertical line */}
            <div className="absolute left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-red-600 via-red-500 to-red-400 rounded-full"></div>
            
            {/* Induction Phase */}
            <div className="relative pl-12 pb-12 mb-2">
              {/* Timeline dot */}
              <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-red-500 border-2 border-black shadow-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              
              {/* Content */}
              <div className="bg-black/40 backdrop-blur-sm p-4 rounded-lg border border-red-900/50 shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-red-500 text-lg font-medium">Induction</h4>
                    <p className="text-white-500 text-sm mt-1">Nov 20, 2023 - Jan 15, 2024</p>
                    <p className="text-white-500 text-sm mt-2">Initial intensive therapy to induce remission</p>
                  </div>
                  <div className="px-3 py-1 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs rounded-full whitespace-nowrap shadow-md">Current</div>
                </div>
              </div>
            </div>
            
            {/* Consolidation Phase */}
            <div className="relative pl-12 pb-12 mb-2">
              {/* Timeline dot */}
              <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-black/70 border-2 border-red-900/50 shadow-lg flex items-center justify-center">
                <span className="text-white-500 text-xs font-bold">2</span>
              </div>
              
              {/* Content */}
              <div className="bg-black/40 backdrop-blur-sm p-4 rounded-lg border border-gray-800 shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-red-500 text-lg font-medium">Consolidation</h4>
                    <p className="text-white-500 text-sm mt-1">Jan 15, 2024 - Apr 15, 2024</p>
                    <p className="text-white-500 text-sm mt-2">Further therapy to eliminate residual disease</p>
                  </div>
                  <div className="px-3 py-1 bg-black/70 text-white-500 text-xs rounded-full whitespace-nowrap shadow-md">Pending</div>
                </div>
              </div>
            </div>
            
            {/* Maintenance Phase */}
            <div className="relative pl-12 pb-12 mb-2">
              {/* Timeline dot */}
              <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-black/70 border-2 border-red-900/50 shadow-lg flex items-center justify-center">
                <span className="text-white-500 text-xs font-bold">3</span>
              </div>
              
              {/* Content */}
              <div className="bg-black/40 backdrop-blur-sm p-4 rounded-lg border border-gray-800 shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-red-500 text-lg font-medium">Maintenance</h4>
                    <p className="text-white-500 text-sm mt-1">Apr 15, 2024 - Oct 15, 2024</p>
                    <p className="text-white-500 text-sm mt-2">Prolonged low-intensity therapy to prevent relapse</p>
                  </div>
                  <div className="px-3 py-1 bg-black/70 text-white-500 text-xs rounded-full whitespace-nowrap shadow-md">Pending</div>
                </div>
              </div>
            </div>
            
            {/* Follow-up Phase */}
            <div className="relative pl-12 pb-6">
              {/* Timeline dot */}
              <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-black/70 border-2 border-red-900/50 shadow-lg flex items-center justify-center">
                <span className="text-white-500 text-xs font-bold">4</span>
              </div>
              
              {/* Content */}
              <div className="bg-black/40 backdrop-blur-sm p-4 rounded-lg border border-gray-800 shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-red-500 text-lg font-medium">Follow-up</h4>
                    <p className="text-white-500 text-sm mt-1">Oct 15, 2024 onwards</p>
                    <p className="text-white-500 text-sm mt-2">Regular monitoring for recurrence</p>
                  </div>
                  <div className="px-3 py-1 bg-black/70 text-white-500 text-xs rounded-full whitespace-nowrap shadow-md">Pending</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Blood Counts */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">Latest Blood Counts</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/70 backdrop-blur-sm p-3 rounded-lg border border-gray-800">
              <span className="text-white-500 text-sm">WBC</span>
              <div className="text-red-500 text-lg">{treatmentProgress.bloodCounts.wbc}</div>
            </div>
            <div className="bg-black/70 backdrop-blur-sm p-3 rounded-lg border border-gray-800">
              <span className="text-white-500 text-sm">RBC</span>
              <div className="text-red-500 text-lg">{treatmentProgress.bloodCounts.rbc}</div>
            </div>
            <div className="bg-black/70 backdrop-blur-sm p-3 rounded-lg border border-gray-800">
              <span className="text-white-500 text-sm">Platelets</span>
              <div className="text-red-500 text-lg">{treatmentProgress.bloodCounts.platelets}</div>
            </div>
            <div className="bg-black/70 backdrop-blur-sm p-3 rounded-lg border border-gray-800">
              <span className="text-white-500 text-sm">ANC</span>
              <div className="text-red-500 text-lg">{treatmentProgress.bloodCounts.anc}</div>
            </div>
          </div>
        </div>

        {/* Progress Notes */}
        <div>
          <h3 className="text-lg font-medium mb-2 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">Progress Notes</h3>
          <div className="space-y-2">
            {treatmentProgress.progressNotes.map((note, index) => (
              <div key={index} className="bg-black/70 backdrop-blur-sm p-3 rounded-lg border border-gray-800">
                <div className="flex justify-between mb-1">
                  <span className="text-white-500 text-sm font-medium">{note.date}</span>
                </div>
                <p className="text-white-500 text-sm">{note.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render Treatment Selection and Consent Page
  const renderConsentPage = () => {
    return (
      <div className="bg-black/50 backdrop-blur-lg border border-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-3 text-white bg-clip-text">Treatment Selection & Consent</h2>
        
        {/* Treatment Options */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">Available Treatment Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {treatmentOptions.map((option, index) => {
              // Define color scheme based on option index
              const colorScheme = {
                gradient: index === 0 ? 'from-red-800 to-red-600' : 
                          index === 1 ? 'from-red-800 to-red-600' : 
                          index === 2 ? 'from-red-800 to-red-600' :
                          'from-red-800 to-red-600',
                border: index === 0 ? 'border-red-700' : 
                        index === 1 ? 'border-red-700' : 
                        index === 2 ? 'border-red-700' :
                        'border-red-700',
                bg: index === 0 ? 'bg-red-900/30' : 
                    index === 1 ? 'bg-red-900/30' : 
                    index === 2 ? 'bg-red-900/30' :
                    'bg-purple-900/30'
              };
              
              return (
                <div 
                  key={option.id} 
                  className={`p-4 rounded-lg cursor-pointer border backdrop-blur-sm ${selectedTreatment === option.id 
                    ? `${colorScheme.border} ${colorScheme.bg}` 
                    : 'border-gray-800 bg-black/30'}`}
                  onClick={() => handleTreatmentSelection(option.id)}
                >
                  <h4 className={`text-lg font-medium bg-gradient-to-r ${colorScheme.gradient} bg-clip-text text-transparent`}>{option.name}</h4>
                  <p className=" text-white text-sm mt-1">{option.description}</p>
                  <div className="flex justify-between mt-2">
                    <span className=" text-white text-sm">Duration:</span>
                    <span className="text-white text-sm">{option.duration}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Consent Recording */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">Consent Recording</h3>
          <div className="bg-black/70 backdrop-blur-sm p-4 rounded-lg border border-gray-800">
            <p className="text-gray-400 text-sm mb-4">
              Please record your consent using either video or audio. State that you consent to the selected treatment. 
              Your recording will be stored securely as part of your medical record.
            </p>
            
            {/* Recording Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Video Recording Option */}
              <div className="bg-black/50 p-3 rounded-lg border border-gray-700">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  <div className="text-xs text-gray-300">
                    <p className="mb-1"><span className="font-medium text-yellow-500">Video Consent</span></p>
                    <p>Record a video of yourself stating your consent. Make sure you're in a well-lit area and speaking clearly.</p>
                  </div>
                </div>
              </div>

              {/* Audio Recording Option */}
              <div className="bg-black/50 p-3 rounded-lg border border-gray-700">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                  </svg>
                  <div className="text-xs text-gray-300">
                    <p className="mb-1"><span className="font-medium text-yellow-500">Audio Consent</span></p>
                    <p>Record an audio statement of your consent. Ensure you're in a quiet environment with minimal background noise.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Device Access Instructions */}
            <div className="bg-black/50 p-3 rounded-lg mb-4 border border-gray-700">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div className="text-xs text-gray-300">
                  <p className="mb-1"><span className="font-medium text-yellow-500">Important:</span> You'll need to allow camera and/or microphone access when prompted.</p>
                  <p>If you experience issues, check that no other applications are using your devices and that you've granted permission in your browser settings.</p>
                </div>
              </div>
            </div>
            
            {/* Recording Controls */}
            <div className="flex flex-col gap-4 mb-4">
              {/* Video Recording Controls */}
              <button
                onClick={startVideoConsent}
                disabled={videoRecording || isAudioRecording}
                className={`px-4 py-2 rounded ${videoRecording || isAudioRecording ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white transition duration-300 flex items-center justify-center gap-2`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                {videoRecording ? 'Recording Video...' : 'Start Video Consent'}
              </button>

              {/* Audio Recording Controls */}
              <button
                onClick={startAudioConsent}
                disabled={isAudioRecording || videoRecording}
                className={`px-4 py-2 rounded ${isAudioRecording || videoRecording ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white transition duration-300 flex items-center justify-center gap-2`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                </svg>
                {isAudioRecording ? 'Recording Audio...' : 'Start Audio Consent'}
              </button>

              {isAudioRecording && (
                <div className="flex flex-col gap-2">
                  <div className="bg-black/70 p-2 rounded-lg flex items-center justify-between">
                    <div className="animate-pulse flex items-center">
                      <span className="h-2 w-2 rounded-full bg-red-600 mr-2"></span>
                      <span className="text-white text-xs font-medium">AUDIO RECORDING</span>
                    </div>
                    <div className="text-white text-xs font-medium">{audioRecordingTime}s</div>
                  </div>
                  <button
                    onClick={stopAudioRecording}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition duration-300 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path>
                    </svg>
                    Stop Audio Recording
                  </button>
                </div>
              )}
            </div>

            {/* Audio Preview */}
            {audioURL && (
              <div className="bg-black/50 p-4 rounded-lg border border-gray-700 mb-4">
                <h4 className="text-white text-lg font-medium mb-2">Audio Consent Preview</h4>
                <audio ref={audioRef} src={audioURL} controls className="w-full" />
              </div>
            )}

            {/* Video Recording Area */}
            <div className="bg-black/70 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 relative border border-gray-800" style={{ aspectRatio: '16/9' }}>
              {videoRecording ? (
                <div className="text-center w-full h-full">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    className="w-full h-full object-contain"
                    playsInline
                  />
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-2">
                    <div className="flex items-center justify-between">
                      <div className="animate-pulse flex items-center">
                        <span className="h-2 w-2 rounded-full bg-red-600 mr-2"></span>
                        <span className="text-white text-xs font-medium">RECORDING</span>
                      </div>
                      <div className="text-white text-xs font-medium">{videoRecordingTime}s</div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <button 
                      onClick={stopRecording}
                      className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg flex items-center shadow-lg transition duration-300 hover:from-red-700 hover:to-red-800"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path>
                      </svg>
                      Stop Recording
                    </button>
                  </div>
                </div>
              ) : recordingComplete ? (
                <div className="w-full h-full relative">
                  <video
                    ref={videoRef}
                    controls
                    className="w-full h-full object-contain"
                    playsInline
                  />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                    <button
                      onClick={() => {
                        setRecordingComplete(false);
                        setRecordedChunks([]);
                      }}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg shadow-lg transition duration-300"
                    >
                      Retake
                    </button>
                    <button
                      onClick={submitConsent}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg shadow-lg transition duration-300"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center mb-3 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">Click below to start recording</p>
                  <button
                    onClick={startVideoConsent}
                    className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg shadow-lg transition duration-300"
                  >
                    Start Recording
                  </button>
                </div>
              )}
            </div>
            
            {/* Recording Timer */}
            {videoRecording && (
              <div className="text-[#EA2831] text-sm font-medium">
                Recording: {Math.floor(recordingComplete / 60)}:{String(recordingComplete % 60).padStart(2, '0')}
              </div>
            )}
            
            {/* Alternative Consent Option */}
            <div className="mt-6 pt-4 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <h4 className="text-white text-sm font-medium">Having trouble with video recording?</h4>
                <button 
                  onClick={() => {
                    if (confirm("Are you sure you want to provide consent without video recording? This will be noted in your medical record.")) {
                      setRecordingComplete(true);
                      setConsentGiven(true);
                    }
                  }}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition duration-300"
                >
                  Provide Text Consent Instead
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex h-screen relative overflow-hidden transition-colors duration-500 ${
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
      
      {/* Sidebar Navigation */}
      <div className={`w-64 flex flex-col relative z-10 transition-colors duration-500 ${
        darkMode 
          ? 'bg-black/80 backdrop-blur-lg border-r border-gray-800' 
          : 'bg-white/80 backdrop-blur-lg border-r border-gray-200'
      }`}>
        {/* Header */}
        <div className={`p-6 ${darkMode ? 'border-b border-gray-800' : 'border-b border-gray-200'}`}>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">Patient Portal</h1>
        </div>
        
        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="px-3">
            <ul className="space-y-2">
              {navItems.map((item, index) => {
                // Define color scheme based on item index
                const colorScheme = {
                  gradient: index === 0 ? 'from-red-600 to-red-800' : 
                            index === 1 ? 'from-blue-600 to-blue-800' : 
                            index === 2 ? 'from-green-600 to-green-800' :
                            'from-purple-600 to-purple-800',
                  iconColor: index === 0 ? 'text-red-500' : 
                            index === 1 ? 'text-blue-500' : 
                            index === 2 ? 'text-green-500' :
                            'text-purple-500',
                  hoverBg: index === 0 ? 'hover:bg-red-900/20' : 
                          index === 1 ? 'hover:bg-blue-900/20' : 
                          index === 2 ? 'hover:bg-green-900/20' :
                          'hover:bg-purple-900/20',
                  activeBg: index === 0 ? 'bg-red-900/30' : 
                           index === 1 ? 'bg-blue-900/30' : 
                           index === 2 ? 'bg-green-900/30' :
                           'bg-purple-900/30',
                  indicator: index === 0 ? 'bg-red-500' : 
                            index === 1 ? 'bg-blue-500' : 
                            index === 2 ? 'bg-green-500' :
                            'bg-purple-500'
                };
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActivePage(item.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 backdrop-blur-sm ${
                        activePage === item.id 
                          ? `${colorScheme.activeBg} text-red-500 shadow-sm` 
                          : `text-red-500 hover:text-red-400 ${colorScheme.hoverBg}`
                      }`}
                    >
                      <span className={`mr-3 transition-colors duration-200 ${activePage === item.id ? 'text-red-500' : 'text-red-500'}`}>
                        {renderIcon(item.icon)}
                      </span>
                      <span className="font-medium text-white">{item.label}</span>
                      {activePage === item.id && (
                        <span className={`ml-auto w-1.5 h-5 ${colorScheme.indicator} rounded-full`}></span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
        
        {/* Back Button */}
        <div className={`p-4 ${darkMode ? 'border-t border-gray-800' : 'border-t border-gray-200'}`}>
          <button 
            onClick={navigateToLoginPage}
            className={`w-full px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center ${
              darkMode 
                ? 'text-gray-400 bg-black/50 backdrop-blur-sm hover:bg-red-900/20 hover:text-white' 
                : 'text-gray-600 bg-gray-100/80 backdrop-blur-sm hover:bg-red-100/50 hover:text-gray-900'
            }`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Logout
          </button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Header */}
        <header className={`p-6 flex items-center justify-between transition-colors duration-500 ${
          darkMode 
            ? 'bg-black/80 backdrop-blur-lg border-b border-gray-800' 
            : 'bg-white/80 backdrop-blur-lg border-b border-gray-200'
        }`}>
          <h2 className={`text-xl font-medium flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <span className="mr-4">
              {renderIcon(navItems.find(item => item.id === activePage)?.icon)}
            </span>
            <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
              {navItems.find(item => item.id === activePage)?.label}
            </span>
          </h2>
          <button 
            onClick={toggleDarkMode} 
            className={`p-2 rounded-full transition duration-300 ${
              darkMode 
                ? 'bg-gray-800 hover:bg-gray-700' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            aria-label="Toggle dark/light mode"
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-black/70 border border-red-900/50 flex items-center justify-center text-white font-medium">
              JS
            </div>
            <span className="text-gray-300 text-base">{patientDetails.name}</span>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-black/20 backdrop-blur-sm">
          {activePage === 'overview' && renderOverviewPage()}
          {activePage === 'details' && renderDetailsPage()}
          {activePage === 'progress' && renderProgressPage()}
          {activePage === 'consent' && renderConsentPage()}
        </div>
      </div>
    </div>
  );
};

export default PatientsNew;