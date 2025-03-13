import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import { FaPen, FaCheck, FaTrash, FaTimes, FaUser } from "react-icons/fa";
import { updateExistingUser } from "../store/slices/user-slice.js";
import { getAuth, sendPasswordResetEmail, updateEmail } from "firebase/auth";
import { auth } from "../utils/firebase-config.js";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isEditable, setIsEditable] = useState({
    name: false,
    email: false,
    chatGPTKey: false,
    password: false,
  });

//   const currentUser = useSelector((state) => state.user.selectedUser);

  // Temporary state to hold changes
  const [temp, setTemp] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top of the page when the component is mounted
  }, []);

//   useEffect(() => {
//     setTemp(currentUser);
//   }, [currentUser]);

  const handleEditToggle = (field) => {
    setIsEditable((prev) => ({ ...prev, [field]: !prev[field] }));
    if (isEditable[field] === false) {
    //   setTemp((prev) => ({
    //     ...prev,
    //     [field]: currentUser[field],
    //   }));
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      
      reader.addEventListener('load', () => {
        const imageBlob = reader.result;  // Get the base64 string
        console.log("Image Blob: ", imageBlob);  // Now it will show the correct value
        // setTemp((prev) => ({
        //   ...prev,
        //   profile_pic: reader.result,
        // }));
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSaveChanges = async (field) => {
    // dispatch(updateExistingUser({ email: currentUser.email, userData: temp }));
    setIsEditable((prev) => ({ ...prev, [field]: false }));
  };

  const handleDiscardChanges = (field) => {
    // setTemp((prev) => ({
    //   ...prev,
    //   [field]: currentUser[field],
    // }));
    setIsEditable((prev) => ({ ...prev, [field]: false }));
  };

  const handleCloseClick = () => {
    // console.log(temp.profile_pic);
    // dispatch(updateExistingUser({ email: currentUser.email, userData: temp })); // Dispatching action to update user data
    navigate("/home");
  };

  const handleResetPassword = async () => {
    try {
    //   await sendPasswordResetEmail(auth, currentUser.email);
      alert("Password reset email sent! Check your inbox.");
    } catch (error) {
      alert(error.message);
    }
  };


  return (
    <ProfileContainer>
      <Header>
        <h2>Your Profile</h2>
        <CloseBtn onClick={handleCloseClick}>
          {/* <FaTimes /> */}
        </CloseBtn>
      </Header>
      
      <ContentWrapper>
        <ProfileSection>
          <div className="profile-picture-container">
            {temp !== null && temp.profile_pic !== "" ? (
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
          
          <ProfileName>
            {temp !== null ? temp.name : "User"}
          </ProfileName>
          
          <ProfileEmail>
            {temp !== null ? temp.email : "email@example.com"}
          </ProfileEmail>
        </ProfileSection>

        <FormSection>
          <SectionTitle>Account Details</SectionTitle>
          
          <FormGrid>
            {[
              {
                label: "Name",
                value: temp && temp.name && typeof temp.name === "string" ? temp.name : "User",
                setValue: (value) => setTemp((prev) => ({ ...prev, name: value })),
                field: "name",
                icon: "👤",
              },
              {
                label: "Email",
                value: temp && temp.email && typeof temp.email === "string" ? temp.email : "email@example.com",
                setValue: (value) => setTemp((prev) => ({ ...prev, email: value })),
                field: "email",
                icon: "✉️",
              },
              {
                label: "Password",
                value: "************",
                setValue: (value) => setTemp((prev) => ({ ...prev, password: value })),
                field: "password",
                icon: "🔒",
              },
            ].map(({ label, value, field, icon }) => (
              <FormGroup key={field} isActive={isEditable[field]}>
                <FormLabel>
                  <span className="icon">{icon}</span>
                  {label}
                </FormLabel>
                
                <InputWrapper>
                  <FormInput
                    type={field === "password" ? "password" : "text"}
                    value={value}
                    disabled={!isEditable[field]}
                  />
                  
                  {field !== "email" && <ActionIcons>
                    {!isEditable[field] ? (
                      <ActionIcon 
                        className="edit" 
                        onClick={() => field !== "password" ? handleEditToggle(field): handleResetPassword()}
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
                }
                </InputWrapper>
              </FormGroup>
            ))}
          </FormGrid>
        </FormSection>
      </ContentWrapper>
    </ProfileContainer>
  );
}

// Styled Components
const ProfileContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
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
  background-color: ${props => props.isActive ? '#f7fafc' : 'transparent'};
  padding: ${props => props.isActive ? '1rem' : '0'};
  border-radius: 8px;
  border: ${props => props.isActive ? '1px solid #e2e8f0' : 'none'};
  
  &:hover {
    background-color: ${props => props.isActive ? '#f7fafc' : '#f8f9fa'};
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
  background-color: ${props => props.disabled ? '#f8f9fa' : 'white'};
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