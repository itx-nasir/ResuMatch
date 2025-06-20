import React, { useState, useEffect } from 'react';
import JobManager from './components/JobManager';
import CVUploader from './components/CVUploader';
import AnalysisResults from './components/AnalysisResults';
import Header from './components/Header';
import TestPanel from './components/TestPanel';
import { fetchJobs, fetchCVs } from './services/api';

function App() {
  const [jobs, setJobs] = useState([]);
  const [cvs, setCVs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedCVs, setSelectedCVs] = useState([]);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [error, setError] = useState('');

  // Load initial data
  useEffect(() => {
    loadJobs();
    loadCVs();
  }, []);

  const loadJobs = async () => {
    setError('');
    try {
      const data = await fetchJobs();
      setJobs(data);
    } catch (error) {
      setError('Failed to load job descriptions');
      // console.error('Failed to load jobs:', error);
    }
  };

  const loadCVs = async () => {
    setError('');
    try {
      const cvsData = await fetchCVs();
      setCVs(cvsData);
    } catch (error) {
      setError('Failed to load CV files');
      // console.error('Failed to load CVs:', error);
    }
  };

  const handleJobCreated = (newJob) => {
    setJobs([...jobs, newJob]);
  };

  const handleCVsUploaded = (newCVs) => {
    setCVs([...cvs, ...newCVs]);
  };

  const handleJobSelected = (job) => {
    setSelectedJob(job);
    setAnalysisResults([]);
  };

  const handleCVSelectionChange = (cvIds) => {
    setSelectedCVs(cvIds);
  };

  const handleAnalysisComplete = (results) => {
    setAnalysisResults(results);
  };

  return (
    <div className="App">
      <Header 
        onToggleTest={() => setShowTestPanel(!showTestPanel)}
        showingTest={showTestPanel}
      />
      
      {showTestPanel && (
        <TestPanel onClose={() => setShowTestPanel(false)} />
      )}
      
      <div className="container" style={{ marginTop: '20px' }}>
        {error && <div className="error">{error}</div>}
        
        <div className="two-column-layout">
          {/* Left Column - Job Management */}
          <div>
            <JobManager
              jobs={jobs}
              onJobCreated={handleJobCreated}
              onJobSelected={handleJobSelected}
              selectedJob={selectedJob}
            />
          </div>

          {/* Right Column - CV Upload and Analysis */}
          <div>
            <CVUploader
              cvs={cvs}
              onCVsUploaded={handleCVsUploaded}
              selectedJob={selectedJob}
              selectedCVs={selectedCVs}
              onCVSelectionChange={handleCVSelectionChange}
              onAnalysisComplete={handleAnalysisComplete}
              loading={loading}
              setLoading={setLoading}
            />
            
            {analysisResults.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <AnalysisResults results={analysisResults} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;