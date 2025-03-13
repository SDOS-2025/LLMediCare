import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
// import { setAppointments, setLoading, setError } from '../store/slices/appointment-slice';
import styled from 'styled-components';

export default function Appointments() {
  // const dispatch = useDispatch();
  // const { appointments, loading, error } = useSelector((state) => state.appointments);
  // const user = useSelector((state) => state.auth.user);
  
  // const [activeTab, setActiveTab] = useState('upcoming');
  // const [showBookingForm, setShowBookingForm] = useState(false);
  
  // // Form state
  // const [appointmentType, setAppointmentType] = useState('in_person');
  // const [appointmentDate, setAppointmentDate] = useState('');
  // const [appointmentTime, setAppointmentTime] = useState('');
  // const [symptoms, setSymptoms] = useState('');
  // const [doctorNote, setDoctorNote] = useState('');

  // useEffect(() => {
  //   const fetchAppointments = async () => {
  //     if (!user) return;
      
  //     dispatch(setLoading(true));
  //     try {
  //       // In a real app, you would fetch appointments from the API
  //       // const response = await fetch('/api/appointments/');
  //       // const data = await response.json();
        
  //       // For now, we'll use mock data
  //       const mockData = [
  //         {
  //           id: 1,
  //           date: '2025-03-20',
  //           time: '10:00',
  //           type: 'in_person',
  //           status: 'scheduled',
  //           doctor: 'Dr. Jane Smith',
  //           symptoms: 'Fever, cough',
  //           notes: 'Follow-up on previous visit'
  //         },
  //         {
  //           id: 2,
  //           date: '2025-03-25',
  //           time: '14:30',
  //           type: 'virtual',
  //           status: 'scheduled',
  //           doctor: 'Dr. John Doe',
  //           symptoms: 'Headache, fatigue',
  //           notes: 'Initial consultation'
  //         },
  //         {
  //           id: 3,
  //           date: '2025-02-15',
  //           time: '09:15',
  //           type: 'in_person',
  //           status: 'completed',
  //           doctor: 'Dr. Jane Smith',
  //           symptoms: 'Sore throat',
  //           notes: 'Prescribed antibiotics'
  //         }
  //       ];
        
  //       dispatch(setAppointments(mockData));
  //     } catch (err) {
  //       console.error('Error fetching appointments:', err);
  //       dispatch(setError('Failed to load appointments. Please try again.'));
  //     } finally {
  //       dispatch(setLoading(false));
  //     }
  //   };
    
  //   fetchAppointments();
  // }, [dispatch, user]);

  // const handleBookAppointment = (e) => {
  //   e.preventDefault();
    
  //   // In a real app, you would submit this to the API
  //   const newAppointment = {
  //     id: Date.now(), // temporary ID
  //     date: appointmentDate,
  //     time: appointmentTime,
  //     type: appointmentType,
  //     status: 'scheduled',
  //     doctor: appointmentType === 'in_person' ? 'Dr. Jane Smith' : 'Dr. John Doe',
  //     symptoms,
  //     notes: doctorNote
  //   };
    
  //   dispatch(setAppointments([...appointments, newAppointment]));
    
  //   // Reset form
  //   setAppointmentType('in_person');
  //   setAppointmentDate('');
  //   setAppointmentTime('');
  //   setSymptoms('');
  //   setDoctorNote('');
  //   setShowBookingForm(false);
  // };

  // const cancelAppointment = (id) => {
  //   // In a real app, you would call the API to cancel the appointment
  //   const updatedAppointments = appointments.map(appointment => 
  //     appointment.id === id ? { ...appointment, status: 'cancelled' } : appointment
  //   );
    
  //   dispatch(setAppointments(updatedAppointments));
  // };

  // const upcomingAppointments = appointments.filter(
  //   appointment => appointment.status === 'scheduled'
  // );
  
  // const pastAppointments = appointments.filter(
  //   appointment => appointment.status === 'completed' || appointment.status === 'cancelled'
  // );

  // if (loading) {
  //   return <div className="flex justify-center py-10">Loading appointments...</div>;
  // }

  // if (error) {
  //   return <div className="text-red-500 text-center py-10">{error}</div>;
  // }

  // if (!user) {
  //   return (
  //     <AppointmentsContainer>
  //       <HeaderContainer>
  //         <HeaderTitle>Manage Your Appointments</HeaderTitle>
  //         <HeaderDescription>Please sign in to view and manage your appointments.</HeaderDescription>
  //       </HeaderContainer>
  //     </AppointmentsContainer>
  //   );
  // }

  // return (
  //   <AppointmentsContainer>
  //     <HeaderContainer>
  //       <HeaderTitle>Manage Your Appointments</HeaderTitle>
  //       <HeaderDescription>Schedule and track appointments with healthcare providers.</HeaderDescription>
  //       <Button onClick={() => setShowBookingForm(true)} className="mb-6">
  //         Book New Appointment
  //       </Button>
  //     </HeaderContainer>

  //     {showBookingForm && (
  //       <BookingFormContainer>
  //         <BookingForm>
  //           <FormTitle>Book New Appointment</FormTitle>
  //           <form onSubmit={handleBookAppointment} className="space-y-4">
  //             <div>
  //               <FormLabel>Appointment Type</FormLabel>
  //               <FormSelect
  //                 value={appointmentType}
  //                 onChange={(e) => setAppointmentType(e.target.value)}
  //               >
  //                 <option value="in_person">In-Person</option>
  //                 <option value="virtual">Virtual</option>
  //               </FormSelect>
  //             </div>
              
  //             <div>
  //               <FormLabel>Date</FormLabel>
  //               <FormInput
  //                 type="date"
  //                 value={appointmentDate}
  //                 onChange={(e) => setAppointmentDate(e.target.value)}
  //                 required
  //               />
  //             </div>
              
  //             <div>
  //               <FormLabel>Time</FormLabel>
  //               <FormInput
  //                 type="time"
  //                 value={appointmentTime}
  //                 onChange={(e) => setAppointmentTime(e.target.value)}
  //                 required
  //               />
  //             </div>
              
  //             <div>
  //               <FormLabel>Symptoms or Reason</FormLabel>
  //               <FormTextarea
  //                 value={symptoms}
  //                 onChange={(e) => setSymptoms(e.target.value)}
  //                 rows="3"
  //                 required
  //               />
  //             </div>
              
  //             <div>
  //               <FormLabel>Additional Notes for Doctor</FormLabel>
  //               <FormTextarea
  //                 value={doctorNote}
  //                 onChange={(e) => setDoctorNote(e.target.value)}
  //                 rows="2"
  //               />
  //             </div>
              
  //             <FormButtonContainer>
  //               <Button type="submit">
  //                 Book Appointment
  //               </Button>
  //               <Button 
  //                 type="button"
  //                 variant="outline"
  //                 onClick={() => setShowBookingForm(false)}
  //               >
  //                 Cancel
  //               </Button>
  //             </FormButtonContainer>
  //           </form>
  //         </BookingForm>
  //       </BookingFormContainer>
  //     )}

  //     <TabContainer>
  //       <TabHeader>
  //         <TabNav>
  //           <TabButton
  //             className={activeTab === 'upcoming' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
  //             onClick={() => setActiveTab('upcoming')}
  //           >
  //             Upcoming Appointments
  //           </TabButton>
  //           <TabButton
  //             className={activeTab === 'past' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
  //             onClick={() => setActiveTab('past')}
  //           >
  //             Past Appointments
  //           </TabButton>
  //         </TabNav>
  //       </TabHeader>
  //       <TabContent>
  //         {activeTab === 'upcoming' ? (
  //           upcomingAppointments.length > 0 ? (
  //             <AppointmentList>
  //               {upcomingAppointments.map((appointment) => (
  //                 <AppointmentItem key={appointment.id}>
  //                   <AppointmentInfo>
  //                     <div>
  //                       <p className="font-medium text-gray-900">
  //                         {appointment.date} at {appointment.time}
  //                       </p>
  //                       <p className="text-gray-500">
  //                         {appointment.type === 'in_person' ? 'In-Person' : 'Virtual'} with {appointment.doctor}
  //                       </p>
  //                       <p className="text-sm text-gray-500 mt-1">
  //                         <span className="font-medium">Reason:</span> {appointment.symptoms}
  //                       </p>
  //                       {appointment.notes && (
  //                         <p className="text-sm text-gray-500">
  //                           <span className="font-medium">Notes:</span> {appointment.notes}
  //                         </p>
  //                       )}
  //                     </div>
  //                     <div>
  //                       <Button
  //                         variant="outline"
  //                         size="sm"
  //                         onClick={() => cancelAppointment(appointment.id)}
  //                         className="text-red-600 border-red-300 hover:bg-red-50"
  //                       >
  //                         Cancel
  //                       </Button>
  //                     </div>
  //                   </AppointmentInfo>
  //                 </AppointmentItem>
  //               ))}
  //             </AppointmentList>
  //           ) : (
  //             <p className="text-center py-6 text-gray-500">No upcoming appointments.</p>
  //           )
  //         ) : (
  //           pastAppointments.length > 0 ? (
  //             <AppointmentList>
  //               {pastAppointments.map((appointment) => (
  //                 <AppointmentItem key={appointment.id}>
  //                   <div>
  //                     <div className="flex justify-between">
  //                       <p className="font-medium text-gray-900">
  //                         {appointment.date} at {appointment.time}
  //                       </p>
  //                       <AppointmentStatus
  //                         className={appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
  //                       >
  //                         {appointment.status === 'completed' ? 'Completed' : 'Cancelled'}
  //                       </AppointmentStatus>
  //                     </div>
  //                     <p className="text-gray-500">
  //                       {appointment.type === 'in_person' ? 'In-Person' : 'Virtual'} with {appointment.doctor}
  //                     </p>
  //                     <p className="text-sm text-gray-500 mt-1">
  //                       <span className="font-medium">Reason:</span> {appointment.symptoms}
  //                     </p>
  //                     {appointment.notes && (
  //                       <p className="text-sm text-gray-500">
  //                         <span className="font-medium">Notes:</span> {appointment.notes}
  //                       </p>
  //                     )}
  //                   </div>
  //                 </AppointmentItem>
  //               ))}
  //             </AppointmentList>
  //           ) : (
  //             <p className="text-center py-6 text-gray-500">No past appointments.</p>
  //           )
  //         )}
  //       </TabContent>
  //     </TabContainer>
  //   </AppointmentsContainer>
  // );
};


const AppointmentsContainer = styled.div`
  max-width: 7xl;
  margin: 0 auto;
  padding: 24px;
  background-color: #f9fafb; // gray-50
`;

const HeaderContainer = styled.div`
  text-align: center;
  margin-bottom: 8px;
`;

const HeaderTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const HeaderDescription = styled.p`
  margin-bottom: 6px;
`;

const BookingFormContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px;
  z-index: 50;
`;

const BookingForm = styled.div`
  background-color: #fff;
  padding: 6px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
`;

const FormTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: medium;
  color: #333;
  margin-bottom: 1px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 3px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 4px;
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 3px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 4px;
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 3px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 4px;
`;

const FormButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
`;

const TabContainer = styled.div`
  background-color: #fff;
  padding: 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 8px;
`;

const TabHeader = styled.div`
  border-bottom: 1px solid #ddd;
`;

const TabNav = styled.nav`
  display: flex;
  justify-content: space-between;
  margin-bottom: -4px;
`;

const TabButton = styled.button`
  padding: 4px 6px;
  border: none;
  border-radius: 4px 4px 0 0;
  font-size: 14px;
  font-weight: medium;
  color: #333;
  background-color: #fff;
  cursor: pointer;
`;

const TabContent = styled.div`
  padding: 4px;
`;

const AppointmentList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const AppointmentItem = styled.li`
  padding: 4px;
  border-bottom: 1px solid #ddd;
`;

const AppointmentInfo = styled.div`
  display: flex;
  justify-content: space-between;
`;

const AppointmentStatus = styled.span`
  display: inline-block;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: medium;
  color: #fff;
  background-color: #333;
`;

const Button = styled.button`
  /* Base button styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  
  /* Default primary style */
  background-color: #2563eb;
  border: 1px solid #2563eb;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #1d4ed8;
    border-color: #1d4ed8;
  }
  
  &:active:not(:disabled) {
    background-color: #1e40af;
    border-color: #1e40af;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  /* Variant: outline */
  ${props => props.variant === 'outline' && `
    background-color: transparent;
    border: 1px solid #2563eb;
    color: #2563eb;
    
    &:hover:not(:disabled) {
      background-color: rgba(37, 99, 235, 0.05);
    }
    
    &:active:not(:disabled) {
      background-color: rgba(37, 99, 235, 0.1);
    }
  `}
  
  /* Size: small */
  ${props => props.size === 'sm' && `
    font-size: 0.875rem;
    padding: 0.375rem 0.75rem;
  `}
  
  /* Size: large */
  ${props => props.size === 'lg' && `
    font-size: 1.125rem;
    padding: 0.75rem 1.5rem;
  `}
  
  /* Handle custom className styles */
  &.mb-6 {
    margin-bottom: 1.5rem;
  }
  
  &.text-red-600 {
    color: #dc2626;
  }
  
  &.border-red-300 {
    border-color: #fca5a5;
  }
  
  &.hover\\:bg-red-50:hover {
    background-color: #fef2f2;
  }
`;