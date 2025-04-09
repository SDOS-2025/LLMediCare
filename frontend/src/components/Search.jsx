import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search in different categories based on user role
      const results = await Promise.all([
        searchAppointments(query),
        searchMedicalRecords(query),
        searchDoctors(query),
      ]);

      // Combine and deduplicate results
      const combinedResults = [...new Set([...results.flat()])];
      setSearchResults(combinedResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const searchAppointments = async (query) => {
    // Implement appointment search
    return [];
  };

  const searchMedicalRecords = async (query) => {
    // Implement medical records search
    return [];
  };

  const searchDoctors = async (query) => {
    // Implement doctor search
    return [];
  };

  const handleResultClick = (result) => {
    setShowResults(false);
    setSearchQuery('');
    // Navigate based on result type
    switch (result.type) {
      case 'appointment':
        navigate('/appointments');
        break;
      case 'record':
        navigate('/records');
        break;
      case 'doctor':
        navigate(`/doctor/${result.id}`);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <SearchContainer>
      <SearchWrapper>
        <SearchInput
          type="text"
          placeholder="Search appointments, records, doctors..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
        />
        <SearchIcon>
          {isSearching ? (
            <LoadingSpinner />
          ) : searchQuery ? (
            <ClearButton onClick={() => setSearchQuery('')}>
              <FaTimes />
            </ClearButton>
          ) : (
            <FaSearch />
          )}
        </SearchIcon>
      </SearchWrapper>

      {showResults && searchResults.length > 0 && (
        <ResultsContainer>
          {searchResults.map((result, index) => (
            <ResultItem key={index} onClick={() => handleResultClick(result)}>
              <ResultIcon>{result.icon}</ResultIcon>
              <ResultContent>
                <ResultTitle>{result.title}</ResultTitle>
                <ResultDescription>{result.description}</ResultDescription>
              </ResultContent>
            </ResultItem>
          ))}
        </ResultsContainer>
      )}
    </SearchContainer>
  );
}

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
`;

const SearchWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3a86ff;
    box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.1);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 1rem;
  color: #64748b;
  cursor: pointer;
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #3a86ff;
  }
`;

const ResultsContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin-top: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
  z-index: 50;
`;

const ResultItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8fafc;
  }
`;

const ResultIcon = styled.div`
  margin-right: 1rem;
  color: #3a86ff;
  font-size: 1.25rem;
`;

const ResultContent = styled.div`
  flex: 1;
`;

const ResultTitle = styled.div`
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
`;

const ResultDescription = styled.div`
  font-size: 0.875rem;
  color: #64748b;
`;

const LoadingSpinner = styled.div`
  width: 1rem;
  height: 1rem;
  border: 2px solid #e2e8f0;
  border-top-color: #3a86ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`; 