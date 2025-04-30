import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import { FaPen, FaCheck, FaTrash, FaTimes, FaUser, FaCheckCircle, FaClock, FaIdCard, FaUpload } from "react-icons/fa";
import { updateUserDetails } from "../store/slices/userSlice.js";
import { getAuth, sendPasswordResetEmail, updateEmail } from "firebase/auth";
import { fetchPatientRecords, userUploadDocument } from '../store/slices/userSlice';
import { auth } from "../utils/firebase-config.js";
import Records from "./Records.jsx";
import Notifications from "../components/Notifications.jsx";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isEditable, setIsEditable] = useState({
    name: false,
    email: false,
    chatGPTKey: false,
    password: false,
  });

  const currentUser = useSelector((state) => state.user.currentUser);
  const doctorLicenses = useSelector((state) => state.user.patientRecords);

  // Temporary state to hold changes
  const [temp, setTemp] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchPatientRecords(currentUser.email));
    }
    setTemp(currentUser);
  }, [currentUser]);

  const handleEditToggle = (field) => {
    setIsEditable((prev) => ({ ...prev, [field]: !prev[field] }));
    if (isEditable[field] === false) {
      setTemp((prev) => ({
        ...prev,
        [field]: currentUser[field],
      }));
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setTemp((prev) => ({
          ...prev,
          profile_pic: reader.result,
        }));
      });
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async (field) => {
    dispatch(updateUserDetails({ ...temp }));
    setIsEditable((prev) => ({ ...prev, [field]: false }));
  };

  const handleDiscardChanges = (field) => {
    setTemp((prev) => ({
      ...prev,
      [field]: currentUser[field],
    }));
    setIsEditable((prev) => ({ ...prev, [field]: false }));
  };

  const handleCloseClick = () => {
    dispatch(updateUserDetails({ ...temp }));
    navigate("/home");
  };

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      alert("Password reset email sent! Check your inbox.");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLicenseUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image (JPEG, PNG) or PDF file');
      return;
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('File is too large. Maximum size is 10MB');
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Convert file to base64
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      
      fileReader.onload = () => {
        const fileBase64 = fileReader.result;
        
        // Create new document object
        const newDocument = {
          title: file.name, // Using the file name as document title
          type: "License", // Setting document type as "License"
          date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
          file: fileBase64,
        };
        
        // Use the same dispatch function as handleDocumentUpload
        dispatch(userUploadDocument({
          documentData: newDocument, 
          patientEmail: currentUser.email // Assuming currentUser contains the user's email
        }));
        
        // Update the user's local state
        setTemp(prev => ({
          ...prev,
          licenseUploaded: true,
          licenseVerified: false,
          licenseUploadDate: new Date().toISOString()
        }));
        
        alert('License uploaded successfully! It will be reviewed by an administrator.');
        setIsUploading(false);
      };
      
      fileReader.onerror = (error) => {
        console.error('File reading error:', error);
        alert('Failed to process the file. Please try again.');
        setIsUploading(false);
      };
      
    } catch (error) {
      console.error('License upload error:', error);
      alert(error.message || 'Failed to upload license. Please try again.');
      setIsUploading(false);
    }
  };

  if (!currentUser) {
    return (
      <ProfileContainer>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your Medical Records</h2>
          <p className="mb-6">
            Please sign in to view and manage your medical records.
          </p>
        </div>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <Header>
        <h2>Your Profile</h2>
        <CloseBtn onClick={handleCloseClick}>
          <FaTimes />
        </CloseBtn>
      </Header>
      
      <ContentWrapper>
        <ProfileSection>
          <div className="profile-picture-container">
            {temp && temp.profile_pic ? (
              <ProfileImage src={temp.profile_pic} alt="Profile" />
            ) : (
              <ProfilePlaceholder>
                <FaUser />
              </ProfilePlaceholder>
            )}
            <EditIconWrapper>
              <label className="edit-icon">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  style={{ display: "none" }}
                />
                <FaPen />
              </label>
            </EditIconWrapper>
          </div>
          
          <ProfileName>{temp ? temp.name : "User"}</ProfileName>
          <ProfileEmail>{temp ? temp.email : "email@example.com"}</ProfileEmail>
        </ProfileSection>

        <FormSection>
          <SectionTitle>Account Details</SectionTitle>
          <FormGrid>
            {[
              {
                label: "Name",
                value:
                  temp && typeof temp.name === "string" ? temp.name : "User",
                setValue: (value) =>
                  setTemp((prev) => ({ ...prev, name: value })),
                field: "name",
                icon: "👤",
                editable: true,
              },
              {
                label: "Email",
                value:
                  temp && typeof temp.email === "string"
                    ? temp.email
                    : "email@example.com",
                setValue: (value) =>
                  setTemp((prev) => ({ ...prev, email: value })),
                field: "email",
                icon: "✉️",
                editable: false,
              },
              {
                label: "Password",
                value: "************",
                setValue: (value) =>
                  setTemp((prev) => ({ ...prev, password: value })),
                field: "password",
                icon: "🔒",
                editable: true,
              },
              {
                label: "Role",
                value:
                  temp && temp.role
                    ? temp.role === 'doctor' ? 'Doctor' : 'Patient'
                    : "Patient",
                setValue: (value) =>
                  setTemp((prev) => ({ ...prev, role: value })),
                field: "role",
                icon: temp && temp.role === 'doctor' ? "🩺" : "🧑",
                editable: false,
              },
            ].map(({ label, value, setValue, field, icon, editable }) => (
              <FormGroup key={field} isActive={isEditable[field]}>
                <FormLabel>
                  <span className="icon">{icon}</span>
                  {label}
                </FormLabel>
                <InputWrapper>
                  <FormInput
                    type={field === "password" ? "password" : "text"}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={!isEditable[field] || !editable}
                  />
                  {editable && field !== "email" && (
                    <ActionIcons>
                      {!isEditable[field] ? (
                        <ActionIcon
                          className="edit"
                          onClick={() =>
                            field !== "password"
                              ? handleEditToggle(field)
                              : handleResetPassword()
                          }
                        >
                          <FaPen />
                        </ActionIcon>
                      ) : (
                        <>
                          <ActionIcon
                            className="save"
                            onClick={() => handleSaveChanges(field)}
                          >
                            <FaCheck />
                          </ActionIcon>
                          <ActionIcon
                            className="cancel"
                            onClick={() => handleDiscardChanges(field)}
                          >
                            <FaTrash />
                          </ActionIcon>
                        </>
                      )}
                    </ActionIcons>
                  )}
                </InputWrapper>
              </FormGroup>
            ))}
          </FormGrid>
        </FormSection>
        
        {temp && temp.role === 'doctor' && (
  <FormSection>
    <SectionTitle>Doctor Verification</SectionTitle>
    <LicenseSection>
      {/* Verification Status Message */}
      {temp.verified ? (
        <VerificationStatus verified>
          <FaCheckCircle className="verified-icon" />
          <span>Your license(s) has been verified</span>
        </VerificationStatus>
      ) : doctorLicenses.documents.length > 0 ? (
        <VerificationStatus pending>
          <FaClock className="pending-icon" />
          <span>Your license(s) has been uploaded and is pending verification by admin</span>
        </VerificationStatus>
      ) : null}

      {/* License Documents List */}
      {doctorLicenses.documents && doctorLicenses.documents.length > 0 ? (
        <DocumentList>
          {doctorLicenses.documents.map((license) => (
            <DocumentItem key={license.id}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{license.title}</p>
                  <p className="text-sm text-gray-500">Type: License</p>
                  <p className="text-sm text-gray-500">Date: {license.date}</p>
                </div>
                <a 
                  href={`data:application/octet-stream;base64,${license.file}`}
                  className="text-blue-600 hover:text-blue-800"
                  target="_blank"
                  rel="noopener noreferrer"
                  download={license.title}
                >
                  View
                </a>
              </div>
            </DocumentItem>
          ))}
        </DocumentList>
            ) : !temp.licenseUploaded ? (
              <EmptyState>
                <EmptyStateIcon>📄</EmptyStateIcon>
                <EmptyStateTitle>No License Documents Yet</EmptyStateTitle>
                <EmptyStateText>
                  Please upload your medical license for verification.
                </EmptyStateText>
              </EmptyState>
            ) : null}

            {/* Always show upload button regardless of verification status */}
            <UploadContainer className="mt-4">
              <UploadButton>
                <FaUpload className="upload-icon" />
                <span>{temp.licenses && temp.licenses.length > 0 ? "Upload Additional License" : "Choose File"}</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleLicenseUpload}
                  style={{ display: "none" }}
                />
              </UploadButton>
              <UploadDescription>
                Upload a clear image or PDF of your medical license for verification
              </UploadDescription>
            </UploadContainer>
          </LicenseSection>
        </FormSection>
      )}
      </ContentWrapper>
    </ProfileContainer>
  );
}

// Styled Components
const ProfileContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;
  color: #333;
  padding: 0;
  margin: 0;
  position: relative;
`;

const Header = styled.header`
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
    color: #2d3748;
  }
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: #718096;
  font-size: 1.25rem;
  cursor: pointer;
  transition: color 0.2s;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #e53e3e;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ProfileSection = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

  .profile-picture-container {
    position: relative;
    margin-bottom: 1.5rem;
  }
`;

const ProfileImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const ProfilePlaceholder = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: #a0aec0;
`;

const EditIconWrapper = styled.div`
  position: absolute;
  bottom: 5px;
  right: 5px;

  .edit-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background-color: #4299e1;
    color: white;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(66, 153, 225, 0.5);
    transition: all 0.2s ease;

    &:hover {
      background-color: #3182ce;
      transform: scale(1.05);
    }
  }
`;

const ProfileName = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0.5rem 0;
  color: #2d3748;
`;

const ProfileEmail = styled.p`
  font-size: 1rem;
  color: #718096;
  margin: 0;
`;

const FormSection = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 2.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  position: relative;
  transition: all 0.3s ease;
  background-color: ${(props) => (props.isActive ? "#f7fafc" : "transparent")};
  padding: ${(props) => (props.isActive ? "1rem" : "0")};
  border-radius: 8px;
  border: ${(props) => (props.isActive ? "1px solid #e2e8f0" : "none")};

  &:hover {
    background-color: ${(props) => (props.isActive ? "#f7fafc" : "#f8f9fa")};
  }
`;

const FormLabel = styled.label`
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #4a5568;
  font-size: 0.875rem;

  .icon {
    margin-right: 0.5rem;
    font-size: 1rem;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
  transition: all 0.2s ease;
  background-color: ${(props) => (props.disabled ? "#f8f9fa" : "white")};
  color: #2d3748;

  &:disabled {
    cursor: not-allowed;
  }

  &:not(:disabled) {
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
  }

  &:focus {
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.25);
  }
`;

const ActionIcons = styled.div`
  position: absolute;
  right: 0.5rem;
  display: flex;
  gap: 0.5rem;
`;

const ActionIcon = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;

  &.edit {
    background-color: #ebf8ff;
    color: #4299e1;

    &:hover {
      background-color: #bee3f8;
    }
  }

  &.save {
    background-color: #f0fff4;
    color: #48bb78;

    &:hover {
      background-color: #c6f6d5;
    }
  }

  &.cancel {
    background-color: #fff5f5;
    color: #f56565;

    &:hover {
      background-color: #fed7d7;
    }
  }
`;

// Styled components for license upload section
const LicenseSection = styled.div`
  margin-top: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
`;

const UploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  border: 2px dashed #ccc;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #4a90e2;
  }
`;

const UploadLabel = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  
  .license-icon {
    font-size: 1.5rem;
    margin-right: 0.75rem;
    color: #4a90e2;
  }
`;

const UploadDescription = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const UploadButton = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  background-color: #4a90e2;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #3a7bc8;
  }
  
  .upload-icon {
    margin-right: 0.5rem;
  }
`;

const VerificationStatus = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  background-color: ${props => props.verified ? '#e7f7ed' : props.pending ? '#fff8e6' : '#f8f9fa'};
  
  .verified-icon {
    color: #28a745;
    font-size: 1.5rem;
    margin-right: 1rem;
  }
  
  .pending-icon {
    color: #ffc107;
    font-size: 1.5rem;
    margin-right: 1rem;
  }
  
  span {
    font-weight: 500;
    color: ${props => props.verified ? '#28a745' : props.pending ? '#856404' : '#333'};
  }
`;

// Add these styled component definitions to your file
// You can place them with your other styled components

// Document List components
const DocumentList = styled.div`
  margin-top: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
`;

const DocumentItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #f9fafb;
  }
`;

// Empty state components
const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  text-align: center;
  margin-top: 1rem;
`;

const EmptyStateIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const EmptyStateText = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  max-width: 20rem;
  margin: 0 auto;
`;