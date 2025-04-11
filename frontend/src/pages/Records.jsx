import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRecords } from '../store/slices/recordsSlice';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

export default function Records() {
  const dispatch = useDispatch();
  const { records, documents, medications, loading, error } = useSelector((state) => state.records);
  const user = useSelector((state) => state.user.currentUser);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('medical');
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  // Document upload form state
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentType, setDocumentType] = useState('test_result');
  const [documentDate, setDocumentDate] = useState('');
  const [documentFile, setDocumentFile] = useState(null);

  // Fetch records when user is available
  useEffect(() => {
    if (user) {
      dispatch(fetchRecords());
    }
  }, [dispatch, user]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Updated: Document upload now makes a POST request to the backend.
  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    // For demonstration, we simulate a file upload by assigning a dummy URL.
    const newDocument = {
      title: documentTitle,
      type: documentType,
      date: documentDate,
      file_url: documentFile ? "http://example.com/dummy-file.pdf" : ""
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/records/add_document/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // Add auth headers here if required.
        },
        body: JSON.stringify(newDocument)
      });
      if (!response.ok) {
        throw new Error('Failed to add document');
      }
      await response.json();
      dispatch(fetchRecords());
      // Reset document form
      setDocumentTitle('');
      setDocumentType('test_result');
      setDocumentDate('');
      setDocumentFile(null);
      setShowUploadForm(false);
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <AppContainer>
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <MainContent sidebarOpen={sidebarOpen}>
          <LoadingContainer>
            <LoadingText>Loading records...</LoadingText>
          </LoadingContainer>
        </MainContent>
      </AppContainer>
    );
  }

  if (error) {
    return (
      <AppContainer>
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <MainContent sidebarOpen={sidebarOpen}>
          <ErrorContainer>
            <ErrorText>{error}</ErrorText>
          </ErrorContainer>
        </MainContent>
      </AppContainer>
    );
  }

  if (!user) {
    return (
      <AppContainer>
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <MainContent sidebarOpen={sidebarOpen}>
          <RecordsContainer>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">
                Your Medical Repository
              </h2>
              <p className="mb-6">
                Please sign in to view and manage your medical records.
              </p>
            </div>
          </RecordsContainer>
        </MainContent>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <MainContent sidebarOpen={sidebarOpen}>
        <RecordsContainer>
          <RecordsHeader>
            <h2 className="text-3xl font-bold mb-2">
            Your Medical Repository
            </h2>
            <p className="text-gray-600 mb-8">
              Access and manage your complete health information
            </p>
          </RecordsHeader>

          <TabContainer>
            <nav className="flex justify-center border-b border-gray-200">
              <TabButton
                className={activeTab === 'medical' ? 'active' : ''}
                onClick={() => setActiveTab('medical')}
              >
                Medical Records
              </TabButton>
              <TabButton
                className={activeTab === 'documents' ? 'active' : ''}
                onClick={() => setActiveTab('documents')}
              >
                Documents
              </TabButton>
              <TabButton
                className={activeTab === 'medications' ? 'active' : ''}
                onClick={() => setActiveTab('medications')}
              >
                Medications
              </TabButton>
            </nav>
          </TabContainer>

          <TabContent>
            {activeTab === 'medical' && (
              <TabSection>
                {records.length > 0 ? (
                  <RecordList>
                    {records.map((record) => (
                      <RecordItem key={record.id}>
                        <div>
                          <p className="font-medium text-gray-900">
                            {record.type} - {record.date}
                          </p>
                          <p className="text-gray-500">Doctor: {record.doctor}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            <span className="font-medium">Findings:</span> {record.findings}
                          </p>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Recommendations:</span> {record.recommendations}
                          </p>
                        </div>
                      </RecordItem>
                    ))}
                  </RecordList>
                ) : (
                  <EmptyState>
                    <EmptyStateIcon>📋</EmptyStateIcon>
                    <EmptyStateTitle>No Medical Records Yet</EmptyStateTitle>
                    <EmptyStateText>
                      Your medical history will appear here after your first appointment with a healthcare provider.
                    </EmptyStateText>
                  </EmptyState>
                )}
              </TabSection>
            )}

            {activeTab === 'documents' && (
              <TabSection>
                {!showUploadForm && (
                  <div className="flex justify-center mb-6">
                    <Button onClick={() => setShowUploadForm(true)}>
                      Upload Document
                    </Button>
                  </div>
                )}

                {showUploadForm && (
                  <UploadFormContainer>
                    <UploadForm onSubmit={handleDocumentUpload}>
                      <h3 className="text-xl font-semibold mb-4">
                        Upload Medical Document
                      </h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Document Title
                        </label>
                        <input
                          type="text"
                          value={documentTitle}
                          onChange={(e) => setDocumentTitle(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Document Type
                        </label>
                        <select
                          value={documentType}
                          onChange={(e) => setDocumentType(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="test_result">Test Result</option>
                          <option value="imaging">Imaging/X-Ray</option>
                          <option value="prescription">Prescription</option>
                          <option value="discharge">Discharge Summary</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Document Date
                        </label>
                        <input
                          type="date"
                          value={documentDate}
                          onChange={(e) => setDocumentDate(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          File
                        </label>
                        <input
                          type="file"
                          onChange={(e) => setDocumentFile(e.target.files[0])}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div className="flex space-x-4">
                        <Button type="submit">Upload</Button>
                        <Button type="button" variant="outline" onClick={() => setShowUploadForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </UploadForm>
                  </UploadFormContainer>
                )}

                {!showUploadForm && (
                  documents.length > 0 ? (
                    <DocumentList>
                      {documents.map((document) => (
                        <DocumentItem key={document.id}>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">{document.title}</p>
                              <p className="text-sm text-gray-500">
                                {document.type === 'test_result' ? 'Test Result' : 
                                document.type === 'imaging' ? 'Imaging/X-Ray' : 
                                document.type === 'prescription' ? 'Prescription' : 
                                document.type === 'discharge' ? 'Discharge Summary' : 'Other'}
                              </p>
                              <p className="text-sm text-gray-500">Date: {document.date}</p>
                            </div>
                            <a 
                              href={document.file_url}
                              className="text-blue-600 hover:text-blue-800"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View
                            </a>
                          </div>
                        </DocumentItem>
                      ))}
                    </DocumentList>
                  ) : (
                    <EmptyState>
                      <EmptyStateIcon>📄</EmptyStateIcon>
                      <EmptyStateTitle>No Documents Yet</EmptyStateTitle>
                      <EmptyStateText>
                        Upload your medical documents to keep track of test results, prescriptions, and other important files.
                      </EmptyStateText>
                    </EmptyState>
                  )
                )}
              </TabSection>
            )}

            {activeTab === 'medications' && (
              <TabSection>
                {medications.length > 0 ? (
                  <MedicationList>
                    {medications.map((medication) => (
                      <MedicationItem key={medication.id}>
                        <div>
                          <div className="flex justify-between">
                            <p className="font-medium text-gray-900">{medication.name}</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              !medication.end_date || new Date(medication.end_date) > new Date() 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {!medication.end_date || new Date(medication.end_date) > new Date() 
                                ? 'Active'
                                : 'Completed'}
                            </span>
                          </div>
                          <p className="text-gray-500">
                            {medication.dosage} - {medication.frequency}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Started: {medication.start_date}
                            {medication.end_date ? ` | Ends: ${medication.end_date}` : ' | Ongoing'}
                          </p>
                          {medication.instructions && (
                            <p className="text-sm text-gray-500 mt-1">
                              <span className="font-medium">Instructions:</span> {medication.instructions}
                            </p>
                          )}
                        </div>
                      </MedicationItem>
                    ))}
                  </MedicationList>
                ) : (
                  <EmptyState>
                    <EmptyStateIcon>💊</EmptyStateIcon>
                    <EmptyStateTitle>No Medications Yet</EmptyStateTitle>
                    <EmptyStateText>
                      Your current and past medications prescribed by your healthcare providers will appear here.
                    </EmptyStateText>
                  </EmptyState>
                )}
              </TabSection>
            )}
          </TabContent>
        </RecordsContainer>
      </MainContent>
    </AppContainer>
  );
}

// Styled Components
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  margin-left: 72px; /* Width of collapsed sidebar */
  margin-top: 64px; /* Height of header */
  flex: 1;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${props => props.sidebarOpen && `
    @media (min-width: 768px) {
      margin-left: 240px;
    }
  `}
`;

const RecordsContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
`;

const RecordsHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const TabContainer = styled.div`
  margin-bottom: 2rem;
`;

const TabButton = styled.button`
  padding: 1rem 1.5rem;
  font-weight: 500;
  color: #6b7280;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    color: #4b5563;
  }
  
  &.active {
    color: #2563eb;
    border-bottom-color: #2563eb;
  }
`;

const TabContent = styled.div`
  min-height: 400px;
`;

const TabSection = styled.div`
  padding: 1rem 0;
`;

const RecordList = styled.ul`
  list-style: none;
  padding: 0;
`;

const RecordItem = styled.li`
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease-in-out;
  
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transform: scale(1.02);
  }
`;

const DocumentList = styled.ul`
  list-style: none;
  padding: 0;
`;

const DocumentItem = styled.li`
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease-in-out;
  
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transform: scale(1.02);
  }
`;

const MedicationList = styled.ul`
  list-style: none;
  padding: 0;
`;

const MedicationItem = styled.li`
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease-in-out;
  
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    transform: scale(1.02);
  }
`;

const Button = styled.button`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  
  ${props => props.variant === 'outline' ? `
    background-color: transparent;
    border: 1px solid #2563eb;
    color: #2563eb;
    &:hover {
      background-color: rgba(37, 99, 235, 0.1);
    }
  ` : `
    background-color: #2563eb;
    border: 1px solid #2563eb;
    color: white;
    &:hover {
      background-color: #1d4ed8;
    }
  `}
`;

const UploadFormContainer = styled.div`
  margin-bottom: 2rem;
`;

const UploadForm = styled.form`
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: grid;
  gap: 1rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
`;

const LoadingText = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
`;

const ErrorText = styled.p`
  font-size: 1.125rem;
  color: #ef4444;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
`;

const EmptyStateIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const EmptyStateText = styled.p`
  color: #6b7280;
  max-width: 30rem;
`;