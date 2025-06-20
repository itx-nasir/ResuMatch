import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Play, AlertCircle } from 'lucide-react';
import { uploadCVs, analyzeCVs } from '../services/api';

const CVUploader = ({
  cvs,
  onCVsUploaded,
  selectedJob,
  selectedCVs,
  onCVSelectionChange,
  onAnalysisComplete,
  loading,
  setLoading
}) => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setUploadProgress(true);
    setError('');
    setSuccess('');

    try {
      const uploadedCVs = await uploadCVs(acceptedFiles);
      onCVsUploaded(uploadedCVs);
      setSuccess(`Successfully uploaded ${uploadedCVs.length} CV(s)`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload CVs');
    } finally {
      setUploadProgress(false);
    }
  }, [onCVsUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    multiple: true,
  });

  const handleCVSelection = (cvId) => {
    const newSelection = selectedCVs.includes(cvId)
      ? selectedCVs.filter(id => id !== cvId)
      : [...selectedCVs, cvId];
    onCVSelectionChange(newSelection);
  };

  const selectAllCVs = () => {
    const allCVIds = cvs.map(cv => cv.id);
    onCVSelectionChange(allCVIds);
  };

  const clearSelection = () => {
    onCVSelectionChange([]);
  };

  const handleAnalyze = async () => {
    if (!selectedJob) {
      setError('Please select a job description first');
      return;
    }

    if (selectedCVs.length === 0) {
      setError('Please select at least one CV to analyze');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const results = await analyzeCVs(selectedJob.id, selectedCVs);
      onAnalysisComplete(results);
      setSuccess(`Analysis completed for ${results.length} CV(s)`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze CVs');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getFileIcon = (fileType) => {
    return <FileText size={20} color="#6b7280" />;
  };

  return (
    <div className="card">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
          CV Upload & Analysis
        </h2>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Upload CV files and analyze them against selected job descriptions
        </p>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {/* Drag and Drop Area */}
      <div
        {...getRootProps()}
        style={{
          border: isDragActive ? '2px dashed #3b82f6' : '2px dashed #d1d5db',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          backgroundColor: isDragActive ? '#f0f9ff' : '#f9fafb',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: '24px',
        }}
      >
        <input {...getInputProps()} />
        <Upload size={48} color={isDragActive ? '#3b82f6' : '#9ca3af'} style={{ margin: '0 auto 16px' }} />
        
        {uploadProgress ? (
          <div>
            <p style={{ color: '#3b82f6', fontWeight: '500' }}>Uploading files...</p>
          </div>
        ) : (
          <div>
            <p style={{ color: '#374151', fontWeight: '500', marginBottom: '8px' }}>
              {isDragActive ? 'Drop files here' : 'Drag & drop CV files here'}
            </p>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>
              Supports PDF, DOC, DOCX, and TXT files
            </p>
          </div>
        )}
      </div>

      {/* CV Selection and Analysis */}
      {cvs.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
              Uploaded CVs ({cvs.length})
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={selectAllCVs}
                className="button button-secondary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                Select All
              </button>
              <button
                onClick={clearSelection}
                className="button button-secondary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                Clear
              </button>
            </div>
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '24px' }}>
            {cvs.map((cv) => (
              <div
                key={cv.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  backgroundColor: selectedCVs.includes(cv.id) ? '#f0f9ff' : 'white',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedCVs.includes(cv.id)}
                  onChange={() => handleCVSelection(cv.id)}
                  style={{ marginRight: '12px' }}
                />
                
                <div style={{ marginRight: '12px' }}>
                  {getFileIcon(cv.file_type)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '500', margin: 0, fontSize: '14px' }}>
                    {cv.filename}
                  </p>
                  <p style={{ color: '#6b7280', margin: 0, fontSize: '12px' }}>
                    {cv.file_type.toUpperCase()} • {formatFileSize(cv.file_size)} • Uploaded {formatDate(cv.uploaded_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Analysis Section */}
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: '#f9fafb',
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Play size={16} />
              Analysis
            </h4>
            
            {!selectedJob ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
                <AlertCircle size={16} />
                <span style={{ fontSize: '14px' }}>Select a job description to enable analysis</span>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '14px', marginBottom: '12px' }}>
                  <strong>Selected Job:</strong> {selectedJob.title}
                </p>
                <p style={{ fontSize: '14px', marginBottom: '12px' }}>
                  <strong>Selected CVs:</strong> {selectedCVs.length} of {cvs.length}
                </p>
                
                <button
                  onClick={handleAnalyze}
                  disabled={loading || selectedCVs.length === 0}
                  className="button button-success"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Play size={16} />
                  {loading ? 'Analyzing...' : `Analyze ${selectedCVs.length} CV(s)`}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CVUploader;