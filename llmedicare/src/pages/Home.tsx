import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, Calendar, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Home: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Your AI-Powered Healthcare Assistant
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Get instant medical advice, manage appointments, and access your health records all in one place.
              Experience the future of healthcare management.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link to="/chat">
                <Button size="lg">Start Chat</Button>
              </Link>
              <Link to="/appointments">
                <Button variant="outline" size="lg">Book Appointment</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Comprehensive Care</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for better health
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <Bot className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  AI Chat Assistant
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Get instant medical advice and preliminary evaluations from our AI-powered healthcare assistant.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <Calendar className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Appointment Management
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Schedule and manage appointments with healthcare providers, both online and in-person.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <FileText className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  Medical Records
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Securely store and access your medical history, prescriptions, and test results.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};