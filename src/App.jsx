import React, { useState, useEffect } from 'react';
import './App.css';
import Toast from './components/Toast';
import JobDetailModal from './components/JobDetailModal';
import ParticleBackground from './components/ParticleBackground';
import { useResume } from './hooks/useResume';
import { useJobs } from './hooks/useJobs';
import { useKeywords } from './hooks/useKeywords';
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
  const [currentStep, setCurrentStep] = useState(1);
  const [platformFilter, setPlatformFilter] = useState('');

  // Hooks
  const resume = useResume(API_URL, showToast);
  const jobs = useJobs(API_URL, showToast);
  const keywordsManager = useKeywords();

  // Apply theme
  React.useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Update current step based on data
  React.useEffect(() => {
    if (resume.editableKeywords.length > 0 || keywordsManager.customKeywords.length > 0) {
      setCurrentStep(2);
    }
    if (selectedPlatforms.length > 0) {
      setCurrentStep(3);
    }
    if (location) {
      setCurrentStep(4);
    }
    if (jobs.scraping) {
      setCurrentStep(5);
    }
    if (jobs.jobs.length > 0) {
      setCurrentStep(6);
    }
  }, [resume.editableKeywords, keywordsManager.customKeywords, selectedPlatforms, location, jobs.scraping, jobs.jobs]);

  // Keyboard shortcuts
  useKeyboardShortcuts(
    [...resume.editableKeywords, ...keywordsManager.customKeywords],
    location,
    jobs.filteredJobs,
    () => handleScrape(),
    (format) => jobs.handleDownload(format, jobs.filteredJobs)
  );

  // Helpers
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

  const handleScrape = () => {
    const allKeywords = [
      ...new Set([
        ...resume.editableKeywords,
        ...keywordsManager.customKeywords
      ])
    ];

    if (allKeywords.length === 0) {
      showToast('Add resume or custom keywords first', 'error');
      return;
    }

    if (!location) {
      showToast('Please enter location', 'error');
      return;
    }

    if (selectedPlatforms.length === 0) {
      showToast('Select at least one platform', 'error');
      return;
    }

    setCurrentStep(5);
    jobs.handleScrapeJobs(allKeywords, location, selectedPlatforms);
  };

  // Computed values
  const uniqueCompanies = [...new Set(jobs.jobs.map(j => j.company))].sort();
  let filteredJobsForDisplay = [...jobs.filteredJobs];

  // Apply platform filter
  if (platformFilter) {
    filteredJobsForDisplay = filteredJobsForDisplay.filter(
      job => job.platform === platformFilter
    );
  }

  return (
    <div className="app-container">
      <ParticleBackground />

      <div className="main-wrapper">
        {/* Header */}
        <div className="header">
          <div className="header-left">
            <h1>🌐 Smart Job Scraper</h1>
            <p>AI-powered resume analysis & job discovery</p>
          </div>
          <div className="header-controls">
            <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button className="icon-btn" onClick={() => setSoundEnabled(!soundEnabled)} title="Toggle sound">
              {soundEnabled ? '🔊' : '🔇'}
            </button>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="stepper">
          {[
            { num: 1, label: 'Resume' },
            { num: 2, label: 'Keywords' },
            { num: 3, label: 'Platforms' },
            { num: 4, label: 'Location' },
            { num: 5, label: 'Scrape' },
            { num: 6, label: 'Results' }
          ].map(step => (
            <div key={step.num} className={`step ${currentStep >= step.num ? 'active' : ''} ${currentStep > step.num ? 'completed' : ''}`}>
              <div className="step-circle">{currentStep > step.num ? '✓' : step.num}</div>
              <div className="step-label">{step.label}</div>
            </div>
          ))}
        </div>

        {/* Step 1: Upload Resume */}
        <div className="card-section">
          <div className="card-title" data-icon="📄">Upload Your Resume (Optional)</div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Upload a PDF resume to auto-extract skills, or add keywords manually below
          </p>
          <div className="upload-container">
            <label className="upload-box" style={{ flex: 1 }}>
              <input
                type="file"
                accept=".pdf"
                onChange={resume.handleFileChange}
                disabled={resume.isParsing || jobs.scraping}
                className="file-input"
              />
              {resume.resumeFile ? (
                <div className="file-selected">
                  <span className="file-icon">✓</span>
                  <span className="file-name">{resume.resumeFile.name}</span>
                </div>
              ) : (
                <>
                  <span className="upload-icon">📤</span>
                  <span className="upload-text">Click to upload or drag & drop your PDF here</span>
                </>
              )}
            </label>
            {resume.resumeFile && (
              <button
                onClick={resume.handleParseResume}
                disabled={!resume.resumeFile || resume.isParsing || jobs.scraping}
                className="btn btn-primary"
                style={{ alignSelf: 'center', whiteSpace: 'nowrap' }}
              >
                {resume.isParsing ? (
                  <>
                    <span className="spinner"></span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    ⚡ Analyze Resume
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Step 2A: Resume Keywords */}
        {resume.editableKeywords.length > 0 && (
          <div className="card-section">
            <div className="card-title" data-icon="📋">Resume Keywords ({resume.editableKeywords.length})</div>
            <div className="keyword-cloud">
              {resume.editableKeywords.map((keyword, idx) => (
                <span key={idx} className="keyword-tag">
                  {keyword}
                  <button onClick={() => removeKeyword(keyword)}>×</button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Step 2B: Custom Keywords */}
        <div className="card-section">
          <div className="card-title" data-icon="✨">Add Custom Keywords</div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Don't have a resume? Add keywords manually to get started!
          </p>
          <div className="keyword-input-container">
            <input
              type="text"
              placeholder="Enter keyword (e.g., React, Django, AWS)..."
              className="keyword-input"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  if (keywordsManager.addCustomKeyword(e.target.value)) {
                    showToast(`✅ Added "${e.target.value}"`, 'success');
                    e.target.value = '';
                  } else {
                    showToast('Keyword already added', 'error');
                    e.target.value = '';
                  }
                }
              }}
            />
          </div>

          {keywordsManager.customKeywords.length > 0 && (
            <>
              <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem', fontSize: '0.95rem', color: 'var(--text)' }}>
                Your Custom Keywords
              </h4>
              <div className="keyword-cloud">
                {keywordsManager.customKeywords.map((keyword, idx) => (
                  <span key={idx} className="keyword-tag">
                    {keyword}
                    <button onClick={() => keywordsManager.removeCustomKeyword(keyword)}>×</button>
                  </span>
                ))}
              </div>
              <button
                onClick={() => {
                  keywordsManager.clearCustomKeywords();
                  showToast('Cleared all custom keywords', 'info');
                }}
                className="btn btn-secondary"
                style={{ marginTop: '1rem', fontSize: '0.85rem', padding: '0.6rem 1rem' }}
              >
                Clear All Custom Keywords
              </button>
            </>
          )}
        </div>

        {/* All Keywords Summary */}
        {(resume.editableKeywords.length > 0 || keywordsManager.customKeywords.length > 0) && (
          <div className="card-section" style={{ background: 'rgba(102, 126, 234, 0.1)', borderColor: 'rgba(102, 126, 234, 0.3)' }}>
            <div className="card-title" data-icon="🎯">
              Total Keywords: {resume.editableKeywords.length + keywordsManager.customKeywords.length}
            </div>
            <div className="keyword-cloud">
              {[...resume.editableKeywords, ...keywordsManager.customKeywords].map((keyword, idx) => (
                <span key={idx} className="keyword-tag" style={{ background: 'rgba(102, 126, 234, 0.2)', borderColor: 'rgba(102, 126, 234, 0.5)' }}>
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Platforms */}
        <div className="card-section">
          <div className="card-title" data-icon="🌍">Select Job Platforms</div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Select one or more platforms to scrape jobs simultaneously
          </p>
          <div className="platform-grid">
            {[
              { name: 'indeed', icon: '💼', label: 'Indeed' },
              { name: 'naukri', icon: '🇮🇳', label: 'Naukri' },
              { name: 'linkedin', icon: '🔗', label: 'LinkedIn' }
            ].map(platform => (
              <button
                key={platform.name}
                className={`platform-btn ${selectedPlatforms.includes(platform.name) ? 'active' : ''}`}
                onClick={() => handlePlatformToggle(platform.name)}
              >
                <span className="platform-icon">{platform.icon}</span>
                {platform.label}
              </button>
            ))}
          </div>
          {selectedPlatforms.length > 0 && (
            <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--success)' }}>
              ✓ {selectedPlatforms.length} platform(s) selected: {selectedPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}
            </p>
          )}
        </div>

        {/* Step 4: Location */}
        <div className="card-section">
          <div className="card-title" data-icon="📍">Job Location</div>
          <div className="location-input-wrapper">
            <input
              type="text"
              placeholder="Enter city (e.g., Mumbai, Delhi, Bangalore)"
              value={location}
              onChange={e => setLocation(e.target.value)}
              disabled={jobs.scraping || resume.isParsing}
              className="location-input"
              list="cities"
            />
            <datalist id="cities">
              <option value="Mumbai" />
              <option value="Delhi" />
              <option value="Bangalore" />
              <option value="Hyderabad" />
              <option value="Pune" />
              <option value="Chennai" />
              <option value="Kolkata" />
              <option value="Ahmedabad" />
              <option value="Remote" />
            </datalist>
          </div>
        </div>

        {/* Step 5: Scrape Button */}
        {(resume.editableKeywords.length > 0 || keywordsManager.customKeywords.length > 0) && location && selectedPlatforms.length > 0 && (
          <button
            onClick={handleScrape}
            disabled={jobs.scraping}
            className="btn btn-primary"
            style={{ width: '100%', padding: '1rem', fontSize: '1rem', marginBottom: '2rem' }}
          >
            {jobs.scraping ? (
              <>
                <span className="spinner"></span>
                Scraping {jobs.currentKeyword || 'jobs'}...
              </>
            ) : (
              <>
                🚀 Start Scraping (Ctrl+S)
              </>
            )}
          </button>
        )}

        {/* Progress Bar */}
        {jobs.scraping && (
          <div className="progress-container">
            <div className="progress-info">
              <span>Scraping progress</span>
              <span>{Math.round(jobs.progress)}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${jobs.progress}%` }}></div>
            </div>
          </div>
        )}

        {/* Stats */}
        {jobs.showStats && jobs.jobs.length > 0 && (
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-icon">💼</span>
              <div className="stat-value">{filteredJobsForDisplay.length}</div>
              <div className="stat-label">Jobs Found</div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🏢</span>
              <div className="stat-value">{uniqueCompanies.length}</div>
              <div className="stat-label">Companies</div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🎯</span>
              <div className="stat-value">{resume.editableKeywords.length + keywordsManager.customKeywords.length}</div>
              <div className="stat-label">Keywords</div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">⭐</span>
              <div className="stat-value">{favorites.length}</div>
              <div className="stat-label">Favorites</div>
            </div>
          </div>
        )}

        {/* Step 6: Results */}
        {jobs.jobs.length > 0 && (
          <>
            <div className="jobs-container">
              <div className="jobs-header">
                <h3>💼 Job Results ({filteredJobsForDisplay.length})</h3>
                <div className="download-buttons">
                  <button onClick={() => jobs.handleDownload('txt', filteredJobsForDisplay)} className="btn btn-download" title="Download as text">
                    📄 TXT
                  </button>
                  <button onClick={() => jobs.handleDownload('csv', filteredJobsForDisplay)} className="btn btn-download" title="Download as CSV">
                    📊 CSV
                  </button>
                  <button onClick={() => jobs.handleDownload('json', filteredJobsForDisplay)} className="btn btn-download" title="Download as JSON">
                    📋 JSON
                  </button>
                </div>
              </div>

              {/* Filter */}
              {jobs.jobs.length > 0 && (
                <div className="filter-bar">
                  <input
                    type="text"
                    placeholder="🔍 Search jobs..."
                    value={jobs.searchQuery}
                    onChange={e => jobs.setSearchQuery(e.target.value)}
                    className="filter-input"
                  />
                  <select
                    value={platformFilter}
                    onChange={e => setPlatformFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Platforms</option>
                    <option value="Indeed">Indeed</option>
                    <option value="Naukri">Naukri</option>
                    <option value="LinkedIn">LinkedIn</option>
                  </select>
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

              {/* Jobs Grid */}
              <div className="jobs-grid">
                {filteredJobsForDisplay.length > 0 ? (
                  filteredJobsForDisplay.map((job, i) => (
                    <div key={i} className="job-card">
                      <div className="job-header">
                        <div style={{ flex: 1 }}>
                          <h4
                            className="job-title"
                            onClick={() => setSelectedJob(job)}
                            style={{ cursor: 'pointer' }}
                          >
                            {job.title}
                          </h4>
                          <p className="job-company">{job.company}</p>
                        </div>
                        {job.platform && (
                          <div className="platform-badge">{job.platform}</div>
                        )}
                      </div>
                      <div className="job-actions">
                        <button
                          className={`btn-favorite ${favorites.some(f => f.link === job.link) ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(job);
                          }}
                        >
                          {favorites.some(f => f.link === job.link) ? '⭐' : '☆'}
                        </button>
                        <a href={job.link} target="_blank" rel="noopener noreferrer" className="btn-visit">
                          View Job →
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    <p>No jobs found with the selected filters</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* No Results Message */}
        {!jobs.scraping && jobs.jobs.length === 0 && resume.editableKeywords.length === 0 && keywordsManager.customKeywords.length === 0 && (
          <div className="card-section" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
              👈 Start by uploading your resume or adding custom keywords to begin searching for jobs!
            </p>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast.show && <Toast message={toast.message} type={toast.type} />}

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
}

export default App;
