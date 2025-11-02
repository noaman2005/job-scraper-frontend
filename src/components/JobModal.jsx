import React from 'react';
import './JobModal.css';

function JobModal({ job, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>{job.title}</h2>
          <p className="modal-company">🏢 {job.company}</p>
        </div>

        <div className="modal-body">
          <div className="modal-info">
            <span className="info-label">Job Link:</span>
            <a href={job.link} target="_blank" rel="noopener noreferrer" className="job-link-full">
              {job.link}
            </a>
          </div>

          <div className="modal-actions">
            <a 
              href={job.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-apply"
            >
              🚀 Apply Now
            </a>
            <button onClick={onClose} className="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobModal;
