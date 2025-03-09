import React from 'react';
import { FileText, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Records: React.FC = () => {
  const mockRecords = [
    {
      id: 1,
      type: 'Lab Results',
      date: '2024-02-15',
      doctor: 'Dr. Smith',
      description: 'Annual blood work results',
    },
    {
      id: 2,
      type: 'Prescription',
      date: '2024-02-10',
      doctor: 'Dr. Johnson',
      description: 'Antibiotic prescription',
    },
    // Add more mock records as needed
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Medical Records</h2>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {mockRecords.map((record) => (
              <li key={record.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {record.type}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                  <div className="mt-2">
                    <div className="sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {record.doctor}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          {record.date}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{record.description}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};