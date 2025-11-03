import React from 'react';
import '../styles/JobDetailModal.css';

function JobDetailModal({ job, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{job.title}</h2>
            <p className="modal-company">{job.company}</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Job Details Grid */}
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">📍 Platform</span>
              <span className="detail-value">{job.platform || 'Unknown'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">🏢 Company</span>
              <span className="detail-value">{job.company}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">💼 Job Title</span>
              <span className="detail-value">{job.title}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">🔗 Source</span>
              <span className="detail-value">{new URL(job.link).hostname}</span>
            </div>
          </div>

          {/* Job Description Section */}
          <div className="description-section">
            <h3>📝 Job Details</h3>
            <div className="job-description">
              <p>Job posted on: <strong>{job.platform}</strong></p>
              <p className="text-muted">Click "Visit Job" to see full details and apply</p>
            </div>
          </div>

          {/* Key Information */}
          <div className="info-section">
            <h3>ℹ️ Key Information</h3>
            <ul className="info-list">
              <li>✓ Position: {job.title}</li>
              <li>✓ Company: {job.company}</li>
              <li>✓ Platform: {job.platform}</li>
              <li>✓ Found on: {new Date().toLocaleDateString()}</li>
            </ul>
          </div>

          {/* Quick Tips */}
          <div className="tips-section">
            <h3>💡 Quick Tips</h3>
            <div className="tip-box">
              <p><strong>Before You Apply:</strong></p>
              <ul className="tips-list">
                <li>✓ Review your resume matches the job requirements</li>
                <li>✓ Research the company culture</li>
                <li>✓ Customize your cover letter</li>
                <li>✓ Check the application deadline</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Close</button>
          <a href={job.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            View Full Job →
          </a>
        </div>
      </div>
    </div>
  );
}

export default JobDetailModal;
