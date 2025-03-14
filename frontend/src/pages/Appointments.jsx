// import React, { useState, useEffect } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// // import { setAppointments, setLoading, setError } from '../store/slices/appointment-slice';
// import styled from 'styled-components';
// import Header from '../components/Header';
// import Sidebar from '../components/Sidebar';
// import { Calendar, momentLocalizer } from 'react-big-calendar';
// import 'react-big-calendar/lib/css/react-big-calendar.css';
// import moment from 'moment';
// import { Dialog, Transition } from '@headlessui/react';
// import { Fragment } from 'react';
// import { useGoogleLogin } from '@react-oauth/google';
// import { toast } from 'react-toastify';

// // Set up the localizer for react-big-calendar
// const localizer = momentLocalizer(moment);

// // List of available doctors
// const doctors = [
//   { id: 1, name: 'Dr. Jane Smith', specialty: 'General Practitioner', calendarId: 'drjanesmith@example.com' },
//   { id: 2, name: 'Dr. John Doe', specialty: 'Cardiologist', calendarId: 'drjohndoe@example.com' },
//   { id: 3, name: 'Dr. Emily Chen', specialty: 'Pediatrician', calendarId: 'dremilychen@example.com' },
// ];

// export default function Appointments() {
//   const dispatch = useDispatch();
//   // const { appointments, loading, error } = useSelector((state) => state.appointments);
//   const user = useSelector((state) => state.auth.user);
  
//   const [activeTab, setActiveTab] = useState('upcoming');
//   const [showBookingForm, setShowBookingForm] = useState(false);
//   const [selectedDoctor, setSelectedDoctor] = useState(null);
//   const [selectedSlot, setSelectedSlot] = useState(null);
//   const [availableSlots, setAvailableSlots] = useState([]);
//   const [googleToken, setGoogleToken] = useState(null);
  
//   // Calendar view state
//   const [calendarView, setCalendarView] = useState('month');
//   const [showCalendar, setShowCalendar] = useState(false);
  
//   // Sidebar state
//   const [sidebarOpen, setSidebarOpen] = useState(false);
  
//   // Form state
//   const [appointmentType, setAppointmentType] = useState('in_person');
//   const [appointmentDate, setAppointmentDate] = useState('');
//   const [appointmentTime, setAppointmentTime] = useState('');
//   const [symptoms, setSymptoms] = useState('');
//   const [doctorNote, setDoctorNote] = useState('');
  
//   // Google Login setup
//   const login = useGoogleLogin({
//     onSuccess: (tokenResponse) => {
//       setGoogleToken(tokenResponse.access_token);
//       fetchAvailableSlots(selectedDoctor, tokenResponse.access_token);
//     },
//     onError: (error) => {
//       console.error('Google Login Error:', error);
//       toast.error('Failed to connect to Google Calendar. Please try again.');
//     },
//     scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events',
//   });
  
//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };
  
//   useEffect(() => {
//     const fetchAppointments = async () => {
//       if (!user) return;
      
//       // dispatch(setLoading(true));
//       try {
//         // In a real app, you would fetch appointments from the API
//         // const response = await fetch('/api/appointments/');
//         // const data = await response.json();
        
//         // For now, we'll use mock data
//         const mockData = [
//           {
//             id: 1,
//             date: '2025-03-20',
//             time: '10:00',
//             type: 'in_person',
//             status: 'scheduled',
//             doctor: 'Dr. Jane Smith',
//             symptoms: 'Fever, cough',
//             notes: 'Follow-up on previous visit'
//           },
//           {
//             id: 2,
//             date: '2025-03-25',
//             time: '14:30',
//             type: 'virtual',
//             status: 'scheduled',
//             doctor: 'Dr. John Doe',
//             symptoms: 'Headache, fatigue',
//             notes: 'Initial consultation'
//           },
//           {
//             id: 3,
//             date: '2025-02-15',
//             time: '09:15',
//             type: 'in_person',
//             status: 'completed',
//             doctor: 'Dr. Jane Smith',
//             symptoms: 'Sore throat',
//             notes: 'Prescribed antibiotics'
//           }
//         ];
        
//         // dispatch(setAppointments(mockData));
//       } catch (err) {
//         console.error('Error fetching appointments:', err);
//         // dispatch(setError('Failed to load appointments. Please try again.'));
//       } finally {
//         // dispatch(setLoading(false));
//       }
//     };
    
//     fetchAppointments();
//   }, [dispatch, user]);
  
//   const fetchAvailableSlots = async (doctor, token) => {
//     if (!doctor || !token) return;
    
//     // dispatch(setLoading(true));
//     try {
//       // In a real app, you would fetch available slots from the Google Calendar API
//       // This is a simplified mock implementation
      
//       const today = new Date();
//       const twoWeeksFromNow = new Date();
//       twoWeeksFromNow.setDate(today.getDate() + 14);
      
//       // Simulate API call to fetch the doctor's calendar
//       const mockSlots = generateMockAvailableSlots(doctor.id, today, twoWeeksFromNow);
//       setAvailableSlots(mockSlots);
      
//       // Set default appointment date to the first available slot
//       if (mockSlots.length > 0) {
//         const firstSlot = mockSlots[0];
//         setAppointmentDate(moment(firstSlot.start).format('YYYY-MM-DD'));
//         setAppointmentTime(moment(firstSlot.start).format('HH:mm'));
//       }
      
//       setShowCalendar(true);
//     } catch (err) {
//       console.error('Error fetching available slots:', err);
//       toast.error('Failed to fetch available appointment slots. Please try again.');
//     } finally {
//       // dispatch(setLoading(false));
//     }
//   };
  
//   // Helper function to generate mock available slots
//   const generateMockAvailableSlots = (doctorId, startDate, endDate) => {
//     const slots = [];
//     const currentDate = new Date(startDate);
    
//     while (currentDate <= endDate) {
//       // Skip weekends
//       if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
//         // Morning slots
//         for (let hour = 9; hour < 12; hour++) {
//           const slotStart = new Date(currentDate);
//           slotStart.setHours(hour, 0, 0);
          
//           const slotEnd = new Date(slotStart);
//           slotEnd.setMinutes(slotStart.getMinutes() + 30);
          
//           // Random availability (70% chance of being available)
//           if (Math.random() > 0.3) {
//             slots.push({
//               title: 'Available',
//               start: slotStart,
//               end: slotEnd,
//               doctorId: doctorId
//             });
//           }
//         }
        
//         // Afternoon slots
//         for (let hour = 13; hour < 17; hour++) {
//           const slotStart = new Date(currentDate);
//           slotStart.setHours(hour, 0, 0);
          
//           const slotEnd = new Date(slotStart);
//           slotEnd.setMinutes(slotStart.getMinutes() + 30);
          
//           // Random availability (70% chance of being available)
//           if (Math.random() > 0.3) {
//             slots.push({
//               title: 'Available',
//               start: slotStart,
//               end: slotEnd,
//               doctorId: doctorId
//             });
//           }
//         }
//       }
      
//       // Move to next day
//       currentDate.setDate(currentDate.getDate() + 1);
//     }
    
//     return slots;
//   };
  
//   const handleSelectDoctor = (doctor) => {
//     setSelectedDoctor(doctor);
    
//     if (googleToken) {
//       fetchAvailableSlots(doctor, googleToken);
//     } else {
//       login();
//     }
//   };
  
//   const handleSelectSlot = (slot) => {
//     setSelectedSlot(slot);
//     setAppointmentDate(moment(slot.start).format('YYYY-MM-DD'));
//     setAppointmentTime(moment(slot.start).format('HH:mm'));
//   };
  
//   const handleBookAppointment = async (e) => {
//     e.preventDefault();
    
//     if (!selectedDoctor || !selectedSlot) {
//       toast.error('Please select a doctor and appointment slot.');
//       return;
//     }
    
//     // dispatch(setLoading(true));
//     try {
//       // In a real app, you would:
//       // 1. Call the Google Calendar API to create an event
//       // 2. Set appropriate permissions for the event
//       // 3. Save the appointment in your database
      
//       // For now, we'll simulate this with a delay
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       const newAppointment = {
//         id: Date.now(), // temporary ID
//         date: appointmentDate,
//         time: appointmentTime,
//         type: appointmentType,
//         status: 'scheduled',
//         doctor: selectedDoctor.name,
//         symptoms,
//         notes: doctorNote
//       };
      
//       // dispatch(setAppointments([...appointments, newAppointment]));
      
//       // Remove the booked slot from available slots
//       const updatedSlots = availableSlots.filter(
//         slot => !(moment(slot.start).format('YYYY-MM-DD HH:mm') === `${appointmentDate} ${appointmentTime}`)
//       );
//       setAvailableSlots(updatedSlots);
      
//       toast.success('Appointment booked successfully!');
      
//       // Reset form
//       resetForm();
//     } catch (err) {
//       console.error('Error booking appointment:', err);
//       toast.error('Failed to book appointment. Please try again.');
//     } finally {
//       // dispatch(setLoading(false));
//     }
//   };
  
//   const resetForm = () => {
//     setAppointmentType('in_person');
//     setAppointmentDate('');
//     setAppointmentTime('');
//     setSymptoms('');
//     setDoctorNote('');
//     setSelectedDoctor(null);
//     setSelectedSlot(null);
//     setShowBookingForm(false);
//     setShowCalendar(false);
//   };
  
//   const cancelAppointment = async (id) => {
//     // dispatch(setLoading(true));
//     try {
//       // In a real app, you would:
//       // 1. Call the Google Calendar API to delete or update the event
//       // 2. Update your database
      
//       // For now, we'll simulate this with a delay
//       await new Promise(resolve => setTimeout(resolve, 500));
      
//       // const updatedAppointments = appointments.map(appointment => 
//       //   appointment.id === id ? { ...appointment, status: 'cancelled' } : appointment
//       // );
      
//       // dispatch(setAppointments(updatedAppointments));
//       toast.success('Appointment cancelled successfully.');
//     } catch (err) {
//       console.error('Error cancelling appointment:', err);
//       toast.error('Failed to cancel appointment. Please try again.');
//     } finally {
//       // dispatch(setLoading(false));
//     }
//   };
  
//   // const upcomingAppointments = appointments.filter(
//   //   appointment => appointment.status === 'scheduled'
//   // );
  
//   // const pastAppointments = appointments.filter(
//   //   appointment => appointment.status === 'completed' || appointment.status === 'cancelled'
//   // );
  
//   // Function to format events for the calendar
//   const formatCalendarEvents = (slots) => {
//     return slots.map(slot => ({
//       ...slot,
//       title: 'Available',
//       allDay: false
//     }));
//   };
  
//   if (loading) {
//     return (
//       <AppContainer>
//         <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
//         <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
//         <MainContent sidebarOpen={sidebarOpen}>
//           <div className="flex justify-center py-10">
//             <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
//             <span className="ml-3">Loading appointments...</span>
//           </div>
//         </MainContent>
//       </AppContainer>
//     );
//   }
  
//   if (error) {
//     return (
//       <AppContainer>
//         <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
//         <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
//         <MainContent sidebarOpen={sidebarOpen}>
//           <div className="text-red-500 text-center py-10">{error}</div>
//         </MainContent>
//       </AppContainer>
//     );
//   }
  
//   if (!user) {
//     return (
//       <AppContainer>
//         <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
//         <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
//         <MainContent sidebarOpen={sidebarOpen}>
//           <AppointmentsContainer>
//             <HeaderContainer>
//               <HeaderTitle>Manage Your Appointments</HeaderTitle>
//               <HeaderDescription>Please sign in to view and manage your appointments.</HeaderDescription>
//             </HeaderContainer>
//           </AppointmentsContainer>
//         </MainContent>
//       </AppContainer>
//     );
//   }
  
//   return (
//     <AppContainer>
//       <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
//       <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
//       <MainContent sidebarOpen={sidebarOpen}>
//         <AppointmentsContainer>
//           <HeaderContainer>
//             <HeaderTitle>Manage Your Appointments</HeaderTitle>
//             <HeaderDescription>Schedule and track appointments with healthcare providers.</HeaderDescription>
//             <Button onClick={() => setShowBookingForm(true)} className="mb-6">
//               Book New Appointment
//             </Button>
//           </HeaderContainer>
          
//           {/* Booking Form Modal */}
//           <Transition appear show={showBookingForm} as={Fragment}>
//             <Dialog
//               as="div"
//               className="fixed inset-0 z-50 overflow-y-auto"
//               onClose={() => {
//                 if (!loading) {
//                   resetForm();
//                 }
//               }}
//             >
//               <div className="min-h-screen px-4 text-center">
//                 <Transition.Child
//                   as={Fragment}
//                   enter="ease-out duration-300"
//                   enterFrom="opacity-0"
//                   enterTo="opacity-100"
//                   leave="ease-in duration-200"
//                   leaveFrom="opacity-100"
//                   leaveTo="opacity-0"
//                 >
//                   <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
//                 </Transition.Child>
                
//                 <span className="inline-block h-screen align-middle" aria-hidden="true">
//                   &#8203;
//                 </span>
                
//                 <Transition.Child
//                   as={Fragment}
//                   enter="ease-out duration-300"
//                   enterFrom="opacity-0 scale-95"
//                   enterTo="opacity-100 scale-100"
//                   leave="ease-in duration-200"
//                   leaveFrom="opacity-100 scale-100"
//                   leaveTo="opacity-0 scale-95"
//                 >
//                   <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
//                     <Dialog.Title
//                       as="h3"
//                       className="text-lg font-medium leading-6 text-gray-900"
//                     >
//                       Book New Appointment
//                     </Dialog.Title>
                    
//                     {!selectedDoctor ? (
//                       <div className="mt-4">
//                         <p className="text-sm text-gray-500 mb-4">
//                           Please select a healthcare provider to view their available slots.
//                         </p>
//                         <div className="grid grid-cols-1 gap-4">
//                           {doctors.map((doctor) => (
//                             <div
//                               key={doctor.id}
//                               className="p-4 border rounded-md cursor-pointer hover:bg-blue-50"
//                               onClick={() => handleSelectDoctor(doctor)}
//                             >
//                               <h4 className="font-medium">{doctor.name}</h4>
//                               <p className="text-sm text-gray-500">{doctor.specialty}</p>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     ) : showCalendar ? (
//                       <div className="mt-4">
//                         <div className="flex items-center justify-between mb-4">
//                           <h4 className="font-medium">{selectedDoctor.name}</h4>
//                           <button
//                             type="button"
//                             className="text-sm text-blue-500 hover:text-blue-700"
//                             onClick={() => {
//                               setSelectedDoctor(null);
//                               setShowCalendar(false);
//                             }}
//                           >
//                             Change Doctor
//                           </button>
//                         </div>
                        
//                         <div className="mb-4">
//                           <div className="flex space-x-2 mb-2">
//                             <button
//                               type="button"
//                               className={`px-3 py-1 text-sm rounded ${
//                                 calendarView === 'month' 
//                                   ? 'bg-blue-500 text-white'
//                                   : 'bg-gray-200 text-gray-700'
//                               }`}
//                               onClick={() => setCalendarView('month')}
//                             >
//                               Month
//                             </button>
//                             <button
//                               type="button"
//                               className={`px-3 py-1 text-sm rounded ${
//                                 calendarView === 'week' 
//                                   ? 'bg-blue-500 text-white'
//                                   : 'bg-gray-200 text-gray-700'
//                               }`}
//                               onClick={() => setCalendarView('week')}
//                             >
//                               Week
//                             </button>
//                             <button
//                               type="button"
//                               className={`px-3 py-1 text-sm rounded ${
//                                 calendarView === 'day' 
//                                   ? 'bg-blue-500 text-white'
//                                   : 'bg-gray-200 text-gray-700'
//                               }`}
//                               onClick={() => setCalendarView('day')}
//                             >
//                               Day
//                             </button>
//                           </div>
                          
//                           <div style={{ height: 400 }}>
//                             <Calendar
//                               localizer={localizer}
//                               events={formatCalendarEvents(availableSlots)}
//                               startAccessor="start"
//                               endAccessor="end"
//                               view={calendarView}
//                               onView={setCalendarView}
//                               onSelectEvent={handleSelectSlot}
//                               style={{ height: '100%' }}
//                               className="rounded border shadow"
//                             />
//                           </div>
//                         </div>
                        
//                         {selectedSlot && (
//                           <form onSubmit={handleBookAppointment} className="space-y-4">
//                             <div>
//                               <FormLabel>Appointment Date</FormLabel>
//                               <FormInput
//                                 type="date"
//                                 value={appointmentDate}
//                                 onChange={(e) => setAppointmentDate(e.target.value)}
//                                 disabled
//                                 required
//                               />
//                             </div>
                            
//                             <div>
//                               <FormLabel>Appointment Time</FormLabel>
//                               <FormInput
//                                 type="time"
//                                 value={appointmentTime}
//                                 onChange={(e) => setAppointmentTime(e.target.value)}
//                                 disabled
//                                 required
//                               />
//                             </div>
                            
//                             <div>
//                               <FormLabel>Appointment Type</FormLabel>
//                               <FormSelect
//                                 value={appointmentType}
//                                 onChange={(e) => setAppointmentType(e.target.value)}
//                               >
//                                 <option value="in_person">In-Person</option>
//                                 <option value="virtual">Virtual</option>
//                               </FormSelect>
//                             </div>
                            
//                             <div>
//                               <FormLabel>Symptoms or Reason</FormLabel>
//                               <FormTextarea
//                                 value={symptoms}
//                                 onChange={(e) => setSymptoms(e.target.value)}
//                                 rows="3"
//                                 required
//                               />
//                             </div>
                            
//                             <div>
//                               <FormLabel>Additional Notes for Doctor</FormLabel>
//                               <FormTextarea
//                                 value={doctorNote}
//                                 onChange={(e) => setDoctorNote(e.target.value)}
//                                 rows="2"
//                               />
//                             </div>
                            
//                             <FormButtonContainer>
//                               <Button type="submit" disabled={loading}>
//                                 {loading ? 'Booking...' : 'Book Appointment'}
//                               </Button>
//                               <Button 
//                                 type="button"
//                                 variant="outline"
//                                 onClick={() => resetForm()}
//                                 disabled={loading}
//                               >
//                                 Cancel
//                               </Button>
//                             </FormButtonContainer>
//                           </form>
//                         )}
//                       </div>
//                     ) : (
//                       <div className="mt-4">
//                         <p className="text-center py-6">Loading calendar...</p>
//                       </div>
//                     )}
//                   </div>
//                 </Transition.Child>
//               </div>
//             </Dialog>
//           </Transition>

//           <TabContainer>
//             <TabHeader>
//               <TabNav>
//                 <TabButton
//                   className={activeTab === 'upcoming' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
//                   onClick={() => setActiveTab('upcoming')}
//                 >
//                   Upcoming Appointments
//                 </TabButton>
//                 <TabButton
//                   className={activeTab === 'past' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
//                   onClick={() => setActiveTab('past')}
//                 >
//                   Past Appointments
//                 </TabButton>
//               </TabNav>
//             </TabHeader>
//             <TabContent>
//               {activeTab === 'upcoming' ? (
//                 upcomingAppointments && upcomingAppointments.length > 0 ? (
//                   <AppointmentList>
//                     {upcomingAppointments.map((appointment) => (
//                       <AppointmentItem key={appointment.id}>
//                         <AppointmentInfo>
//                           <div>
//                             <p className="font-medium text-gray-900">
//                               {appointment.date} at {appointment.time}
//                             </p>
//                             <p className="text-gray-500">
//                               {appointment.type === 'in_person' ? 'In-Person' : 'Virtual'} with {appointment.doctor}
//                             </p>
//                             <p className="text-sm text-gray-500 mt-1">
//                               <span className="font-medium">Reason:</span> {appointment.symptoms}
//                             </p>
//                             {appointment.notes && (
//                               <p className="text-sm text-gray-500">
//                                 <span className="font-medium">Notes:</span> {appointment.notes}
//                               </p>
//                             )}
//                           </div>
//                           <div>
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               onClick={() => cancelAppointment(appointment.id)}
//                               className="text-red-600 border-red-300 hover:bg-red-50"
//                             >
//                               Cancel
//                             </Button>
//                           </div>
//                         </AppointmentInfo>
//                       </AppointmentItem>
//                     ))}
//                   </AppointmentList>
//                 ) : (
//                   <p className="text-center py-6 text-gray-500">No upcoming appointments.</p>
//                 )
//               ) : (
//                 pastAppointments.length > 0 ? (
//                   <AppointmentList>
//                     {pastAppointments.map((appointment) => (
//                       <AppointmentItem key={appointment.id}>
//                         <div>
//                           <div className="flex justify-between">
//                             <p className="font-medium text-gray-900">
//                               {appointment.date} at {appointment.time}
//                             </p>
//                             <AppointmentStatus
//                               className={appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
//                             >
//                               {appointment.status === 'completed' ? 'Completed' : 'Cancelled'}
//                             </AppointmentStatus>
//                           </div>
//                           <p className="text-gray-500">
//                             {appointment.type === 'in_person' ? 'In-Person' : 'Virtual'} with {appointment.doctor}
//                           </p>
//                           <p className="text-sm text-gray-500 mt-1">
//                             <span className="font-medium">Reason:</span> {appointment.symptoms}
//                           </p>
//                           {appointment.notes && (
//                             <p className="text-sm text-gray-500">
//                               <span className="font-medium">Notes:</span> {appointment.notes}
//                             </p>
//                           )}
//                         </div>
//                       </AppointmentItem>
//                     ))}
//                   </AppointmentList>
//                 ) : (
//                   <p className="text-center py-6 text-gray-500">No past appointments.</p>
//                 )
//               )}
//             </TabContent>
//           </TabContainer>
//         </AppointmentsContainer>
//       </MainContent>
//     </AppContainer>
//   );
// }

// // Styled Components
// const AppContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   min-height: 100vh;
// `;

// const MainContent = styled.main`
//   margin-left: ${props => props.sidebarOpen ? '240px' : '72px'};
//   margin-top: 64px; /* Same as header height */
//   transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
//   flex: 1;
// `;

// const AppointmentsContainer = styled.div`
//   max-width: 1200px;
//   margin: 0 auto;
//   padding: 24px;
//   background-color: #f9fafb;
// `;

// const HeaderContainer = styled.div`
//   text-align: center;
//   margin-bottom: 24px;
// `;

// const HeaderTitle = styled.h2`
//   font-size: 24px;
//   font-weight: bold;
//   margin-bottom: 8px;
//   color: #111827;
// `;

// const HeaderDescription = styled.p`
//   margin-bottom: 16px;
//   color: #4b5563;
// `;

// const Button = styled.button`
//   ${props => props.variant === 'outline' 
//     ? 'background-color: transparent; border: 1px solid #d1d5db; color: #374151;' 
//     : 'background-color: #3b82f6; border: 1px solid transparent; color: white;'}
  
//   ${props => props.size === 'sm' 
//     ? 'padding: 0.375rem 0.75rem; font-size: 0.875rem;' 
//     : 'padding: 0.5rem 1rem; font-size: 0.875rem;'}
  
//   border-radius: 0.375rem;
//   font-weight: 500;
//   cursor: pointer;
//   display: inline-flex;
//   align-items: center;
//   justify-content: center;
//   transition: all 0.2s;
  
//   &:hover {
//     ${props => props.variant === 'outline' 
//       ? 'background-color: #f3f4f6;' 
//       : 'background-color: #2563eb;'}
//   }
  
//   &:focus {
//     outline: 2px solid transparent;
//     outline-offset: 2px;
//     box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
//   }
  
//   &:disabled {
//     opacity: 0.5;
//     cursor: not-allowed;
//   }
// `;

// const TabContainer = styled.div`
//   margin-top: 24px;
//   background-color: white;
//   border-radius: 8px;
//   box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
//   overflow: hidden;
// `;

// const TabHeader = styled.div`
//   border-bottom: 1px solid #e5e7eb;
// `;

// const TabNav = styled.nav`
//   display: flex;
// `;

// const TabButton = styled.button`
//   padding: 16px;
//   border-bottom: 2px solid;
//   font-weight: 500;
//   background-color: transparent;
//   cursor: pointer;
//   transition: all 0.2s;
// `;

// const TabContent = styled.div`
//   padding: 16px;
// `;

// const AppointmentList = styled.ul`
//   list-style: none;
//   margin: 0;
//   padding: 0;
// `;

// const AppointmentItem = styled.li`
//   padding: 16px;
//   border-bottom: 1px solid #e5e7eb;
  
//   &:last-child {
//     border-bottom: none;
//   }
// `;

// const AppointmentInfo = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
// `;

// const AppointmentStatus = styled.span`
//   display: inline-block;
//   padding: 2px 8px;
//   border-radius: 9999px;
//   font-size: 0.75rem;
//   font-weight: 500;
// `;

// const FormLabel = styled.label`
//   display: block;
//   font-size: 14px;
//   font-weight: 500;
//   color: #374151;
//   margin-bottom: 4px;
// `;

// const FormInput = styled.input`
//   width: 100%;
//   padding: 8px 12px;
//   border: 1px solid #d1d5db;
//   border-radius: 0.375rem;
//   font-size: 14px;
//   color: #374151;
//   background-color: white;
  
//   &:focus {
//     outline: none;
//     border-color: #3b82f6;
//     box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
//   }
  
//   &:disabled {
//     background-color: #f3f4f6;
//     cursor: not-allowed;
//   }
// `;

// const FormSelect = styled.select`
//   width: 100%;
//   padding: 8px 12px;
//   border: 1px solid #d1d5db;
//   border-radius: 0.375rem;
//   font-size: 14px;
//   color: #374151;
//   background-color: white;
  
//   &:focus {
//     outline: none;
//     border-color: #3b82f6;
//     box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
//   }
// `;

// const FormTextarea = styled.textarea`
//   width: 100%;
//   padding: 8px 12px;
//   border: 1px solid #d1d5db;
//   border-radius: 0.375rem;
//   font-size: 14px;
//   color: #374151;
//   background-color: white;
//   resize: vertical;
  
//   &:focus {
//     outline: none;
//     border-color: #3b82f6;
//     box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
//   }
// `;

// const FormButtonContainer = styled.div`
//   display: flex;
//   gap: 8px;
//   justify-content: flex-end;
//   margin-top: 16px;
// `;