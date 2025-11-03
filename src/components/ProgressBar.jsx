import React from 'react';
import '../styles/ProgressBar.css';

function ProgressBar({ progress, currentKeyword }) {
  return (
    <div className="progress-container">
      <div className="progress-info">
        <span className="progress-label">Scraping: <strong>{currentKeyword}</strong></span>
        <span className="progress-percent">{Math.round(progress)}%</span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}

export default ProgressBar;
