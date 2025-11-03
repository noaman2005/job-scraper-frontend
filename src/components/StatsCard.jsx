import React from 'react';
import '../styles/StatsCard.css';

function StatsCard({ icon, value, label }) {
  return (
    <div className="stats-card">
      <div className="stats-icon">{icon}</div>
      <div className="stats-content">
        <div className="stats-value">{value}</div>
        <div className="stats-label">{label}</div>
      </div>
    </div>
  );
}

export default StatsCard;
