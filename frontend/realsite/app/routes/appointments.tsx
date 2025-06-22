import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardStyles } from '../components/site.js';
import { View, Text, TouchableOpacity, ScrollView } from '../components/ReactNativeWeb';
import { Link } from 'react-router-dom';

const AppointmentsPage = () => {
  const navigate = useNavigate();
  
  // State for appointments
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [referDoctor, setReferDoctor] = useState('');
  
  // Available doctors for referral
  const availableDoctors = [
    "Dr. Emily Chen",
    "Dr. Robert Wilson",
    "Dr. Maria Garcia",
    "Dr. James Taylor"
  ];

  // Fetch appointments from the local endpoint
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/get-appointments');
        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }
        const data = await response.json();
        
        // Transform API data to match expected format
        const formattedAppointments = data.map((appointment) => ({
          id: appointment.id,
          patientName: appointment.patientName || 'Unknown Patient',
          date: appointment.date || 'No Date',
          time: appointment.time || 'No Time',
          type: appointment.type || 'Unknown Type',
          status: appointment.status || 'Pending',
          doctorMessage: appointment.doctor_notes,
          referredTo: appointment.referred_to
        }));
        
        setAppointments(formattedAppointments);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        // Fallback to empty array if API fails
        setAppointments([]);
      }
    };

    fetchAppointments();
  }, []);

  // Function to navigate back to doctor dashboard with error handling
  const navigateToDoctorDashboard = () => {
    try {
      navigate('/doctor');
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to home if doctor route fails
      navigate('/');
    }
  };

  // Function to handle appointment actions (approve, decline, refer)
  const handleAppointmentAction = async (appointmentId, action) => {
    try {
      // Prepare data for API call
      const requestData = {
        appointmentId,
        action,
        message: actionMessage,
        referDoctor: action === 'refer' ? referDoctor : undefined
      };

      // In a real app, you would send this to your backend
      // const response = await fetch('/update-appointment', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(requestData),
      // });
      
      // For demonstration, just update the local state
      const updatedAppointments = appointments.map(appointment => {
        if (appointment.id === appointmentId) {
          let newStatus;
          switch(action) {
            case 'approve':
              newStatus = 'Approved';
              break;
            case 'decline':
              newStatus = 'Declined';
              break;
            case 'refer':
              newStatus = `Referred to ${referDoctor}`;
              break;
            default:
              newStatus = appointment.status;
          }
          
          return {
            ...appointment,
            status: newStatus,
            doctorMessage: actionMessage,
            referredTo: action === 'refer' ? referDoctor : appointment.referredTo
          };
        }
        return appointment;
      });
      
      setAppointments(updatedAppointments);
      setSelectedAppointment(null);
      setActionMessage('');
      setReferDoctor('');
      
    } catch (err) {
      console.error('Error updating appointment:', err);
      alert('Failed to update appointment. Please try again.');
    }
  };

  // Modal for appointment actions
  const renderActionModal = () => {
    if (!selectedAppointment) return null;
    
    const appointment = appointments.find(a => a.id === selectedAppointment);
    if (!appointment) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-[#292929] p-6 rounded-lg w-full max-w-md">
          <h3 className="text-[#FFFFFF] text-xl font-bold mb-4">
            Appointment Action - {appointment.patientName}
          </h3>
          
          <div className="mb-4">
            <p className="text-[#ABABAB] mb-1">Date & Time</p>
            <p className="text-[#FFFFFF]">{appointment.date} at {appointment.time}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-[#ABABAB] mb-1">Type</p>
            <p className="text-[#FFFFFF]">{appointment.type}</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-[#ABABAB] mb-1">Message (optional)</label>
            <textarea 
              className="w-full p-2 bg-[#212121] border border-[#404040] rounded text-white"
              rows="3"
              value={actionMessage}
              onChange={(e) => setActionMessage(e.target.value)}
              placeholder="Add a message for the patient..."
            />
          </div>
          
          {/* Referral doctor selection - shown only for referral */}
          {selectedAppointment && (
            <div className="mb-4">
              <label className="block text-[#ABABAB] mb-1">Refer to Doctor</label>
              <select 
                className="w-full p-2 bg-[#212121] border border-[#404040] rounded text-white"
                value={referDoctor}
                onChange={(e) => setReferDoctor(e.target.value)}
              >
                <option value="">Select a doctor</option>
                {availableDoctors.map((doctor, index) => (
                  <option key={index} value={doctor}>{doctor}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className="flex justify-between mt-6">
            <button 
              className="px-4 py-2 bg-[#EA2831] text-white rounded-lg"
              onClick={() => setSelectedAppointment(null)}
            >
              Cancel
            </button>
            
            <div className="flex gap-2">
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
                onClick={() => handleAppointmentAction(selectedAppointment, 'decline')}
              >
                Decline
              </button>
              
              <button 
                className="px-4 py-2 bg-yellow-500 text-black rounded-lg"
                onClick={() => handleAppointmentAction(selectedAppointment, 'refer')}
                disabled={!referDoctor}
              >
                Refer
              </button>
              
              <button 
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
                onClick={() => handleAppointmentAction(selectedAppointment, 'approve')}
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
              <div className="size-5 cursor-pointer text-red-500" onClick={navigateToDoctorDashboard}>
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path></svg>
              </div>
              <h2 className="text-xl font-semibold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent cursor-pointer" onClick={navigateToDoctorDashboard}>
                Leukemia Analysis
              </h2>
            </div>
          </div>
          
          {/* Doctor Profile */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12"
                style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/90d1fc37-ec38-417f-8e98-a14426df8dd7.png")'}}
              />
              <div>
                <h3 className="text-white font-medium">Dr. Alex Hess</h3>
                <p className="text-gray-400 text-sm">Oncologist</p>
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
                    onClick={navigateToDoctorDashboard}
                    className="w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 text-gray-400 hover:bg-black/40 hover:text-white"
                  >
                    <span className="mr-3 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                    </span>
                    <span className="font-medium text-white">Dashboard</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/appointment')}
                    className="w-full flex items-center px-4 py-3 rounded-lg transition-all duration-300 bg-black/70 text-white shadow-sm"
                  >
                    <span className="mr-3 text-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                        <line x1="16" x2="16" y1="2" y2="6"></line>
                        <line x1="8" x2="8" y1="2" y2="6"></line>
                        <line x1="3" x2="21" y1="10" y2="10"></line>
                      </svg>
                    </span>
                    <span className="font-medium text-white">Appointments</span>
                    <span className="ml-auto w-1.5 h-5 bg-red-500 rounded-full"></span>
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
          {/* Appointment Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <header className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h1 className="text-white text-2xl font-bold">Appointments Management</h1>
              </div>
            </header>

            {/* Main Content */}
            <div className="bg-black/50 backdrop-blur-lg border border-gray-800 rounded-xl p-6 shadow-lg">
              <div>
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="text-white text-lg">Loading appointments...</div>
                  </div>
                ) : error ? (
                  <div className="bg-red-500 bg-opacity-20 p-4 rounded-lg">
                    <p className="text-red-400">Error loading appointments: {error}</p>
                  </div>
                ) : (
                  <div className="bg-[#212121] rounded-lg p-6">
                    <h2 className="text-[#FFFFFF] text-2xl font-bold mb-6">Pending Appointments</h2>
                    
                    {/* Appointments List */}
                    {appointments.length === 0 ? (
                      <div className="text-center py-10">
                        <p className="text-[#ABABAB]">No appointments found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {appointments.map((appointment) => (
                          <div key={appointment.id} className="bg-[#292929] p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="text-[#FFFFFF] text-lg font-medium">{appointment.patientName}</h3>
                              <span className={`px-2 py-1 rounded text-xs ${
                                appointment.status === 'Approved' ? 'bg-green-600 text-white' : 
                                appointment.status === 'Declined' ? 'bg-red-600 text-white' : 
                                appointment.status.startsWith('Referred') ? 'bg-blue-500 text-white' : 
                                'bg-yellow-500 text-black'
                              }`}>
                                {appointment.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <div>
                                <span className="text-[#ABABAB] text-sm">Date</span>
                                <p className="text-[#FFFFFF]">{appointment.date}</p>
                              </div>
                              <div>
                                <span className="text-[#ABABAB] text-sm">Time</span>
                                <p className="text-[#FFFFFF]">{appointment.time}</p>
                              </div>
                              <div>
                                <span className="text-[#ABABAB] text-sm">Type</span>
                                <p className="text-[#FFFFFF]">{appointment.type}</p>
                              </div>
                            </div>
                            
                            {/* Doctor's message if exists */}
                            {appointment.doctorMessage && (
                              <div className="mt-2 mb-3 p-2 bg-[#1a1a1a] rounded">
                                <span className="text-[#ABABAB] text-sm">Doctor's Message:</span>
                                <p className="text-[#FFFFFF]">{appointment.doctorMessage}</p>
                              </div>
                            )}
                            
                            {/* Referred doctor if exists */}
                            {appointment.referredTo && (
                              <div className="mt-2 mb-3">
                                <span className="text-[#ABABAB] text-sm">Referred To:</span>
                                <p className="text-[#FFFFFF]">{appointment.referredTo}</p>
                              </div>
                            )}
                            
                            {/* Action buttons */}
                            {appointment.status === 'Pending' && (
                              <div className="flex justify-end mt-2">
                                <button 
                                  className="bg-[#EA2831] text-white px-4 py-2 rounded-lg"
                                  onClick={() => setSelectedAppointment(appointment.id)}
                                >
                                  Review
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Modal */}
      {renderActionModal()}
    </div>
  );
};

export default AppointmentsPage;