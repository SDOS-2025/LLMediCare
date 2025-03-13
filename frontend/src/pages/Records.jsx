import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
// import { setRecords, setDocuments, setMedications, setLoading, setError } from '../store/slices/records-slice';
import styled from 'styled-components';

export default function Records() {
//   const dispatch = useDispatch();
//   const { records, documents, medications, loading, error } = useSelector((state) => state.records);
//   const user = useSelector((state) => state.auth.user);
  
//   const [activeTab, setActiveTab] = useState('medical');
//   const [showUploadForm, setShowUploadForm] = useState(false);
//   const [showAddMedicationForm, setShowAddMedicationForm] = useState(false);
  
//   // Document upload form state
//   const [documentTitle, setDocumentTitle] = useState('');
//   const [documentType, setDocumentType] = useState('test_result');
//   const [documentDate, setDocumentDate] = useState('');
//   const [documentFile, setDocumentFile] = useState(null);
  
//   // Medication form state
//   const [medicationName, setMedicationName] = useState('');
//   const [dosage, setDosage] = useState('');
//   const [frequency, setFrequency] = useState('');
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [instructions, setInstructions] = useState('');

//   useEffect(() => {
//     const fetchRecords = async () => {
//       if (!user) return;
      
//       dispatch(setLoading(true));
//       try {
//         // In a real app, you would fetch from the API
//         // For now, we'll use mock data
//         const mockRecords = [
//           {
//             id: 1,
//             date: '2025-01-15',
//             type: 'annual_physical',
//             doctor: 'Dr. Jane Smith',
//             findings: 'Normal health examination. Blood pressure slightly elevated.',
//             recommendations: 'Monitor blood pressure. Follow up in 6 months.'
//           },
//           {
//             id: 2,
//             date: '2024-11-20',
//             type: 'specialist_visit',
//             doctor: 'Dr. Robert Chen',
//             findings: 'Mild arthritis in right knee.',
//             recommendations: 'Physical therapy twice weekly. Anti-inflammatory medication as needed.'
//           }
//         ];
        
//         const mockDocuments = [
//           {
//             id: 1,
//             title: 'Blood Test Results',
//             type: 'test_result',
//             date: '2025-01-15',
//             file_url: '#'
//           },
//           {
//             id: 2,
//             title: 'X-Ray Report',
//             type: 'imaging',
//             date: '2024-11-20',
//             file_url: '#'
//           }
//         ];
        
//         const mockMedications = [
//           {
//             id: 1,
//             name: 'Ibuprofen',
//             dosage: '400mg',
//             frequency: 'Twice daily with food',
//             start_date: '2024-11-20',
//             end_date: '2025-02-20',
//             instructions: 'Take as needed for pain. Do not exceed 1200mg per day.'
//           },
//           {
//             id: 2,
//             name: 'Lisinopril',
//             dosage: '10mg',
//             frequency: 'Once daily',
//             start_date: '2025-01-15',
//             end_date: null,
//             instructions: 'Take in the morning. Monitor blood pressure weekly.'
//           }
//         ];
        
//         dispatch(setRecords(mockRecords));
//         dispatch(setDocuments(mockDocuments));
//         dispatch(setMedications(mockMedications));
//       } catch (err) {
//         console.error('Error fetching records:', err);
//         dispatch(setError('Failed to load medical records. Please try again.'));
//       } finally {
//         dispatch(setLoading(false));
//       }
//     };
    
//     fetchRecords();
//   }, [dispatch, user]);

//   const handleDocumentUpload = (e) => {
//     e.preventDefault();
    
//     // In a real app, you would upload the file and submit to the API
//     const newDocument = {
//       id: Date.now(),
//       title: documentTitle,
//       type: documentType,
//       date: documentDate,
//       file_url: '#'
//     };
    
//     dispatch(setDocuments([...documents, newDocument]));
    
//     // Reset form
//     setDocumentTitle('');
//     setDocumentType('test_result');
//     setDocumentDate('');
//     setDocumentFile(null);
//     setShowUploadForm(false);
//   };

//   const handleAddMedication = (e) => {
//     e.preventDefault();
    
//     // In a real app, you would submit to the API
//     const newMedication = {
//       id: Date.now(),
//       name: medicationName,
//       dosage,
//       frequency,
//       start_date: startDate,
//       end_date: endDate || null,
//       instructions
//     };
    
//     dispatch(setMedications([...medications, newMedication]));
    
//     // Reset form
//     setMedicationName('');
//     setDosage('');
//     setFrequency('');
//     setStartDate('');
//     setEndDate('');
//     setInstructions('');
//     setShowAddMedicationForm(false);
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center py-10">
//         Loading records...
//       </div>
//     );
//   }

//   if (error) {
    // return (
    //   <div className="text-red-500 text-center py-10">
    //     {error}
    //   </div>
    // );
//   }

//   if (!user) {
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
//   }

  // return (
//     <RecordsContainer>
//       <div className="text-center mb-8">
//         <h2 className="text-2xl font-bold mb-4">
//           Your Medical Records
//         </h2>
//         <p className="mb-6">
//           Access and manage your complete health information.
//         </p>
        
//         <div className="flex flex-wrap justify-center gap-4 mb-6">
//           <Button onClick={() => setShowUploadForm(true)}>
//             Upload Document
//           </Button>
//           <Button onClick={() => setShowAddMedicationForm(true)} variant="outline">
//             Add Medication
//           </Button>
//         </div>
//       </div>

//       {showUploadForm && (
//         <UploadFormContainer>
//           <UploadForm onSubmit={handleDocumentUpload}>
//             <h3 className="text-xl font-semibold mb-4">
//               Upload Medical Document
//             </h3>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Document Title
//               </label>
//               <input
//                 type="text"
//                 value={documentTitle}
//                 onChange={(e) => setDocumentTitle(e.target.value)}
//                 className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                 required
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Document Type
//               </label>
//               <select
//                 value={documentType}
//                 onChange={(e) => setDocumentType(e.target.value)}
//                 className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//               >
//                 <option value="test_result">Test Result</option>
//                 <option value="imaging">Imaging/X-Ray</option>
//                 <option value="prescription">Prescription</option>
//                 <option value="discharge">Discharge Summary</option>
//                 <option value="other">Other</option>
//               </select>
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Document Date
//               </label>
//               <input
//                 type="date"
//                 value={documentDate}
//                 onChange={(e) => setDocumentDate(e.target.value)}
//                 className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                 required
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 File
//               </label>
//               <input
//                 type="file"
//                 onChange={(e) => setDocumentFile(e.target.files[0])}
//                 className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                 required
//               />
//             </div>
            
//             <div className="flex space-x-4">
//               <Button type="submit">
//                 Upload
//               </Button>
//               <Button 
//                 type="button"
//                 variant="outline"
//                 onClick={() => setShowUploadForm(false)}
//               >
//                 Cancel
//               </Button>
//             </div>
//           </UploadForm>
//         </UploadFormContainer>
//       )}

//       {showAddMedicationForm && (
//         <AddMedicationFormContainer>
//           <AddMedicationForm onSubmit={handleAddMedication}>
//             <h3 className="text-xl font-semibold mb-4">
//               Add Medication
//             </h3>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Medication Name
//               </label>
//               <input
//                 type="text"
//                 value={medicationName}
//                 onChange={(e) => setMedicationName(e.target.value)}
//                 className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                 required
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Dosage
//               </label>
//               <input
//                 type="text"
//                 value={dosage}
//                 onChange={(e) => setDosage(e.target.value)}
//                 className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                 required
//                 placeholder="e.g., 500mg"
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Frequency
//               </label>
//               <input
//                 type="text"
//                 value={frequency}
//                 onChange={(e) => setFrequency(e.target.value)}
//                 className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                 required
//                 placeholder="e.g., Twice daily with food"
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Start Date
//               </label>
//               <input
//                 type="date"
//                 value={startDate}
//                 onChange={(e) => setStartDate(e.target.value)}
//                 className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                 required
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 End Date (Optional)
//               </label>
//               <input
//                 type="date"
//                 value={endDate}
//                 onChange={(e) => setEndDate(e.target.value)}
//                 className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Special Instructions
//               </label>
//               <textarea
//                 value={instructions}
//                 onChange={(e) => setInstructions(e.target.value)}
//                 className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                 rows="3"
//               ></textarea>
//             </div>
            
//             <div className="flex space-x-4">
//               <Button type="submit">
//                 Add Medication
//               </Button>
//               <Button 
//                 type="button"
//                 variant="outline"
//                 onClick={() => setShowAddMedicationForm(false)}
//               >
//                 Cancel
//               </Button>
//             </div>
//           </AddMedicationForm>
//         </AddMedicationFormContainer>
//       )}

//       <TabContainer>
//         <nav className="flex -mb-px">
//           <TabButton
//             className={activeTab === 'medical' ? 'active' : ''}
//             onClick={() => setActiveTab('medical')}
//           >
//             Medical Records
//           </TabButton>
//           <TabButton
//             className={activeTab === 'documents' ? 'active' : ''}
//             onClick={() => setActiveTab('documents')}
//           >
//             Documents
//           </TabButton>
//           <TabButton
//             className={activeTab === 'medications' ? 'active' : ''}
//             onClick={() => setActiveTab('medications')}
//           >
//             Medications
//           </TabButton>
//         </nav>
//       </TabContainer>

//       <TabContent>
//         {activeTab === 'medical' && (
//           records.length > 0 ? (
//             <RecordList>
//               {records.map((record) => (
//                 <RecordItem key={record.id}>
//                   <div>
//                     <p className="font-medium text-gray-900">
//                       {record.type === 'annual_physical' ? 'Annual Physical' : 'Specialist Visit'} - {record.date}
//                     </p>
//                     <p className="text-gray-500">Doctor: {record.doctor}</p>
//                     <p className="text-sm text-gray-500 mt-2">
//                       <span className="font-medium">Findings:</span> {record.findings}
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       <span className="font-medium">Recommendations:</span> {record.recommendations}
//                     </p>
//                   </div>
//                 </RecordItem>
//               ))}
//             </RecordList>
//           ) : (
//             <p className="text-center py-6 text-gray-500">
//               No medical records found.
//             </p>
//           )
//         )}

//         {activeTab === 'documents' && (
//           documents.length > 0 ? (
//             <DocumentList>
//               {documents.map((document) => (
//                 <DocumentItem key={document.id}>
//                   <div className="flex justify-between items-center">
//                     <div>
//                       <p className="font-medium text-gray-900">{document.title}</p>
//                       <p className="text-sm text-gray-500">
//                         {document.type === 'test_result' ? 'Test Result' : 
//                          document.type === 'imaging' ? 'Imaging/X-Ray' : 
//                          document.type === 'prescription' ? 'Prescription' : 
//                          document.type === 'discharge' ? 'Discharge Summary' : 'Other'}
//                       </p>
//                       <p className="text-sm text-gray-500">Date: {document.date}</p>
//                     </div>
//                     <a 
//                       href={document.file_url}
//                       className="text-blue-600 hover:text-blue-800"
//                       target="_blank"
//                       rel="noopener noreferrer"
//                     >
//                       View
//                     </a>
//                   </div>
//                 </DocumentItem>
//               ))}
//             </DocumentList>
//           ) : (
//             <p className="text-center py-6 text-gray-500">
//               No documents found.
//             </p>
//           )
//         )}

//         {activeTab === 'medications' && (
//           medications.length > 0 ? (
//             <MedicationList>
//               {medications.map((medication) => (
//                 <MedicationItem key={medication.id}>
//                   <div>
//                     <div className="flex justify-between">
//                       <p className="font-medium text-gray-900">{medication.name}</p>
//                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                         !medication.end_date || new Date(medication.end_date) > new Date() 
//                           ? 'bg-green-100 text-green-800'
//                           : 'bg-gray-100 text-gray-800'
//                       }`}>
//                         {!medication.end_date || new Date(medication.end_date) > new Date() 
//                           ? 'Active'
//                           : 'Completed'}
//                       </span>
//                     </div>
//                     <p className="text-gray-500">
//                       {medication.dosage} - {medication.frequency}
//                     </p>
//                     <p className="text-sm text-gray-500 mt-1">
//                       Started: {medication.start_date}
//                       {medication.end_date ? ` | Ends: ${medication.end_date}` : ' | Ongoing'}
//                     </p>
//                     {medication.instructions && (
//                       <p className="text-sm text-gray-500 mt-1">
//                         <span className="font-medium">Instructions:</span> {medication.instructions}
//                       </p>
//                     )}
//                   </div>
//                 </MedicationItem>
//               ))}
//             </MedicationList>
//           ) : (
//             <p className="text-center py-6 text-gray-500">
//               No medications found.
//             </p>
//           )
//         )}
//       </TabContent>
//     </RecordsContainer>
  // );
};


const RecordsContainer = styled.div`
  max-width: 7xl;
  margin: 0 auto;
  padding: 24px;
  background-color: #f9fafb; // gray-50
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