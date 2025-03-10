import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppointmentForm } from '../components/appointments/AppointmentForm';
import { Calendar } from 'lucide-react';
import { addAppointment } from '../store/slices/appointmentSlice';
import type { RootState } from '../store/store';

export const Appointments: React.FC = () => {
  const dispatch = useDispatch();
  const appointments = useSelector((state: RootState) => state.appointments.appointments);
  const user = useSelector((state: RootState) => state.auth.user);

  const handleNewAppointment = (appointment: {
    date: string;
    time: string;
    type: string;
    description: string;
  }) => {
    if (!user) return;

    const newAppointment = {
      ...appointment,
      id: Date.now().toString(),
      userId: user.uid,
    };

    dispatch(addAppointment(newAppointment));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Schedule an Appointment
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Choose your preferred date and time for the appointment.</p>
            </div>
            <div className="mt-5">
              <AppointmentForm onSubmit={handleNewAppointment} />
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Upcoming Appointments
          </h3>
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-white shadow overflow-hidden sm:rounded-lg"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-sm font-medium text-blue-600 truncate">
                      {apt.date} at {apt.time}
                    </p>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{apt.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};