import React, { useState } from 'react';
import { 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Award,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from 'lucide-react';

const AnalysisResults = ({ results }) => {
  const [expandedResults, setExpandedResults] = useState(new Set());

  const toggleExpanded = (resultId) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(resultId)) {
      newExpanded.delete(resultId);
    } else {
      newExpanded.add(resultId);
    }
    setExpandedResults(newExpanded);
  };

  const getScoreColor = (score, hasError) => {
    if (hasError) return 'score-error';
    if (score >= 70) return 'score-high';
    if (score >= 50) return 'score-medium';
    return 'score-low';
  };

  const getScoreGrade = (score, hasError) => {
    if (hasError) return 'Error';
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 50) return 'Poor';
    return 'Very Poor';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!results || results.length === 0) {
    return null;
  }

  // Sort results by score (highest first) and errors last
  const sortedResults = [...results].sort((a, b) => {
    if (a.error && !b.error) return 1;
    if (!a.error && b.error) return -1;
    return b.overall_score - a.overall_score;
  });

  // Count successful and failed analyses
  const successfulAnalyses = results.filter(r => !r.error).length;
  const failedAnalyses = results.filter(r => r.error).length;

  return (
    <div className="card">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={20} />
          Analysis Results
        </h2>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          AI-powered CV analysis with match scores and detailed insights
        </p>
      </div>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
            {sortedResults.length}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>CVs Analyzed</div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
            {successfulAnalyses}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>Successful</div>
        </div>
        
        {failedAnalyses > 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>
              {failedAnalyses}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Failed</div>
          </div>
        )}
        
        {successfulAnalyses > 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
              {Math.round(results.filter(r => !r.error).reduce((sum, r) => sum + r.overall_score, 0) / successfulAnalyses)}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Avg Score</div>
          </div>
        )}
      </div>

      {/* Results List */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {sortedResults.map((result, index) => (
          <div
            key={result.id || result.cv_id}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: 'white',
            }}
          >
            {/* Result Header */}
            <div
              style={{
                padding: '16px',
                backgroundColor: result.error ? '#fef2f2' : index === 0 ? '#f0f9ff' : 'white',
                borderBottom: '1px solid #e5e7eb',
                cursor: 'pointer',
              }}
              onClick={() => toggleExpanded(result.id || result.cv_id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  {result.error ? (
                    <AlertTriangle size={20} color="#ef4444" />
                  ) : index === 0 ? (
                    <Award size={20} color="#f59e0b" />
                  ) : null}
                  <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
                    {result.cv_filename}
                  </h3>
                  <span className={`${getScoreColor(result.overall_score, result.error)}`} style={{ fontSize: '18px', fontWeight: '700' }}>
                    {result.error ? 'Error' : `${Math.round(result.overall_score)}%`}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className={`tag ${result.error ? 'tag-error' : getScoreColor(result.overall_score) === 'score-high' ? 'tag-success' : getScoreColor(result.overall_score) === 'score-medium' ? 'tag-warning' : 'tag-primary'}`}>
                    {getScoreGrade(result.overall_score, result.error)}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    Analyzed {formatDate(result.created_at)}
                  </span>
                </div>
                
                <p style={{ 
                  color: result.error ? '#ef4444' : '#6b7280', 
                  margin: 0, 
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  {result.summary}
                </p>
              </div>
              
              <div style={{ marginLeft: '16px' }}>
                {expandedResults.has(result.id || result.cv_id) ? (
                  <ChevronUp size={20} color="#6b7280" />
                ) : (
                  <ChevronDown size={20} color="#6b7280" />
                )}
              </div>
            </div>

            {/* Expanded Details */}
            {expandedResults.has(result.id || result.cv_id) && !result.error && (
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {/* Matching Skills */}
                  {result.matching_skills && result.matching_skills.length > 0 && (
                    <div>
                      <h4 style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <CheckCircle size={16} color="#10b981" />
                        Matching Skills ({result.matching_skills.length})
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {result.matching_skills.map((skill, index) => (
                          <span key={index} className="tag tag-success">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Skills */}
                  {result.missing_skills && result.missing_skills.length > 0 && (
                    <div>
                      <h4 style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <XCircle size={16} color="#ef4444" />
                        Missing Skills ({result.missing_skills.length})
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {result.missing_skills.map((skill, index) => (
                          <span key={index} className="tag tag-warning">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detailed Analysis */}
                  <div>
                    <h4 style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <FileText size={16} color="#6b7280" />
                      Detailed Analysis
                    </h4>
                    <div style={{
                      backgroundColor: '#f9fafb',
                      padding: '12px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      color: '#374151'
                    }}>
                      {result.detailed_analysis}
                    </div>
                  </div>

                  {/* Skills Progress Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>Skills Match</span>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        {result.matching_skills?.length || 0} of {(result.matching_skills?.length || 0) + (result.missing_skills?.length || 0)}
                      </span>
                    </div>
                    <div style={{
                      height: '8px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div
                        style={{
                          height: '100%',
                          backgroundColor: result.overall_score >= 70 ? '#10b981' : result.overall_score >= 50 ? '#f59e0b' : '#ef4444',
                          width: `${Math.min(100, (result.matching_skills?.length || 0) / Math.max(1, (result.matching_skills?.length || 0) + (result.missing_skills?.length || 0)) * 100)}%`,
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisResults;