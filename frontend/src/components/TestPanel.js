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
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
            System Test Panel
          </h2>
          <button
            onClick={onClose}
            className="button button-secondary"
            style={{ padding: '8px', minWidth: 'auto' }}
          >
            <X size={16} />
          </button>
        </div>

        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          Run comprehensive system tests to verify database connectivity, API functionality, 
          and AI analysis capabilities.
        </p>

        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={handleRunTest}
            disabled={testing}
            className="button button-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {testing ? (
              <>
                <Loader size={16} />
                Running Tests...
              </>
            ) : (
              <>
                <Play size={16} />
                Run System Test
              </>
            )}
          </button>
        </div>

        {testResults && (
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px',
              backgroundColor: testResults.status === 'success' ? '#f0fdf4' : '#fef2f2',
              borderBottom: '1px solid #e5e7eb',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                {getStatusIcon(testResults.status)}
                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
                  Overall Status: {testResults.status.toUpperCase()}
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: '#374151' }}>
                {testResults.message}
              </p>
            </div>

            <div style={{ padding: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>
                Test Details
              </h4>

              <div style={{ display: 'grid', gap: '12px' }}>
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestPanel;