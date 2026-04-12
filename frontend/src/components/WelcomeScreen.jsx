import React from 'react';
import { BarChart2, Upload, Search } from 'lucide-react';

export default function WelcomeScreen({ onAction, hasDataset }) {
  return (
    <div className="welcome-wrap">
      <div className="welcome-logo">
        <BarChart2 size={24} />
      </div>

      <h1 className="welcome-title">
        {hasDataset ? 'What would you like to know?' : 'Analyze your data with AI'}
      </h1>

      <p className="welcome-sub">
        {hasDataset
          ? 'Ask questions in plain English — charts, SQL, summaries and insights, instantly.'
          : 'Upload a CSV, ask questions in plain English, and get instant analysis with charts and insights.'}
      </p>

      <div className="welcome-actions">
        {!hasDataset && (
          <button
            className="welcome-action-btn welcome-action-primary"
            onClick={() => onAction('__upload__')}
          >
            <Upload size={15} />
            Upload dataset
          </button>
        )}
        {hasDataset && (
          <>
            <button className="welcome-action-btn welcome-action-secondary" onClick={() => onAction('Give me an overview of this dataset')}>
              <Search size={14} />
              Dataset overview
            </button>
            <button className="welcome-action-btn welcome-action-secondary" onClick={() => onAction('Show me the top trends in this data')}>
              <BarChart2 size={14} />
              Show trends
            </button>
          </>
        )}
        {!hasDataset && (
          <button className="welcome-action-btn welcome-action-secondary" onClick={() => onAction('What can you help me analyze?')}>
            <Search size={14} />
            What can you do?
          </button>
        )}
      </div>
    </div>
  );
}
