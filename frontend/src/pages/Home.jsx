import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import styled from 'styled-components';

const HomeContainer = styled.div`
  background-color: white;
`;

const HeroSection = styled.div`
  position: relative;
  padding: 14px 6px;
`;

const HeroTitle = styled.h1`
  font-size: 4rem;
  font-weight: bold;
  color: #1f2937; // gray-900
`;

const HeroText = styled.p`
  margin-top: 1.5rem;
  font-size: 1.125rem;
  line-height: 1.75rem;
  color: #4b5563; // gray-600
`;

const FeaturesSection = styled.div`
  background-color: #f9fafb; // gray-50
  padding: 24px 0;
`;

const FeaturesContainer = styled.div`
  margin: 0 auto;
  max-width: 80rem; // 7xl
  padding: 0 6px;
`;

const FeaturesTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: #2563eb; // blue-600
`;

const FeaturesSubtitle = styled.p`
  margin-top: 0.5rem;
  font-size: 2.25rem;
  font-weight: bold;
  color: #1f2937; // gray-900
`;

const FeaturesList = styled.dl`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px 10px;
  margin-top: 16px;
`;

const FeaturesItem = styled.div`
  position: relative;
  padding-left: 16px;
`;

const FeaturesIcon = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #2563eb; // blue-600
`;

const FeaturesIconSvg = styled.svg`
  width: 6px;
  height: 6px;
  fill: none;
  stroke: white;
  stroke-width: 2;
`;

const FeaturesItemTitle = styled.dt`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937; // gray-900
`;

const FeaturesItemDescription = styled.dd`
  margin-top: 0.5rem;
  font-size: 1rem;
  line-height: 1.5rem;
  color: #4b5563; // gray-600
`;

export const Home = () => {
  return (
    <HomeContainer>
      <HeroSection>
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <HeroTitle>Your AI-Powered Healthcare Assistant</HeroTitle>
            <HeroText>
              Get instant medical advice, manage appointments, and access your health records all in one place.
              Experience the future of healthcare management.
            </HeroText>
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
      </HeroSection>

      <FeaturesSection>
        <FeaturesContainer>
          <div className="mx-auto max-w-2xl lg:text-center">
            <FeaturesTitle>Comprehensive Care</FeaturesTitle>
            <FeaturesSubtitle>Everything you need for better health</FeaturesSubtitle>
          </div>
          <FeaturesList>
            <FeaturesItem>
              <FeaturesIcon>
                <FeaturesIconSvg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M16 16.2718C15.2045 15.469 ..." />
                </FeaturesIconSvg>
              </FeaturesIcon>
              <FeaturesItemTitle>AI Chat Assistant</FeaturesItemTitle>
              <FeaturesItemDescription>
                Get instant medical advice and preliminary evaluations from our AI-powered healthcare assistant.
              </FeaturesItemDescription>
            </FeaturesItem>
            <FeaturesItem>
              <FeaturesIcon>
                <FeaturesIconSvg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M8 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M16 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M3 9H21" stroke="currentColor" strokeWidth="2" />
                </FeaturesIconSvg>
              </FeaturesIcon>
              <FeaturesItemTitle>Appointment Management</FeaturesItemTitle>
              <FeaturesItemDescription>
                Schedule and manage appointments with healthcare providers, both online and in-person.
              </FeaturesItemDescription>
            </FeaturesItem>
            <FeaturesItem>
              <FeaturesIcon>
                <FeaturesIconSvg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </FeaturesIconSvg>
              </FeaturesIcon>
              <FeaturesItemTitle>Medical Records</FeaturesItemTitle>
              <FeaturesItemDescription>
                Securely store and access your medical history, prescriptions, and test results.
              </FeaturesItemDescription>
            </FeaturesItem>
          </FeaturesList>
        </FeaturesContainer>
      </FeaturesSection>
    </HomeContainer>
  );
};
