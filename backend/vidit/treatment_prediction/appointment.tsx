import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardStyles } from '../components/site.js';
import { View, Text, TouchableOpacity, ScrollView } from '../components/ReactNativeWeb';
import { Link } from 'react-router-dom';
import google.generativeai as genai
const AppointmentsPage = () => {
  const navigate = useNavigate();
  
  // State for appointments
  const [appointments, setAppointments] = useState<Array<any>>([]);
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
        const formattedAppointments = data.map((appointment: any) => ({
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
            ></textarea>
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
    <div className="relative flex min-h-screen bg-black dark group/design-root overflow-x-hidden">
      {/* Left Navigation */}
      <div className="w-80 min-h-screen border-r border-[#292929] bg-black">
        <div className="flex flex-col h-full min-h-[700px] justify-between bg-black p-4">
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/1bb85115-eab1-407c-903a-69c8779e4ae3.png")'}}
              ></div>
              <div className="flex flex-col">
                <h1 className="text-[#FFFFFF] text-base font-medium leading-normal">City Hospital</h1>
                <p className="text-[#ABABAB] text-sm font-normal leading-normal">Welcome, Doctor</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-6">
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
                <div className="text-[#FFFFFF]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M240,160v24a16,16,0,0,1-16,16H115.93a4,4,0,0,1-3.24-6.35L174.27,109a8.21,8.21,0,0,0-1.37-11.3,8,8,0,0,0-11.37,1.61l-72,99.06A4,4,0,0,1,86.25,200H32a16,16,0,0,1-16-16V161.13c0-1.79,0-3.57.13-5.33a4,4,0,0,1,4-3.8H48a8,8,0,0,0,8-8.53A8.17,8.17,0,0,0,47.73,136H23.92a4,4,0,0,1-3.87-5c12-43.84,49.66-77.13,95.52-82.28a4,4,0,0,1,4.43,4V80a8,8,0,0,0,8.53,8A8.17,8.17,0,0,0,136,79.73V52.67a4,4,0,0,1,4.43-4A112.18,112.18,0,0,1,236.23,131a4,4,0,0,1-3.88,5H208.27a8.17,8.17,0,0,0-8.25,7.47,8,8,0,0,0,8,8.53h27.92a4,4,0,0,1,4,3.86C240,157.23,240,158.61,240,160Z"></path>
                  </svg>
                </div>
                <p className="text-[#FFFFFF] text-sm font-medium leading-normal">Dashboard</p>
              </div>
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="text-[#FFFFFF]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M160,40a32,32,0,1,0-32,32A32,32,0,0,0,160,40ZM128,56a16,16,0,1,1,16-16A16,16,0,0,1,128,56Zm90.34,78.05L173.17,82.83a32,32,0,0,0-24-10.83H106.83a32,32,0,0,0-24,10.83L37.66,134.05a20,20,0,0,0,28.13,28.43l16.3-13.08L65.55,212.28A20,20,0,0,0,102,228.8l26-44.87,26,44.87a20,20,0,0,0,36.41-16.52L173.91,149.4l16.3,13.08a20,20,0,0,0,28.13-28.43Zm-11.51,16.77a4,4,0,0,1-5.66,0c-.21-.2-.42-.4-.65-.58L165,121.76A8,8,0,0,0,152.26,130L175.14,217a7.72,7.72,0,0,0,.48,1.35,4,4,0,0,1-7.25,3.38,6.25,6.25,0,0,0-.33-.63L134.92,164a8,8,0,0,0-13.84,0L88,221.05a6.25,6.25,0,0,0-.33.63,4,4,0,0,1-2.26,2.07,4,4,0,0,1-5-5.45,7.72,7.72,0,0,0,.48-1.35L103.74,130A8,8,0,0,0,91,121.76L55.48,150.24c-.23.18-.44.38-.65.58a4,4,0,1,1-5.66-5.65c.12-.12.23-.24.34-.37L94.83,93.41a16,16,0,0,1,12-5.41h42.34a16,16,0,0,1,12,5.41l45.32,51.39c.11.13.22.25.34.37A4,4,0,0,1,206.83,150.82Z"></path>
                  </svg>
                </div>
                <p className="text-[#FFFFFF] text-sm font-medium leading-normal">Patients</p>
              </div>
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="text-[#FFFFFF]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M208,40H48A16,16,0,0,0,32,56v58.77c0,89.61,75.82,119.34,91,124.39a15.53,15.53,0,0,0,10,0c15.2-5.05,91-34.78,91-124.39V56A16,16,0,0,0,208,40ZM128,224c-9.26-3.08-43.29-16.32-63.87-49.5L128,129.76l63.87,44.71C171.31,207.61,137.34,220.85,128,224Zm80-109.18c0,17.64-3.36,32.63-8.72,45.34l-66.69-46.68a8,8,0,0,0-9.18,0L56.72,160.13C51.36,147.42,48,132.43,48,114.79V56l160,0Z"></path>
                  </svg>
                </div>
                <p className="text-[#FFFFFF] text-sm font-medium leading-normal">Reports</p>
              </div>
              <Link to="/appointment" className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#292929]">
                <div className="text-[#FFFFFF]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm29.66-93.66a8,8,0,0,1,0,11.32l-40,40a8,8,0,0,1-11.32-11.32L140.69,128,106.34,93.66a8,8,0,0,1,11.32-11.32Z"></path>
                  </svg>
                </div>
                <p className="text-[#FFFFFF] text-sm font-medium leading-normal">Appointments</p>
              </Link>
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="text-[#FFFFFF]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M176,56H80a72,72,0,0,0,0,144h96a72,72,0,0,0,0-144Zm0,128H80A56,56,0,0,1,80,72h96a56,56,0,0,1,0,112Zm0-96a40,40,0,1,0,40,40A40,40,0,0,0,176,88Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,176,152Z"></path>
                  </svg>
                </div>
                <p className="text-[#FFFFFF] text-sm font-medium leading-normal">Settings</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#292929] px-10 py-3">
          <div className="flex items-center gap-4 text-[#FFFFFF]">
            <div className="size-4 cursor-pointer" onClick={navigateToDoctorDashboard}>
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path></svg>
            </div>
            <h2 className="text-[#FFFFFF] text-lg font-bold leading-tight tracking-[-0.015em] cursor-pointer" onClick={navigateToDoctorDashboard}>Leukemia Treatment Analysis System</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#EA2831] text-[#FFFFFF] text-sm font-bold leading-normal tracking-[0.015em]">
              <span className="truncate">Dr. Alex Hess</span>
            </button>
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/90d1fc37-ec38-417f-8e98-a14426df8dd7.png")'}}
            ></div>
          </div>
        </header>

        {/* Appointment Content */}
        <div className="flex-1">
          <header className="flex items-center justify-between p-4 border-b border-[#292929]">
            <div className="flex items-center gap-3">
              <h1 className="text-[#FFFFFF] text-xl font-bold">Appointments Management</h1>
            </div>
          </header>

          {/* Main Content */}
          <ScrollView style={{ flex: 1 }}>
            <div className="p-4">
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
          </ScrollView>
        </div>
      </div>
      
      {/* Action Modal */}
      {renderActionModal()}
    </div>
  );
};

export default AppointmentsPage;