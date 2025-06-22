import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { View, Text, TouchableOpacity, ScrollView } from '../components/ReactNativeWeb';

const FamilyDashboard = () => {
  const navigate = useNavigate();
  
  // State for active page
  const [activePage, setActivePage] = useState('overview');

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
    completedSteps: 2,
    totalSteps: 4,
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

  // State for doctor details
  const [doctorDetails, setDoctorDetails] = useState({
    name: 'Dr. Alex Hess',
    specialty: 'Oncologist',
    contact: 'ahess@hospital.com',
    phone: '+1 555-123-4567',
    availability: 'Mon-Fri 9am-5pm'
  });

  // State for chatbot
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // State for appointment booking
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('checkup');
  const [name, setName] = useState('');
  const [textInput, setTextInput] = useState('');
  
  // State for appointments list
  const [appointments, setAppointments] = useState([]);

  // Navigation items
  const navItems = [
    { id: 'overview', label: 'Patient Overview', icon: '👤' },
    { id: 'treatment', label: 'Treatment Progress', icon: '📈' },
    { id: 'appointments', label: 'Appointments', icon: '📅' },
    { id: 'booking', label: 'Book Appointment', icon: '➕' },
    { id: 'chat', label: 'Chat Support', icon: '💬' },
  ];

  // Handle chat message submission
  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      setChatMessages([...chatMessages, { sender: 'user', text: newMessage }]);
      setNewMessage('');
      
      try {
        const response = await fetch('http://localhost:5000/ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: newMessage })
        });
        
        if (!response.ok) throw new Error('Failed to get response');
        
        const data = await response.json();
        setChatMessages(prev => [...prev, { sender: 'bot', text: data.response }]);
      } catch (error) {
        console.error('Error:', error);
        setChatMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I\'m having trouble connecting right now. Please try again later.' }]);
      }
    }
  };

  // Handle appointment booking
  const handleBookAppointment = async () => {
    if (appointmentDate && appointmentTime && name && textInput) {
      try {
        const response = await fetch('http://localhost:5000/submit-appointment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: Date.now().toString(),
            patientName: name,
            date: appointmentDate,
            time: appointmentTime,
            type: appointmentType,
            message: textInput
          })
        });
        
        if (!response.ok) throw new Error('Failed to submit appointment');
        
        const data = await response.json();
        
        // Add new appointment to state
        setAppointments(prev => [...prev, {
          id: data.confirmationId,
          name,
          date: appointmentDate,
          time: appointmentTime,
          type: appointmentType,
          message: textInput,
          status: 'Pending'
        }]);
        
        alert(`Appointment booked successfully! Confirmation: ${data.confirmationId}`);
        
        // Reset form fields
        setAppointmentDate('');
        setAppointmentTime('');
        setName('');
        setTextInput('');
        
        // Navigate to appointments page after booking
        setActivePage('appointments');
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to book appointment. Please try again later.');
      }
    } else {
      alert('Please fill in all required fields for the appointment.');
    }
  };

  // Overview Page Component
  const OverviewPage = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Patient Details Section */}
      <div className="bg-black/50 backdrop-blur-lg border border-gray-800 rounded-xl p-6 shadow-lg h-full">
        <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">Patient Details</h2>
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(patientDetails).map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <span className="text-gray-400 text-sm">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
              <span className="text-white text-base">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Doctor Details Section */}
      <div className="bg-black/50 backdrop-blur-lg border border-gray-800 rounded-xl p-6 shadow-lg h-full">
        <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">Doctor Details</h2>
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(doctorDetails).map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <span className="text-gray-400 text-sm">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
              <span className="text-white text-base">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Treatment Progress Page Component
  const TreatmentPage = () => (
    <div className="bg-black/50 backdrop-blur-lg border border-gray-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">Treatment Progress</h2>
      
      {/* Treatment Info and Progress Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="col-span-1">
          <div className="flex flex-col gap-3">
            <div>
              <span className="text-gray-400 text-sm block">Current Phase</span>
              <span className="text-white text-lg font-medium">{treatmentProgress.currentPhase}</span>
            </div>
            <div>
              <span className="text-gray-400 text-sm block">Start Date</span>
              <span className="text-white text-lg">{treatmentProgress.startDate}</span>
            </div>
            <div>
              <span className="text-gray-400 text-sm block">Next Appointment</span>
              <span className="text-white text-lg">{treatmentProgress.nextAppointment}</span>
            </div>
          </div>
        </div>
        
        <div className="col-span-2">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm">Progress</span>
              <span className="text-white text-sm">
                {treatmentProgress.completedSteps} of {treatmentProgress.totalSteps} steps
              </span>
            </div>
            <div className="w-full bg-black/70 rounded-full h-4">
              <div 
                className="bg-red-600 h-4 rounded-full" 
                style={{ width: `${(treatmentProgress.completedSteps / treatmentProgress.totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Blood Counts */}
          <div>
            <h3 className="text-lg font-medium mb-2 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">Latest Blood Counts</h3>
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(treatmentProgress.bloodCounts).map(([key, value]) => (
                <div key={key} className="bg-black/70 p-3 rounded border border-gray-800">
                  <span className="text-gray-400 text-sm">{key.toUpperCase()}</span>
                  <div className="text-white text-lg">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Notes */}
      <div>
        <h3 className="text-lg font-medium mb-3 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">Progress Notes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {treatmentProgress.progressNotes.map((note, index) => (
            <div key={index} className="bg-black/70 p-4 rounded border border-gray-800 hover:border-red-900/50 transition duration-300">
              <div className="flex justify-between mb-1">
                <span className="text-white text-sm font-medium">{note.date}</span>
              </div>
              <p className="text-gray-400 text-sm">{note.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Appointments List Page Component
  const AppointmentsPage = () => (
    <div className="bg-black/50 backdrop-blur-lg border border-gray-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">Your Appointments</h2>
      <div className="space-y-4">
        {appointments.length > 0 ? (
          appointments.map(appointment => (
            <div key={appointment.id} className="bg-black/70 p-4 rounded-lg border border-gray-800 hover:border-red-900/50 transition duration-300">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-white text-lg font-medium">
                  {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)} Appointment
                </h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  appointment.status === 'Pending' ? 'bg-yellow-500 text-yellow-900' :
                  appointment.status === 'Confirmed' ? 'bg-green-500 text-green-900' :
                  'bg-red-500 text-white'
                }`}>
                  {appointment.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-400">Date:</span>
                  <span className="text-white ml-2">{appointment.date}</span>
                </div>
                <div>
                  <span className="text-gray-400">Time:</span>
                  <span className="text-white ml-2">{appointment.time}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400">Notes:</span>
                  <p className="text-white mt-1">{appointment.message}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No appointments booked yet</p>
            <button 
              onClick={() => setActivePage('booking')}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition duration-300"
            >
              Book Your First Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Appointment Booking Page Component
  const BookingPage = () => (
    <div className="bg-black/50 backdrop-blur-lg border border-gray-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">Book Appointment</h2>
      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-col">
          <label className="text-gray-400 text-sm mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-black/70 text-white p-2 rounded-lg mb-4 border border-gray-800 focus:border-red-900/50 focus:outline-none"
            placeholder="Enter your name"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-400 text-sm mb-1">Notes</label>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="bg-black/70 text-white p-2 rounded-lg mb-4 border border-gray-800 focus:border-red-900/50 focus:outline-none"
            placeholder="Enter any notes or concerns here"
            rows={4}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-gray-400 text-sm mb-1">Date</label>
            <input
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              className="bg-black/70 text-white p-2 rounded-lg border border-gray-800 focus:border-red-900/50 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-gray-400 text-sm mb-1">Time</label>
            <input
              type="time"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
              className="bg-black/70 text-white p-2 rounded-lg border border-gray-800 focus:border-red-900/50 focus:outline-none"
            />
          </div>
        </div>
        
        <div className="flex flex-col">
          <label className="text-gray-400 text-sm mb-1">Type</label>
          <select
            value={appointmentType}
            onChange={(e) => setAppointmentType(e.target.value)}
            className="bg-black/70 text-white p-2 rounded-lg border border-gray-800 focus:border-red-900/50 focus:outline-none"
          >
            <option value="checkup">Checkup</option>
            <option value="consultation">Consultation</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>
        <div className="flex">
          <button
            onClick={handleBookAppointment}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 mt-2 rounded transition duration-300 w-full"
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );

  // Chat Page Component
  const ChatPage = () => (
    <div className="bg-black/50 backdrop-blur-lg border border-gray-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">Chat with Us</h2>
      <div className="bg-black/70 p-6 rounded-lg overflow-y-auto mb-6 border border-gray-800" style={{ height: '400px' }}>
        {chatMessages.length > 0 ? (
          chatMessages.map((message, index) => (
            <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
              <div className={`max-w-[80%] p-3 rounded-lg ${message.sender === 'user' ? 'bg-red-900/30 border border-red-900/50 text-white' : 'bg-black/80 border border-gray-800 text-gray-300'}`}>
                {message.text}
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400 text-center">Send a message to start chatting with our support team</p>
          </div>
        )}
      </div>
      <div className="flex gap-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 bg-black/70 text-white p-4 rounded-lg border border-gray-800 focus:border-red-900/50 focus:outline-none"
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button
          onClick={handleSendMessage}
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded transition duration-300"
        >
          Send
        </button>
      </div>
    </div>
  );

  // Render the active page based on state
  const renderActivePage = () => {
    switch (activePage) {
      case 'overview':
        return <OverviewPage />;
      case 'treatment':
        return <TreatmentPage />;
      case 'appointments':
        return <AppointmentsPage />;
      case 'booking':
        return <BookingPage />;
      case 'chat':
        return <ChatPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex flex-col relative overflow-hidden dashboard-container">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-red-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-slow"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-medium"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-fast"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-slow"></div>
        <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-green-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-medium"></div>
      </div>
      
      <div className="flex h-full grow relative z-10">
        {/* Left Sidebar Navigation */}
        <div className="w-64 bg-black/50 backdrop-blur-lg border-r border-gray-800 flex flex-col">
          {/* Logo and Title */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center gap-4">
              <div className="size-5 cursor-pointer text-red-500" onClick={() => navigate('/family')}>
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path></svg>
              </div>
              <h2 className="text-xl font-semibold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent cursor-pointer" onClick={() => navigate('/family')}>
                Leukemia Analysis
              </h2>
            </div>
          </div>
          
          {/* Family Member Profile */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12"
                style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/90d1fc37-ec38-417f-8e98-a14426df8dd7.png")'}}
              />
              <div>
                <h3 className="text-white font-medium">Sarah Smith</h3>
                <p className="text-gray-400 text-sm">Family Member</p>
              </div>
            </div>
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
                    onClick={() => setActivePage('overview')}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${
                      activePage === 'overview' ? 'bg-black/70 text-white shadow-sm' : 'text-gray-400 hover:bg-black/40 hover:text-white'
                    }`}
                  >
                    <span className={`mr-3 ${activePage === 'overview' ? 'text-red-500' : 'text-gray-500'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                    </span>
                    <span className="font-medium text-white">Patient Overview</span>
                    {activePage === 'overview' && <span className="ml-auto w-1.5 h-5 bg-red-500 rounded-full"></span>}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePage('treatment')}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${
                      activePage === 'treatment' ? 'bg-black/70 text-white shadow-sm' : 'text-gray-400 hover:bg-black/40 hover:text-white'
                    }`}
                  >
                    <span className={`mr-3 ${activePage === 'treatment' ? 'text-red-500' : 'text-gray-500'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                      </svg>
                    </span>
                    <span className="font-medium text-white">Treatment Progress</span>
                    {activePage === 'treatment' && <span className="ml-auto w-1.5 h-5 bg-red-500 rounded-full"></span>}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePage('appointments')}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${
                      activePage === 'appointments' ? 'bg-black/70 text-white shadow-sm' : 'text-gray-400 hover:bg-black/40 hover:text-white'
                    }`}
                  >
                    <span className={`mr-3 ${activePage === 'appointments' ? 'text-red-500' : 'text-gray-500'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                        <line x1="16" x2="16" y1="2" y2="6"></line>
                        <line x1="8" x2="8" y1="2" y2="6"></line>
                        <line x1="3" x2="21" y1="10" y2="10"></line>
                      </svg>
                    </span>
                    <span className="font-medium text-white">Appointments</span>
                    {activePage === 'appointments' && <span className="ml-auto w-1.5 h-5 bg-red-500 rounded-full"></span>}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePage('booking')}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${
                      activePage === 'booking' ? 'bg-black/70 text-white shadow-sm' : 'text-gray-400 hover:bg-black/40 hover:text-white'
                    }`}
                  >
                    <span className={`mr-3 ${activePage === 'booking' ? 'text-red-500' : 'text-gray-500'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14"></path>
                        <path d="M5 12h14"></path>
                      </svg>
                    </span>
                    <span className="font-medium text-white">Book Appointment</span>
                    {activePage === 'booking' && <span className="ml-auto w-1.5 h-5 bg-red-500 rounded-full"></span>}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActivePage('chat')}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${
                      activePage === 'chat' ? 'bg-black/70 text-white shadow-sm' : 'text-gray-400 hover:bg-black/40 hover:text-white'
                    }`}
                  >
                    <span className={`mr-3 ${activePage === 'chat' ? 'text-red-500' : 'text-gray-500'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </span>
                    <span className="font-medium text-white">Chat Support</span>
                    {activePage === 'chat' && <span className="ml-auto w-1.5 h-5 bg-red-500 rounded-full"></span>}
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
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <header className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h1 className="text-white text-2xl font-bold">Family Dashboard</h1>
              </div>
            </header>
            
            {/* Main Content */}
            <div className="max-w-6xl mx-auto">
              {renderActivePage()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyDashboard;