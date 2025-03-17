import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRecords } from '../store/slices/recordsSlice';
import styled from 'styled-components';

export default function Records() {
  const dispatch = useDispatch();
  const { records, documents, medications, loading, error } = useSelector((state) => state.records);
  const user = useSelector((state) => state.user.currentUser);
  
  const [activeTab, setActiveTab] = useState('medical');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showAddMedicationForm, setShowAddMedicationForm] = useState(false);
  const [showAddMedicalRecordForm, setShowAddMedicalRecordForm] = useState(false);
  
  // Document upload form state
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentType, setDocumentType] = useState('test_result');
  const [documentDate, setDocumentDate] = useState('');
  const [documentFile, setDocumentFile] = useState(null);
  
  // Medication form state
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [instructions, setInstructions] = useState('');

  // Medical Record form state (using fields from your model)
  const [recordDate, setRecordDate] = useState('');
  const [recordType, setRecordType] = useState('');
  const [recordDoctor, setRecordDoctor] = useState('');
  const [recordFindings, setRecordFindings] = useState('');
  const [recordRecommendations, setRecordRecommendations] = useState('');

  // Fetch records when user is available
  useEffect(() => {
    if (user) {
      dispatch(fetchRecords());
    }
  }, [dispatch, user]);

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

  // Medication: demo handler using a POST request.
  const handleAddMedication = async (e) => {
    e.preventDefault();
    const newMedication = {
      name: medicationName,
      dosage: dosage,
      frequency: frequency,
      start_date: startDate,
      end_date: endDate || null,
      instructions: instructions
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/records/add_medication/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newMedication)
      });
      if (!response.ok) {
        throw new Error('Failed to add medication');
      }
      await response.json();
      dispatch(fetchRecords());
      // Reset medication form
      setMedicationName('');
      setDosage('');
      setFrequency('');
      setStartDate('');
      setEndDate('');
      setInstructions('');
      setShowAddMedicationForm(false);
    } catch (error) {
      alert(error.message);
    }
  };

  // Medical Record: demo handler using a POST request.
  const handleAddMedicalRecord = async (e) => {
    e.preventDefault();
    const newRecord = {
      date: recordDate,
      type: recordType,
      doctor: recordDoctor,
      findings: recordFindings,
      recommendations: recordRecommendations
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/records/add_medical_record/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRecord)
      });
      if (!response.ok) {
        throw new Error('Failed to add medical record');
      }
      await response.json();
      dispatch(fetchRecords());
      setRecordDate('');
      setRecordType('');
      setRecordDoctor('');
      setRecordFindings('');
      setRecordRecommendations('');
      setShowAddMedicalRecordForm(false);
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        Loading records...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-10">
        {error}
      </div>
    );
  }

  if (!user) {
    return (
      <RecordsContainer>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            Your Medical Records
          </h2>
          <p className="mb-6">
            Please sign in to view and manage your medical records.
          </p>
        </div>
      </RecordsContainer>
    );
  }

  return (
    <RecordsContainer>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">
          Your Medical Records
        </h2>
        <p className="mb-6">
          Access and manage your complete health information.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <Button onClick={() => setShowUploadForm(true)}>
            Upload Document
          </Button>
          <Button onClick={() => setShowAddMedicationForm(true)} variant="outline">
            Add Medication
          </Button>
          <Button onClick={() => setShowAddMedicalRecordForm(true)} variant="outline">
            Add Medical Record
          </Button>
        </div>
      </div>

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

      {showAddMedicationForm && (
        <AddMedicationFormContainer>
          <AddMedicationForm onSubmit={handleAddMedication}>
            <h3 className="text-xl font-semibold mb-4">Add Medication</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medication Name
              </label>
              <input
                type="text"
                value={medicationName}
                onChange={(e) => setMedicationName(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dosage
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="e.g., 500mg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <input
                type="text"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="e.g., Twice daily with food"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Instructions
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows="3"
              ></textarea>
            </div>
            <div className="flex space-x-4">
              <Button type="submit">Add Medication</Button>
              <Button type="button" variant="outline" onClick={() => setShowAddMedicationForm(false)}>
                Cancel
              </Button>
            </div>
          </AddMedicationForm>
        </AddMedicationFormContainer>
      )}

      {showAddMedicalRecordForm && (
        <AddMedicalRecordFormContainer>
          <AddMedicalRecordForm onSubmit={handleAddMedicalRecord}>
            <h3 className="text-xl font-semibold mb-4">Add Medical Record</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <input
                type="text"
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Annual Physical"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor
              </label>
              <input
                type="text"
                value={recordDoctor}
                onChange={(e) => setRecordDoctor(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Doctor's name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Findings
              </label>
              <textarea
                value={recordFindings}
                onChange={(e) => setRecordFindings(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Enter findings"
                required
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recommendations
              </label>
              <textarea
                value={recordRecommendations}
                onChange={(e) => setRecordRecommendations(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Enter recommendations"
                required
              ></textarea>
            </div>
            <div className="flex space-x-4">
              <Button type="submit">Add Medical Record</Button>
              <Button type="button" variant="outline" onClick={() => setShowAddMedicalRecordForm(false)}>
                Cancel
              </Button>
            </div>
          </AddMedicalRecordForm>
        </AddMedicalRecordFormContainer>
      )}

      <TabContainer>
        <nav className="flex -mb-px">
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
          records.length > 0 ? (
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
            <p className="text-center py-6 text-gray-500">
              No medical records found.
            </p>
          )
        )}

        {activeTab === 'documents' && (
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
            <p className="text-center py-6 text-gray-500">
              No documents found.
            </p>
          )
        )}

        {activeTab === 'medications' && (
          medications.length > 0 ? (
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
            <p className="text-center py-6 text-gray-500">
              No medications found.
            </p>
          )
        )}
      </TabContent>
    </RecordsContainer>
  );
};

const RecordsContainer = styled.div`
  max-width: 7xl;
  margin: 0 auto;
  padding: 24px;
  background-color: #f9fafb;
`;

const UploadFormContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
  padding: 24px;
`;

const UploadForm = styled.form`
  background-color: #fff;
  padding: 24px;
  border-radius: 10px;
  width: 100%;
  max-width: 500px;
`;

const AddMedicationFormContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
  padding: 24px;
`;

const AddMedicationForm = styled.form`
  background-color: #fff;
  padding: 24px;
  border-radius: 10px;
  width: 100%;
  max-width: 500px;
`;

const AddMedicalRecordFormContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
  padding: 24px;
`;

const AddMedicalRecordForm = styled.form`
  background-color: #fff;
  padding: 24px;
  border-radius: 10px;
  width: 100%;
  max-width: 500px;
`;

const TabContainer = styled.div`
  border-bottom: 1px solid #ddd;
`;

const TabButton = styled.button`
  padding: 16px;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  &.active {
    border-bottom-color: #337ab7;
    color: #337ab7;
  }
`;

const TabContent = styled.div`
  padding: 24px;
`;

const RecordList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const RecordItem = styled.li`
  padding: 16px;
  border-bottom: 1px solid #ddd;
  &:last-child {
    border-bottom: none;
  }
`;

const DocumentList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const DocumentItem = styled.li`
  padding: 16px;
  border-bottom: 1px solid #ddd;
  &:last-child {
    border-bottom: none;
  }
`;

const MedicationList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const MedicationItem = styled.li`
  padding: 16px;
  border-bottom: 1px solid #ddd;
  &:last-child {
    border-bottom: none;
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
  margin-top: 1rem;
  
  ${props => props.variant === 'outline' ? `
    background-color: transparent;
    border: 1px solid #337ab7;
    color: #337ab7;
    &:hover {
      background-color: rgba(51, 122, 183, 0.1);
    }
  ` : `
    background-color: #337ab7;
    border: 1px solid #337ab7;
    color: white;
    &:hover {
      background-color: #286090;
    }
  `}
`;
