import React, { useState } from 'react';
import './App.css';
import Toast from './components/Toast';
import JobModal from './components/JobModal';
import ProgressBar from './components/ProgressBar';
import StatsCard from './components/StatsCard';
import ParticleBackground from './components/ParticleBackground';
import { useResume } from './hooks/useResume';
import { useJobs } from './hooks/useJobs';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { API_URL } from './services/api';

function App() {
  // State
  const [selectedPlatforms, setSelectedPlatforms] = useState(["indeed"]);
  const [location, setLocation] = useState('');
  const [favorites, setFavorites] = useLocalStorage('favorites', []);
  const [theme, setTheme] = useLocalStorage('theme', 'dark');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [selectedJob, setSelectedJob] = useState(null);

  // Hooks
  const resume = useResume(API_URL, showToast);
  const jobs = useJobs(API_URL, showToast);

  // Apply theme
  React.useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Keyboard shortcuts
  useKeyboardShortcuts(
    resume.editableKeywords,
    location,
    jobs.filteredJobs,
    () => jobs.handleScrapeJobs(resume.editableKeywords, location, selectedPlatforms),
    (format) => jobs.handleDownload(format, jobs.filteredJobs)
  );

  // Helper functions
  function showToast(message, type = 'info') {
    setToast({ show: true, message, type });
    if (soundEnabled) playSound(type);
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  }

  const playSound = (type) => {
    const audio = new Audio(
      type === 'success'
        ? 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3'
        : 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3'
    );
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const handlePlatformToggle = (platform) => {
    console.log(`Toggling ${platform}, current:`, selectedPlatforms);
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  const removeKeyword = (keyword) => {
    resume.setEditableKeywords(resume.editableKeywords.filter(k => k !== keyword));
  };

  const addKeyword = (keyword) => {
    if (keyword && !resume.editableKeywords.includes(keyword.toLowerCase())) {
      resume.setEditableKeywords([...resume.editableKeywords, keyword.toLowerCase()]);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleFavorite = (job) => {
    const isFav = favorites.some(f => f.link === job.link);
    if (isFav) {
      setFavorites(favorites.filter(f => f.link !== job.link));
      showToast('Removed from favorites', 'info');
    } else {
      setFavorites([...favorites, job]);
      showToast('Added to favorites', 'success');
    }
  };

  // Computed values
  const uniqueCompanies = [...new Set(jobs.jobs.map(j => j.company))].sort();
  const keywordStats = resume.editableKeywords.map(kw => ({
    keyword: kw,
    count: jobs.jobs.filter(j =>
      j.title.toLowerCase().includes(kw) ||
      j.company.toLowerCase().includes(kw)
    ).length
  }));

  return (
    <div className="app-container">
      <ParticleBackground />

      <div className="glass-card">
        {/* Header */}
        <div className="header-controls">
          <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="icon-btn" onClick={() => setSoundEnabled(!soundEnabled)} title="Toggle sound">
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>

        <div className="title-section">
          <h1 className="neon-title">🌐 SMART JOB SCRAPER</h1>
          <p className="subtitle">AI-Powered Resume Analysis & Job Discovery</p>
        </div>

        {/* Upload Resume */}
        <div className="section">
          <div className="section-header">
            <span className="step-number">01</span>
            <h3>Upload Resume</h3>
          </div>

          <div className="upload-area">
            <label className="file-upload-label">
              <input
                type="file"
                accept=".pdf"
                onChange={resume.handleFileChange}
                disabled={resume.isParsing || jobs.scraping}
                className="file-input"
              />
              <div className="upload-box">
                {resume.resumeFile ? (
                  <div className="file-selected">
                    <span className="file-icon">📄</span>
                    <span className="file-name">{resume.resumeFile.name}</span>
                  </div>
                ) : (
                  <div className="upload-prompt">
                    <span className="upload-icon">📤</span>
                    <span>Click or drag PDF here</span>
                  </div>
                )}
              </div>
            </label>

            <button
              onClick={resume.handleParseResume}
              disabled={!resume.resumeFile || resume.isParsing || jobs.scraping}
              className="btn btn-primary"
            >
              {resume.isParsing ? (
                <>
                  <span className="spinner"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  <span>⚡</span> Analyze Resume
                </>
              )}
            </button>
          </div>
        </div>

        {/* Keywords */}
        {resume.editableKeywords.length > 0 && (
          <div className="keywords-container animate-in">
            <div className="keywords-header">
              <h4 className="keywords-title">🎯 Matched Keywords</h4>
              <input
                type="text"
                placeholder="Add keyword..."
                className="keyword-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addKeyword(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
            </div>
            <div className="keywords-grid">
              {resume.editableKeywords.map((keyword, idx) => (
                <span key={idx} className="keyword-tag">
                  {keyword}
                  <button className="keyword-remove" onClick={() => removeKeyword(keyword)}>×</button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Location */}
        <div className="section">
          <div className="section-header">
            <span className="step-number">02</span>
            <h3>Job Location</h3>
          </div>

          <input
            type="text"
            placeholder="🌍 Mumbai, Delhi, Bangalore..."
            value={location}
            onChange={e => setLocation(e.target.value)}
            disabled={jobs.scraping || resume.isParsing}
            className="location-input"
            list="city-suggestions"
          />
          <datalist id="city-suggestions">
            <option value="Mumbai" />
            <option value="Delhi" />
            <option value="Bangalore" />
            <option value="Hyderabad" />
            <option value="Pune" />
            <option value="Chennai" />
          </datalist>
        </div>

        {/* Platform Selection */}
        <div className="platform-selector">
          <h3>Select Platforms:</h3>
          <div className="platform-chips">
            {["indeed", "naukri", "linkedin"].map(platform => (
              <button
                key={platform}
                className={`chip ${selectedPlatforms.includes(platform) ? 'active' : ''}`}
                onClick={() => handlePlatformToggle(platform)}
              >
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Scrape Button */}
        <button
          onClick={() => jobs.handleScrapeJobs(resume.editableKeywords, location, selectedPlatforms)}
          disabled={!resume.editableKeywords.length || !location || jobs.scraping || resume.isParsing}
          className="btn btn-scrape"
        >
          {jobs.scraping ? (
            <>
              <span className="spinner"></span>
              Scraping {jobs.currentKeyword}...
            </>
          ) : (
            <>
              <span>🚀</span> Start Scraping <span className="shortcut-hint">Ctrl+S</span>
            </>
          )}
        </button>

        {/* Progress */}
        {jobs.scraping && <ProgressBar progress={jobs.progress} currentKeyword={jobs.currentKeyword} />}

        {/* Stats */}
        {jobs.showStats && jobs.jobs.length > 0 && (
          <div className="stats-grid animate-in">
            <StatsCard icon="💼" value={jobs.filteredJobs.length} label="Jobs Found" />
            <StatsCard icon="🏢" value={uniqueCompanies.length} label="Companies" />
            <StatsCard icon="🎯" value={resume.editableKeywords.length} label="Keywords" />
            <StatsCard icon="⭐" value={favorites.length} label="Favorites" />
          </div>
        )}

        {/* Filter */}
        {jobs.jobs.length > 0 && (
          <div className="filter-section animate-in">
            <input
              type="text"
              placeholder="🔍 Search jobs..."
              value={jobs.searchQuery}
              onChange={e => jobs.setSearchQuery(e.target.value)}
              className="search-input"
            />
            <select
              value={jobs.filterCompany}
              onChange={e => jobs.setFilterCompany(e.target.value)}
              className="filter-select"
            >
              <option value="">All Companies</option>
              {uniqueCompanies.map((company, idx) => (
                <option key={idx} value={company}>{company}</option>
              ))}
            </select>
            <select
              value={jobs.sortBy}
              onChange={e => jobs.setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="company">Sort by Company</option>
              <option value="title">Sort by Title</option>
            </select>
          </div>
        )}

        {/* Jobs List */}
        {jobs.filteredJobs.length > 0 && (
          <div className="jobs-container animate-in">
            <div className="jobs-header">
              <h3>💼 Jobs Found ({jobs.filteredJobs.length})</h3>
              <div className="download-buttons">
                <button onClick={() => jobs.handleDownload('txt', jobs.filteredJobs)} className="btn btn-download" title="Ctrl+D">
                  TXT
                </button>
                <button onClick={() => jobs.handleDownload('csv', jobs.filteredJobs)} className="btn btn-download">
                  CSV
                </button>
                <button onClick={() => jobs.handleDownload('json', jobs.filteredJobs)} className="btn btn-download">
                  JSON
                </button>
              </div>
            </div>

            <div className="jobs-list">
              {jobs.filteredJobs.map((job, i) => (
                <div key={i} className="job-card">
                  <div className="job-number">{i + 1}</div>
                  <div className="job-details" onClick={() => setSelectedJob(job)}>
                    <h4 className="job-title">{job.title}</h4>
                    <p className="job-company">🏢 {job.company}</p>
                  </div>
                  <div className="job-actions">
                    <button
                      className={`icon-btn-small ${favorites.some(f => f.link === job.link) ? 'active' : ''}`}
                      onClick={() => toggleFavorite(job)}
                    >
                      {favorites.some(f => f.link === job.link) ? '⭐' : '☆'}
                    </button>
                    <a href={job.link} target="_blank" rel="noopener noreferrer" className="job-arrow">
                      →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAB */}
        {jobs.jobs.length > 0 && (
          <div className="fab-container">
            <button className="fab" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              ↑
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast.show && <Toast message={toast.message} type={toast.type} />}

      {/* Modal */}
      {selectedJob && <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </div>
  );
}

export default App;
