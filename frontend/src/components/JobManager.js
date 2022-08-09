import React, { useState } from 'react';
import { Plus, Upload, Briefcase, Calendar, CheckCircle } from 'lucide-react';
import { createJob, uploadJobJSON } from '../services/api';

const JobManager = ({ jobs, onJobCreated, onJobSelected, selectedJob }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: [''],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRequirementChange = (index, value) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData({ ...formData, requirements: newRequirements });
  };

  const addRequirement = () => {
    setFormData({
      ...formData,
      requirements: [...formData.requirements, ''],
    });
  };

  const removeRequirement = (index) => {
    const newRequirements = formData.requirements.filter((_, i) => i !== index);
    setFormData({ ...formData, requirements: newRequirements });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const filteredRequirements = formData.requirements.filter(req => req.trim() !== '');
      const jobData = {
        ...formData,
        requirements: filteredRequirements,
      };

      const newJob = await createJob(jobData);
      onJobCreated(newJob);
      setFormData({ title: '', description: '', requirements: [''] });
      setShowForm(false);
      setSuccess('Job description created successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create job description');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const newJob = await uploadJobJSON(file);
      onJobCreated(newJob);
      setSuccess('Job description uploaded successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload job description');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="card">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
          Job Descriptions
        </h2>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Create and manage job descriptions for CV analysis
        </p>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setShowForm(!showForm)}
          className="button button-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} />
          Create Job
        </button>
        
        <label className="button button-secondary" style={{ cursor: 'pointer' }}>
          <Upload size={16} style={{ marginRight: '8px' }} />
          Upload JSON
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          <div className="form-group">
            <label className="form-label">Job Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Job Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-textarea"
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Requirements</label>
            {formData.requirements.map((requirement, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={requirement}
                  onChange={(e) => handleRequirementChange(index, e.target.value)}
                  className="form-input"
                  placeholder="Enter requirement..."
                />
                {formData.requirements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="button button-danger"
                    style={{ padding: '8px', minWidth: 'auto' }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addRequirement}
              className="button button-secondary"
              style={{ marginTop: '8px' }}
            >
              Add Requirement
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={loading}
              className="button button-primary"
            >
              {loading ? 'Creating...' : 'Create Job'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="button button-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            <Briefcase size={48} style={{ margin: '0 auto 16px' }} />
            <p>No job descriptions yet. Create one to get started!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => onJobSelected(job)}
                style={{
                  border: selectedJob?.id === job.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: selectedJob?.id === job.id ? '#f0f9ff' : 'white',
                }}
                onMouseEnter={(e) => {
                  if (selectedJob?.id !== job.id) {
                    e.target.style.borderColor = '#d1d5db';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedJob?.id !== job.id) {
                    e.target.style.borderColor = '#e5e7eb';
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
                    {job.title}
                  </h3>
                  {selectedJob?.id === job.id && (
                    <CheckCircle size={20} color="#3b82f6" />
                  )}
                </div>
                
                <p style={{
                  color: '#6b7280',
                  fontSize: '14px',
                  margin: '0 0 12px 0',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {job.description}
                </p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                  {job.requirements.slice(0, 3).map((req, index) => (
                    <span key={index} className="tag tag-primary">
                      {req}
                    </span>
                  ))}
                  {job.requirements.length > 3 && (
                    <span className="tag tag-primary">
                      +{job.requirements.length - 3} more
                    </span>
                  )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#9ca3af' }}>
                  <Calendar size={12} />
                  Created {formatDate(job.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobManager;