import React from 'react';
import { useSelector } from 'react-redux';
import { FileText, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import type { RootState } from '../store/store';

export const Records: React.FC = () => {
  const records = useSelector((state: RootState) => state.records.records);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Medical Records</h2>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {records.length > 0 ? (
              records.map((record) => (
                <li key={record.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {record.type}
                        </p>
                      </div>
                      {record.fileUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center"
                          onClick={() => window.open(record.fileUrl, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
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
              ))
            ) : (
              <li className="px-4 py-8 text-center text-gray-500">
                No medical records available
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};