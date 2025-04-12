// The React component for Appointments

import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { FiSearch, FiX, FiPlus, FiPaperclip, FiDownload, FiCheck, FiX as FiXMark } from "react-icons/fi";

export default function Appointments() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentUser = useSelector((state) => state.user.currentUser);
  
  // Appointment form state
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [reason, setReason] = useState('');
  
  // Document upload
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Doctor selection
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  
  // Appointments list
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState('');
  
  // Modals
  const [showMedicalRecordModal, setShowMedicalRecordModal] = useState(false);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  
  // Medical record form state
  const [recordDate, setRecordDate] = useState(new Date());
  const [recordType, setRecordType] = useState('');
  const [findings, setFindings] = useState('');
  const [recommendations, setRecommendations] = useState('');
  
  // Medication form state
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 7)));
  const [instructions, setInstructions] = useState('');
  
  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch doctors list
  useEffect(() => {
    async function fetchDoctors() {
      try {
        const response = await axios.get('http://localhost:8000/api/users/doctors/list/');
        setDoctors(response.data);
        setFilteredDoctors(response.data);
        if (response.data.length > 0) {
          setSelectedDoctor(response.data[0].email);
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    }
    fetchDoctors();
  }, []);

  // Fetch appointments based on user role
  useEffect(() => {
    async function fetchAppointments() {
      if (!currentUser) return;

      try {
        const response = await axios.get(
          `http://localhost:8000/api/appointments/user/${currentUser.email}/`
        );
        setAppointments(response.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    }
    fetchAppointments();
  }, [currentUser, message]);

  // Fetch notifications
  useEffect(() => {
    async function fetchNotifications() {
      if (!currentUser) return;

      try {
        const response = await axios.get(
          `http://localhost:8000/api/notifications/unread/?user_email=${currentUser.email}`
        );
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    }
    fetchNotifications();
    
    // Set up polling for notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    // Filter doctors based on search query
    if (searchQuery) {
      const filtered = doctors.filter(doctor => 
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors(doctors);
    }
  }, [searchQuery, doctors]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', selectedFile.name);
    formData.append('type', 'appointment_document');
    
    try {
      if (currentUser.role === 'patient') {
        formData.append('user_email', currentUser.email);
        await axios.post('http://localhost:8000/api/documents/patient/upload/', formData);
      } else {
        formData.append('doctor_email', currentUser.email);
        formData.append('patient_email', currentAppointment?.patient?.email || '');
        await axios.post('http://localhost:8000/api/documents/doctor/upload/', formData);
      }
      
      setDocuments([...documents, { 
        title: selectedFile.name, 
        type: 'appointment_document',
        date: new Date().toISOString().split('T')[0]
      }]);
      setSelectedFile(null);
      setMessage('Document uploaded successfully.');
    } catch (error) {
      console.error('Error uploading document:', error);
      setMessage('Error uploading document.');
    }
  };

  const handleSubmitAppointment = async (e) => {
    e.preventDefault();
    
    if (!selectedDoctor) {
      setMessage('Please select a doctor.');
      return;
    }
    
    const payload = {
      doctor_email: selectedDoctor,
      appointment_date: appointmentDate.toISOString().split('T')[0],
      start_time: startTime,
      end_time: endTime,
      notes: reason,
      status: 'pending'
    };
    
    try {
      await axios.post('http://localhost:8000/api/appointments/', payload);
      setMessage('Appointment request sent successfully.');
      
      // Reset form
      setAppointmentDate(new Date());
      setStartTime('09:00');
      setEndTime('10:00');
      setReason('');
      setDocuments([]);
      
    } catch (error) {
      console.error('Error submitting appointment request:', error);
      setMessage('Error submitting appointment request: ' + JSON.stringify(error.response?.data));
    }
  };

  const handleAppointmentAction = async (id, action) => {
    try {
      await axios.patch(`http://localhost:8000/api/appointments/${id}/`, {
        status: action
      });
      
      setMessage(`Appointment ${action === 'accepted' ? 'approved' : 'refused'} successfully.`);
      
      // Refresh appointments
      const response = await axios.get(
        `http://localhost:8000/api/appointments/user/${currentUser.email}/`
      );
      setAppointments(response.data);
      
    } catch (error) {
      console.error(`Error ${action} appointment:`, error);
      setMessage(`Error ${action} appointment.`);
    }
  };

  const openMedicalRecordModal = (appointment) => {
    setCurrentAppointment(appointment);
    setShowMedicalRecordModal(true);
  };

  const openMedicationModal = (appointment) => {
    setCurrentAppointment(appointment);
    setShowMedicationModal(true);
  };

  const handleAddMedicalRecord = async (e) => {
    e.preventDefault();
    
    if (!currentAppointment) return;
    
    const payload = {
      user: currentAppointment.patient.id,
      date: recordDate.toISOString().split('T')[0],
      type: recordType,
      doctor: currentUser.name, // Using the logged-in doctor's name
      findings: findings,
      recommendations: recommendations
    };
    
    try {
      await axios.post(`http://localhost:8000/api/appointments/${currentAppointment.id}/add_medical_record/`, payload);
      setMessage('Medical record added successfully.');
      setShowMedicalRecordModal(false);
      
      // Reset form
      setRecordDate(new Date());
      setRecordType('');
      setFindings('');
      setRecommendations('');
      
    } catch (error) {
      console.error('Error adding medical record:', error);
      setMessage('Error adding medical record.');
    }
  };

  const handleAddMedication = async (e) => {
    e.preventDefault();
    
    if (!currentAppointment) return;
    
    const payload = {
      user: currentAppointment.patient.id,
      name: medicationName,
      dosage: dosage,
      frequency: frequency,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      instructions: instructions
    };
    
    try {
      await axios.post(`http://localhost:8000/api/appointments/${currentAppointment.id}/add_medication/`, payload);
      setMessage('Medication added successfully.');
      setShowMedicationModal(false);
      
      // Reset form
      setMedicationName('');
      setDosage('');
      setFrequency('');
      setStartDate(new Date());
      setEndDate(new Date(new Date().setDate(new Date().getDate() + 7)));
      setInstructions('');
      
    } catch (error) {
      console.error('Error adding medication:', error);
      setMessage('Error adding medication.');
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      await axios.patch(`http://localhost:8000/api/notifications/${id}/mark-read/`);
      
      // Update notifications list
      const response = await axios.get(
        `http://localhost:8000/api/notifications/unread/?user_email=${currentUser.email}`
      );
      setNotifications(response.data);
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await axios.patch(
        `http://localhost:8000/api/notifications/mark-all-read/?user_email=${currentUser.email}`
      );
      setNotifications([]);
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Render
  return (
    <AppContainer>
      <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <MainContent>
        <ContentWrapper>
          <HeaderSection>
            <PageTitle>
              {currentUser && currentUser.role === "doctor"
                ? "Patient Appointments"
                : "Schedule an Appointment"}
            </PageTitle>
            <PageSubtitle>
              {currentUser && currentUser.role === "doctor"
                ? "View and manage appointment requests from patients."
                : "Book a consultation with your preferred doctor."}
            </PageSubtitle>
          </HeaderSection>

          {/* Notifications bell */}
          <NotificationContainer>
            <NotificationBell onClick={() => setShowNotifications(!showNotifications)}>
              🔔
              {notifications.length > 0 && (
                <NotificationBadge>{notifications.length}</NotificationBadge>
              )}
            </NotificationBell>
            
            {showNotifications && (
              <NotificationDropdown>
                <NotificationHeader>
                  <h3>Notifications</h3>
                  {notifications.length > 0 && (
                    <MarkAllReadButton onClick={markAllNotificationsAsRead}>
                      Mark all as read
                    </MarkAllReadButton>
                  )}
                </NotificationHeader>
                
                {notifications.length > 0 ? (
                  <NotificationList>
                    {notifications.map(notification => (
                      <NotificationItem key={notification.id}>
                        <NotificationContent>
                          <NotificationTitle>{notification.title}</NotificationTitle>
                          <NotificationMessage>{notification.message}</NotificationMessage>
                          <NotificationTime>
                            {new Date(notification.created_at).toLocaleString()}
                          </NotificationTime>
                        </NotificationContent>
                        <MarkReadButton onClick={() => markNotificationAsRead(notification.id)}>
                          <FiCheck />
                        </MarkReadButton>
                      </NotificationItem>
                    ))}
                  </NotificationList>
                ) : (
                  <NoNotifications>No new notifications</NoNotifications>
                )}
              </NotificationDropdown>
            )}
          </NotificationContainer>

          <CardContainer>
            {/* Patient view - Schedule appointment */}
            {currentUser && currentUser.role === "patient" && (
              <Form onSubmit={handleSubmitAppointment}>
                <FormGroup>
                  <Label htmlFor="doctorSelect">Select Doctor:</Label>
                  <SearchWrapper>
                    <SearchInput
                      type="text"
                      placeholder="Search doctors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <SearchIcon><FiSearch /></SearchIcon>
                  </SearchWrapper>
                  
                  <DoctorList>
                    {filteredDoctors.map((doctor) => (
                      <DoctorOption 
                        key={doctor.email}
                        selected={selectedDoctor === doctor.email}
                        onClick={() => setSelectedDoctor(doctor.email)}
                      >
                        <DoctorName>{doctor.name}</DoctorName>
                        <DoctorSpecialty>{doctor.specialty || "General Practitioner"}</DoctorSpecialty>
                      </DoctorOption>
                    ))}
                  </DoctorList>
                </FormGroup>

                <DateTimeRow>
                  <DateColumn>
                    <Label>Appointment Date:</Label>
                    <CalendarWrapper>
                      <StyledDatePicker
                        selected={appointmentDate}
                        onChange={(date) => setAppointmentDate(date)}
                        dateFormat="yyyy-MM-dd"
                        minDate={new Date()}
                      />
                    </CalendarWrapper>
                  </DateColumn>
                  
                  <TimeColumn>
                    <TimeGroup>
                      <Label htmlFor="startTime">Start Time:</Label>
                      <TimeInput
                        type="time"
                        id="startTime"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </TimeGroup>
                    
                    <TimeGroup>
                      <Label htmlFor="endTime">End Time:</Label>
                      <TimeInput
                        type="time"
                        id="endTime"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </TimeGroup>
                  </TimeColumn>
                </DateTimeRow>

                <FormGroup>
                  <Label htmlFor="reason">Reason for visit:</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please describe your symptoms or reason for appointment..."
                    rows={4}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Upload Documents (Optional):</Label>
                  <FileUploadContainer>
                    <FileInput
                      type="file"
                      id="document"
                      onChange={handleFileChange}
                    />
                    <UploadButton type="button" onClick={handleFileUpload} disabled={!selectedFile}>
                      <FiPaperclip /> Upload
                    </UploadButton>
                  </FileUploadContainer>
                  
                  {documents.length > 0 && (
                    <DocumentsList>
                      {documents.map((doc, index) => (
                        <DocumentItem key={index}>
                          <DocumentInfo>
                            <DocumentTitle>{doc.title}</DocumentTitle>
                            <DocumentDate>{doc.date}</DocumentDate>
                          </DocumentInfo>
                          <DocumentActions>
                            <DocumentButton>
                              <FiDownload />
                            </DocumentButton>
                            <DocumentButton onClick={() => {
                              const updatedDocs = [...documents];
                              updatedDocs.splice(index, 1);
                              setDocuments(updatedDocs);
                            }}>
                              <FiX />
                            </DocumentButton>
                          </DocumentActions>
                        </DocumentItem>
                      ))}
                    </DocumentsList>
                  )}
                </FormGroup>

                <ButtonContainer>
                  <SubmitButton type="submit">Request Appointment</SubmitButton>
                </ButtonContainer>
              </Form>
            )}

            {/* Doctor view - Appointment requests */}
            {currentUser && currentUser.role === "doctor" && (
              <AppointmentRequests>
                <RequestsHeader>
                  <RequestsTitle>Appointment Requests</RequestsTitle>
                </RequestsHeader>
                
                {appointments.filter(app => app.status === 'pending').length > 0 ? (
                  appointments
                    .filter(app => app.status === 'pending')
                    .map(appointment => (
                      <AppointmentCard key={appointment.id}>
                        <AppointmentHeader>
                          <PatientName>{appointment.patient.name}</PatientName>
                          <AppointmentStatus status={appointment.status}>
                            {appointment.status.toUpperCase()}
                          </AppointmentStatus>
                        </AppointmentHeader>
                        
                        <AppointmentDetails>
                          <DetailItem>
                            <DetailLabel>Date:</DetailLabel>
                            <DetailValue>{appointment.appointment_date}</DetailValue>
                          </DetailItem>
                          <DetailItem>
                            <DetailLabel>Time:</DetailLabel>
                            <DetailValue>{`${appointment.start_time} - ${appointment.end_time}`}</DetailValue>
                          </DetailItem>
                          <DetailItem>
                            <DetailLabel>Reason:</DetailLabel>
                            <DetailValue>{appointment.notes}</DetailValue>
                          </DetailItem>
                        </AppointmentDetails>
                        
                        <ActionButtons>
                          <ApproveButton onClick={() => handleAppointmentAction(appointment.id, 'accepted')}>
                            Approve
                          </ApproveButton>
                          <DeclineButton onClick={() => handleAppointmentAction(appointment.id, 'refused')}>
                            Decline
                          </DeclineButton>
                        </ActionButtons>
                      </AppointmentCard>
                    ))
                ) : (
                  <NoAppointments>No pending appointment requests.</NoAppointments>
                )}
                
                <RequestsHeader>
                  <RequestsTitle>Approved Appointments</RequestsTitle>
                </RequestsHeader>
                
                {appointments.filter(app => app.status === 'accepted').length > 0 ? (
                  appointments
                    .filter(app => app.status === 'accepted')
                    .map(appointment => (
                      <AppointmentCard key={appointment.id}>
                        <AppointmentHeader>
                          <PatientName>{appointment.patient.name}</PatientName>
                          <AppointmentStatus status={appointment.status}>
                            {appointment.status.toUpperCase()}
                          </AppointmentStatus>
                        </AppointmentHeader>
                        
                        <AppointmentDetails>
                          <DetailItem>
                            <DetailLabel>Date:</DetailLabel>
                            <DetailValue>{appointment.appointment_date}</DetailValue>
                          </DetailItem>
                          <DetailItem>
                            <DetailLabel>Time:</DetailLabel>
                            <DetailValue>{`${appointment.start_time} - ${appointment.end_time}`}</DetailValue>
                          </DetailItem>
                          <DetailItem>
                            <DetailLabel>Reason:</DetailLabel>
                            <DetailValue>{appointment.notes}</DetailValue>
                          </DetailItem>
                        </AppointmentDetails>
                        
                        <ActionButtons>
                          <SecondaryButton onClick={() => openMedicalRecordModal(appointment)}>
                            Add Medical Record
                          </SecondaryButton>
                          <SecondaryButton onClick={() => openMedicationModal(appointment)}>
                            Add Medication
                          </SecondaryButton>
                        </ActionButtons>
                      </AppointmentCard>
                    ))
                ) : (
                  <NoAppointments>No approved appointments.</NoAppointments>
                )}
              </AppointmentRequests>
            )}

            {/* Patient view - View appointments */}
            {currentUser && currentUser.role === "patient" && (
              <AppointmentList>
                <ListTitle>Your Appointments</ListTitle>
                
                {appointments.length > 0 ? (
                  appointments.map(appointment => (
                    <AppointmentCard key={appointment.id}>
                      <AppointmentHeader>
                        <DoctorName>Dr. {appointment.doctor.name}</DoctorName>
                        <AppointmentStatus status={appointment.status}>
                          {appointment.status.toUpperCase()}
                        </AppointmentStatus>
                      </AppointmentHeader>
                      
                      <AppointmentDetails>
                        <DetailItem>
                          <DetailLabel>Date:</DetailLabel>
                          <DetailValue>{appointment.appointment_date}</DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Time:</DetailLabel>
                          <DetailValue>{`${appointment.start_time} - ${appointment.end_time}`}</DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Reason:</DetailLabel>
                          <DetailValue>{appointment.notes}</DetailValue>
                        </DetailItem>
                      </AppointmentDetails>
                    </AppointmentCard>
                  ))
                ) : (
                  <NoAppointments>No appointments found.</NoAppointments>
                )}
              </AppointmentList>
            )}

            {message && <Message>{message}</Message>}
          </CardContainer>
        </ContentWrapper>
      </MainContent>

      {/* Medical Record Modal */}
      {showMedicalRecordModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Add Medical Record</ModalTitle>
              <CloseButton onClick={() => setShowMedicalRecordModal(false)}>
                <FiX />
              </CloseButton>
            </ModalHeader>
            
            <ModalBody>
              <Form onSubmit={handleAddMedicalRecord}>
                <FormGroup>
                  <Label>Patient:</Label>
                  <Input 
                    type="text" 
                    value={currentAppointment?.patient?.name || ''} 
                    disabled 
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Record Date:</Label>
                  <CalendarWrapper>
                    <StyledDatePicker
                      selected={recordDate}
                      onChange={(date) => setRecordDate(date)}
                      dateFormat="yyyy-MM-dd"
                    />
                  </CalendarWrapper>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="recordType">Record Type:</Label>
                  <Input
                    type="text"
                    id="recordType"
                    value={recordType}
                    onChange={(e) => setRecordType(e.target.value)}
                    placeholder="e.g., Consultation, Lab Results, Imaging"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="findings">Findings:</Label>
                  <Textarea
                    id="findings"
                    value={findings}
                    onChange={(e) => setFindings(e.target.value)}
                    placeholder="Clinical findings and observations"
                    rows={4}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="recommendations">Recommendations:</Label>
                  <Textarea
                    id="recommendations"
                    value={recommendations}
                    onChange={(e) => setRecommendations(e.target.value)}
                    placeholder="Treatment recommendations and next steps"
                    rows={4}
                    required
                  />
                </FormGroup>

                <ButtonContainer>
                  <SubmitButton type="submit">Add Record</SubmitButton>
                  <CancelButton type="button" onClick={() => setShowMedicalRecordModal(false)}>
                    Cancel
                  </CancelButton>
                </ButtonContainer>
              </Form>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* Medication Modal */}
      {showMedicationModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Add Medication</ModalTitle>
              <CloseButton onClick={() => setShowMedicationModal(false)}>
                <FiX />
              </CloseButton>
            </ModalHeader>
            
            <ModalBody>
              <Form onSubmit={handleAddMedication}>
                <FormGroup>
                  <Label>Patient:</Label>
                  <Input 
                    type="text" 
                    value={currentAppointment?.patient?.name || ''} 
                    disabled 
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="medicationName">Medication Name:</Label>
                  <Input
                    type="text"
                    id="medicationName"
                    value={medicationName}
                    onChange={(e) => setMedicationName(e.target.value)}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="dosage">Dosage:</Label>
                  <Input
                    type="text"
                    id="dosage"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g., 500mg, 10ml"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="frequency">Frequency:</Label>
                  <Input
                    type="text"
                    id="frequency"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    placeholder="e.g., Twice daily, Every 8 hours"
                    required
                  />
                </FormGroup>

                <DateRow>
                  <DateColumn>
                    <Label>Start Date:</Label>
                    <CalendarWrapper>
                      <StyledDatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        dateFormat="yyyy-MM-dd"
                      />
                    </CalendarWrapper>
                  </DateColumn>
                  
                  <DateColumn>
                    <Label>End Date:</Label>
                    <CalendarWrapper>
                      <StyledDatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        dateFormat="yyyy-MM-dd"
                        minDate={startDate}
                      />
                    </CalendarWrapper>
                  </DateColumn>
                </DateRow>

                <FormGroup>
                  <Label htmlFor="instructions">Instructions:</Label>
                  <Textarea
                    id="instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Special instructions for taking this medication"
                    rows={4}
                    required
                  />
                </FormGroup>

                <ButtonContainer>
                  <SubmitButton type="submit">Add Medication</SubmitButton>
                  <CancelButton type="button" onClick={() => setShowMedicationModal(false)}>
                    Cancel
                  </CancelButton>
                </ButtonContainer>
              </Form>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </AppContainer>
  );
}

// Styled Components
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f3f4f6;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 1.5rem;
  margin-top: 4rem;
  position: relative;
`;

const ContentWrapper = styled.div`
  max-width: 58rem;
  margin: 0 auto;
`;

const HeaderSection = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const PageSubtitle = styled.p`
  color: #6b7280;
  font-size: 1rem;
`;

const CardContainer = styled.div`
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
`;

// Form Elements
const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: block;
  color: #374151;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const DateTimeRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const DateColumn = styled.div`
  flex: 1;
`;

const TimeColumn = styled.div`
  flex: 1;
  display: flex;
  gap: 1rem;
`;

const TimeGroup = styled.div`
  flex: 1;
`;

const TimeInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const CalendarWrapper = styled.div`
  width: 100%;
  .react-datepicker-wrapper {
    width: 100%;
    display: block;
  }
`;

const StyledDatePicker = styled(DatePicker)`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const SubmitButton = styled.button`
  padding: 0.625rem 1.25rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #2563eb;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }
`;

const CancelButton = styled.button`
  padding: 0.625rem 1.25rem;
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #e5e7eb;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(209, 213, 219, 0.5);
  }
`;

// Doctor selection
const SearchWrapper = styled.div`
  position: relative;
  margin-bottom: 0.75rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
`;

const DoctorList = styled.div`
  max-height: 15rem;
  overflow-y: auto;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
`;

const DoctorOption = styled.div`
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid #e5e7eb;
  background-color: ${props => props.selected ? '#f3f4f6' : 'transparent'};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #f9fafb;
  }
`;

const DoctorName = styled.div`
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const DoctorSpecialty = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

// File Upload
const FileUploadContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
`;

const FileInput = styled.input`
  flex: 1;
`;

const UploadButton = styled.button`
  padding: 0.375rem 0.75rem;
  background-color: #e5e7eb;
  color: #374151;
  border: none;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  
  &:hover {
    background-color: #d1d5db;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DocumentsList = styled.div`
  margin-top: 0.75rem;
`;

const DocumentItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
`;

const DocumentInfo = styled.div`
  flex: 1;
`;

const DocumentTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
`;

const DocumentDate = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const DocumentActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const DocumentButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  
  &:hover {
    color: #4b5563;
  }
`;

// Appointments
const AppointmentRequests = styled.div`
  margin-top: 1rem;
`;

const RequestsHeader = styled.div`
  margin: 1.5rem 0 1rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.5rem;
`;

const RequestsTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
`;

const AppointmentList = styled.div`
  margin-top: 2rem;
`;

const ListTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const AppointmentCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: #fff;
`;

const AppointmentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const PatientName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
`;

const DoctorNameH = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
`;

const AppointmentStatus = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  
  ${props => {
    if (props.status === 'pending') {
      return `
        background-color: #fef3c7;
        color: #92400e;
      `;
    } else if (props.status === 'accepted') {
      return `
        background-color: #d1fae5;
        color: #065f46;
      `;
    } else if (props.status === 'refused') {
      return `
        background-color: #fee2e2;
        color: #b91c1c;
      `;
    }
  }}
`;

const AppointmentDetails = styled.div`
  margin-bottom: 1rem;
`;

const DetailItem = styled.div`
  display: flex;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
`;

const DetailLabel = styled.div`
  width: 5rem;
  font-weight: 500;
  color: #6b7280;
`;

const DetailValue = styled.div`
  flex: 1;
  color: #1f2937;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ApproveButton = styled.button`
  padding: 0.375rem 0.75rem;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #059669;
  }
`;

const DeclineButton = styled.button`
  padding: 0.375rem 0.75rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #dc2626;
  }
`;

const SecondaryButton = styled.button`
  padding: 0.375rem 0.75rem;
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #e5e7eb;
  }
`;

const NoAppointments = styled.div`
  text-align: center;
  padding: 2rem 0;
  color: #6b7280;
  font-style: italic;
`;

const Message = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 0.375rem;
  text-align: center;
  background-color: #f3f4f6;
  color: #1f2937;
`;

// Modals
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 36rem;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #1f2937;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const DateRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

// Notifications
const NotificationContainer = styled.div`
  position: absolute;
  top: 1rem;
  right: 1.5rem;
`;

const NotificationBell = styled.button`
  position: relative;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background-color: #ef4444;
  color: white;
  font-size: 0.75rem;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NotificationDropdown = styled.div`
  position: absolute;
  right: 0;
  top: 2.75rem;
  width: 22rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
`;

const MarkAllReadButton = styled.button`
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    color: #2563eb;
  }
`;

const NotificationList = styled.div`
  max-height: 20rem;
  overflow-y: auto;
`;

const NotificationItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  
  &:last-child {
    border-bottom: none;
  }
`;

const NotificationContent = styled.div`
  flex: 1;
  padding-right: 0.75rem;
`;

const NotificationTitle = styled.div`
  font-weight: 500;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
`;

const NotificationMessage = styled.div`
  font-size: 0.875rem;
  color: #4b5563;
  margin-bottom: 0.25rem;
`;

const NotificationTime = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
`;

const MarkReadButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    color: #3b82f6;
  }
`;

const NoNotifications = styled.div`
  padding: 1.5rem;
  text-align: center;
  color: #6b7280;
  font-style: italic;
`;