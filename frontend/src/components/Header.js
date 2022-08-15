import React from 'react';
import { Settings, Target } from 'lucide-react';

const Header = ({ onToggleTest, showingTest }) => {
  return (
    <header style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '16px 0',
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Target size={32} color="#3b82f6" />
            <div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1f2937',
                margin: 0,
              }}>
                ResuMatch
              </h1>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: 0,
              }}>
                AI-Powered CV Analysis & Matching System
              </p>
            </div>
          </div>
          
          <button
            onClick={onToggleTest}
            className={`button ${showingTest ? 'button-primary' : 'button-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Settings size={16} />
            {showingTest ? 'Hide Test Panel' : 'System Test'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;