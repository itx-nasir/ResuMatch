import React, { useState } from 'react';
import { Play, X, CheckCircle, XCircle, AlertTriangle, Loader } from 'lucide-react';
import { runSystemTest } from '../services/api';

const TestPanel = ({ onClose }) => {
  const [testResults, setTestResults] = useState(null);
  const [testing, setTesting] = useState(false);

  const handleRunTest = async () => {
    setTesting(true);
    setTestResults(null);

    try {
      const results = await runSystemTest();
      setTestResults(results);
    } catch (error) {
      setTestResults({
        status: 'error',
        message: error.response?.data?.detail || 'Failed to run system test',
        database_test: { status: 'error', message: 'Connection failed' },
        sample_job_created: { status: 'error' },
        sample_cv_created: { status: 'error' },
        analysis_test: { status: 'error' }
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} color="#10b981" />;
      case 'error':
        return <XCircle size={16} color="#ef4444" />;
      case 'warning':
        return <AlertTriangle size={16} color="#f59e0b" />;
      default:
        return <AlertTriangle size={16} color="#f59e0b" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      default:
        return '#f59e0b';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '95%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>System Test</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
              Test all system components and configurations
            </p>
          </div>
          <button onClick={onClose} className="button button-secondary">
            <X size={20} />
          </button>
        </div>

        <button
          onClick={handleRunTest}
          disabled={testing}
          className="button button-primary"
          style={{ width: '100%', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {testing ? <Loader size={16} className="spin" /> : <Play size={16} />}
          {testing ? 'Running Tests...' : 'Run System Test'}
        </button>

        {testResults && (
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getStatusIcon(testResults.database_test?.status)}
                  <span style={{ fontWeight: '500' }}>Database Connection</span>
                </div>
                <span style={{ 
                  fontSize: '12px', 
                  color: getStatusColor(testResults.database_test?.status),
                  fontWeight: '500'
                }}>
                  {testResults.database_test?.status?.toUpperCase()}
                </span>
              </div>
              {testResults.database_test?.message && (
                <p style={{ 
                  fontSize: '12px', 
                  color: '#6b7280', 
                  margin: '8px 0 0 0',
                  paddingLeft: '12px'
                }}>
                  {testResults.database_test.message}
                </p>
              )}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {getStatusIcon(testResults.sample_job_created?.status)}
                <span style={{ fontWeight: '500' }}>Sample Job Creation</span>
              </div>
              <span style={{ 
                fontSize: '12px', 
                color: getStatusColor(testResults.sample_job_created?.status),
                fontWeight: '500'
              }}>
                {testResults.sample_job_created?.status?.toUpperCase()}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {getStatusIcon(testResults.sample_cv_created?.status)}
                <span style={{ fontWeight: '500' }}>Sample CV Creation</span>
              </div>
              <span style={{ 
                fontSize: '12px', 
                color: getStatusColor(testResults.sample_cv_created?.status),
                fontWeight: '500'
              }}>
                {testResults.sample_cv_created?.status?.toUpperCase()}
              </span>
            </div>

            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getStatusIcon(testResults.analysis_test?.status)}
                  <span style={{ fontWeight: '500' }}>AI Analysis Engine</span>
                </div>
                <span style={{ 
                  fontSize: '12px', 
                  color: getStatusColor(testResults.analysis_test?.status),
                  fontWeight: '500'
                }}>
                  {testResults.analysis_test?.status?.toUpperCase()}
                </span>
              </div>
              {testResults.analysis_test?.ai_configured === false && (
                <p style={{ 
                  fontSize: '12px', 
                  color: '#f59e0b', 
                  margin: '8px 0 0 0',
                  paddingLeft: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <AlertTriangle size={12} />
                  Gemini API key not configured. Please add your API key to enable AI analysis.
                </p>
              )}
            </div>

            <div style={{
              marginTop: '8px',
              padding: '16px',
              backgroundColor: testResults.status === 'success' ? '#ecfdf5' : '#fef2f2',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {testResults.status === 'success' ? (
                <CheckCircle size={20} color="#10b981" />
              ) : (
                <XCircle size={20} color="#ef4444" />
              )}
              <p style={{ 
                margin: 0,
                color: testResults.status === 'success' ? '#10b981' : '#ef4444',
                fontWeight: '500'
              }}>
                {testResults.message}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestPanel;