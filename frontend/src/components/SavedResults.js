import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Eye, 
  Calendar, 
  TrendingUp, 
  Briefcase, 
  FileText,
  Bot,
  Server,
  RotateCcw
} from 'lucide-react';
import { fetchJobs, getAllAnalyses } from '../services/api';

const SavedResults = ({ onClose }) => {
  const [jobs, setJobs] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJobId, setSelectedJobId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [jobsData, analysesData] = await Promise.all([
        fetchJobs(),
        getAllAnalyses()
      ]);
      
      setJobs(jobsData);
      setAnalyses(analysesData);
    } catch (err) {
      setError('Failed to load saved data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getJobAnalyses = (jobId) => {
    return analyses.filter(analysis => analysis.job_id === jobId);
  };

  const getAnalysisStats = () => {
    const totalAnalyses = analyses.length;
    const aiGenerated = analyses.filter(a => a.is_ai_generated).length;
    const mockGenerated = totalAnalyses - aiGenerated;
    const avgScore = totalAnalyses > 0 
      ? Math.round(analyses.reduce((sum, a) => sum + a.overall_score, 0) / totalAnalyses)
      : 0;

    return { totalAnalyses, aiGenerated, mockGenerated, avgScore };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'score-high';
    if (score >= 50) return 'score-medium';
    return 'score-low';
  };

  const getAISourceIcon = (isAiGenerated) => {
    return isAiGenerated ? <Bot size={16} color="#3b82f6" /> : <Server size={16} color="#6b7280" />;
  };

  const stats = getAnalysisStats();

  if (loading) {
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
        <div className="loading">Loading saved data...</div>
      </div>
    );
  }

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
        maxWidth: '1200px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Database size={24} color="#3b82f6" />
            <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
              Saved Jobs & Analysis Results
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={loadData}
              className="button button-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <RotateCcw size={16} />
              Refresh
            </button>
            <button
              onClick={onClose}
              className="button button-secondary"
            >
              Close
            </button>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        {/* Statistics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
              {jobs.length}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Saved Jobs</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
              {stats.totalAnalyses}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Analyses</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6' }}>
              {stats.avgScore}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Avg Score</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
              {stats.aiGenerated}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>AI Generated</div>
          </div>
        </div>

        {/* Jobs and Results */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Jobs List */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={16} />
              Saved Jobs ({jobs.length})
            </h3>
            
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {jobs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  <Briefcase size={48} style={{ margin: '0 auto 16px' }} />
                  <p>No saved jobs found</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {jobs.map((job) => {
                    const jobAnalyses = getJobAnalyses(job.id);
                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJobId(selectedJobId === job.id ? null : job.id)}
                        style={{
                          border: selectedJobId === job.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '16px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          backgroundColor: selectedJobId === job.id ? '#f0f9ff' : 'white',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>
                            {job.title}
                          </h4>
                          {selectedJobId === job.id && (
                            <Eye size={16} color="#3b82f6" />
                          )}
                        </div>
                        
                        <p style={{
                          color: '#6b7280',
                          fontSize: '12px',
                          margin: '0 0 8px 0',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {job.description}
                        </p>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '500' }}>
                            {jobAnalyses.length} analyses
                          </span>
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                            {formatDate(job.created_at)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Analysis Results */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} />
              Analysis Results {selectedJobId && `(${getJobAnalyses(selectedJobId).length})`}
            </h3>
            
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {selectedJobId ? (
                getJobAnalyses(selectedJobId).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    <FileText size={48} style={{ margin: '0 auto 16px' }} />
                    <p>No analyses for this job yet</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {getJobAnalyses(selectedJobId)
                      .sort((a, b) => b.overall_score - a.overall_score)
                      .map((analysis) => (
                        <div
                          key={analysis.id}
                          style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '16px',
                            backgroundColor: 'white',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>
                              {analysis.cv_filename}
                            </h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {getAISourceIcon(analysis.is_ai_generated)}
                              <span className={`${getScoreColor(analysis.overall_score)}`} style={{ fontSize: '16px', fontWeight: '700' }}>
                                {Math.round(analysis.overall_score)}%
                              </span>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span className={`tag ${analysis.is_ai_generated ? 'tag-primary' : 'tag-warning'}`}>
                              {analysis.ai_source}
                            </span>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                              {formatDate(analysis.created_at)}
                            </span>
                          </div>
                          
                          <p style={{ 
                            color: '#6b7280', 
                            margin: 0, 
                            fontSize: '12px',
                            lineHeight: '1.4'
                          }}>
                            {analysis.summary}
                          </p>
                          
                          <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                            <span style={{ fontSize: '10px', color: '#10b981' }}>
                              ✓ {analysis.matching_skills?.length || 0} matching
                            </span>
                            <span style={{ fontSize: '10px', color: '#ef4444' }}>
                              ✗ {analysis.missing_skills?.length || 0} missing
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  <Eye size={48} style={{ margin: '0 auto 16px' }} />
                  <p>Select a job to view its analysis results</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedResults; 