import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Toast from './components/Toast';
import JobModal from './components/JobModal';
import ProgressBar from './components/ProgressBar';
import StatsCard from './components/StatsCard';
import ParticleBackground from './components/ParticleBackground';
import { triggerConfetti } from './utils/confetti';

function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [location, setLocation] = useState('');
  const [matchedKeywords, setMatchedKeywords] = useState([]);
  const [editableKeywords, setEditableKeywords] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [selectedJob, setSelectedJob] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [theme, setTheme] = useState('dark');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showStats, setShowStats] = useState(false);

  // Load favorites and theme from localStorage
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setFavorites(savedFavorites);
    setTheme(savedTheme);
    document.body.className = savedTheme;
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Filter and sort jobs
  useEffect(() => {
    let filtered = [...jobs];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Company filter
    if (filterCompany) {
      filtered = filtered.filter(job => job.company === filterCompany);
    }

    // Sort
    if (sortBy === 'company') {
      filtered.sort((a, b) => a.company.localeCompare(b.company));
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    // Remove duplicates
    const uniqueJobs = filtered.filter((job, index, self) =>
      index === self.findIndex(j => j.link === job.link)
    );

    setFilteredJobs(uniqueJobs);
  }, [jobs, searchQuery, filterCompany, sortBy]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 's' && e.ctrlKey) {
        e.preventDefault();
        if (editableKeywords.length && location) handleScrapeJobs();
      }
      if (e.key === 'd' && e.ctrlKey) {
        e.preventDefault();
        if (jobs.length) handleDownload('txt');
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [editableKeywords, location, jobs]);

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    if (soundEnabled) playSound(type);
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const playSound = (type) => {
    const audio = new Audio(
      type === 'success' 
        ? 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3'
        : 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3'
    );
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setResumeFile(file);
    if (file) showToast(`📄 ${file.name} uploaded`, 'info');
  };

  const handleParseResume = async () => {  // <-- async here
    if (!resumeFile) return showToast("Please upload a resume first", 'error');
    setIsParsing(true);
    setMatchedKeywords([]);
    setEditableKeywords([]);
    setJobs([]);

    const formData = new FormData();
    formData.append('file', resumeFile);

    try {
      const response = await axios.post(`${API_URL}/extract_keywords`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMatchedKeywords(response.data.keywords);
      setEditableKeywords(response.data.keywords);
      if (response.data.keywords.length === 0) {
        showToast("⚠ No matching keywords found", 'error');
      } else {
        showToast(`✅ Found ${response.data.keywords.length} keywords`, 'success');
      }
    } catch (err) {
      showToast("❌ Error extracting keywords", 'error');
    } finally {
      setIsParsing(false);
    }
  };

  const handleScrapeJobs = async () => {  // <-- async here too
    if (!editableKeywords.length) return showToast("No keywords to search", 'error');
    if (!location) return showToast("Please enter location", 'error');

    setScraping(true);
    setJobs([]);
    setProgress(0);
    setShowStats(true);

    try {
      const totalKeywords = editableKeywords.length;
      let allJobs = [];

      for (let i = 0; i < totalKeywords; i++) {
        setCurrentKeyword(editableKeywords[i]);
        setProgress(((i + 1) / totalKeywords) * 100);

        const response = await axios.post(`${API_URL}/scrape_jobs`, {
          keywords: [editableKeywords[i]],
          location,
        });

        allJobs = [...allJobs, ...response.data.jobs];
        setJobs([...allJobs]);
      }

      showToast(`🎉 Found ${allJobs.length} jobs!`, 'success');
      triggerConfetti();
    } catch (err) {
      showToast("❌ Error scraping jobs", 'error');
    } finally {
      setScraping(false);
      setCurrentKeyword('');
      setProgress(0);
    }
  };

  const handleDownload = (format) => {
    let content, blob, filename;

    if (format === 'txt') {
      content = filteredJobs.map(
        (job, idx) => `${idx + 1}. ${job.title} — ${job.company}\n${job.link}\n`
      ).join('\n');
      blob = new Blob([content], { type: 'text/plain' });
      filename = 'indeed_jobs.txt';
    } else if (format === 'csv') {
      content = 'Title,Company,Link\n' + filteredJobs.map(
        job => `"${job.title}","${job.company}","${job.link}"`
      ).join('\n');
      blob = new Blob([content], { type: 'text/csv' });
      filename = 'indeed_jobs.csv';
    } else if (format === 'json') {
      content = JSON.stringify(filteredJobs, null, 2);
      blob = new Blob([content], { type: 'application/json' });
      filename = 'indeed_jobs.json';
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast(`✅ Downloaded as ${format.toUpperCase()}`, 'success');
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

  const removeKeyword = (keyword) => {
    setEditableKeywords(editableKeywords.filter(k => k !== keyword));
  };

  const addKeyword = (keyword) => {
    if (keyword && !editableKeywords.includes(keyword.toLowerCase())) {
      setEditableKeywords([...editableKeywords, keyword.toLowerCase()]);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.className = newTheme;
  };

  const uniqueCompanies = [...new Set(jobs.map(j => j.company))].sort();
  const keywordStats = editableKeywords.map(kw => ({
    keyword: kw,
    count: jobs.filter(j => 
      j.title.toLowerCase().includes(kw) || 
      j.company.toLowerCase().includes(kw)
    ).length
  }));

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  return (
    <div className="app-container">
      <ParticleBackground />
      
      <div className="glass-card">
        {/* Header with theme toggle and sound */}
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

        {/* Section 1: Upload Resume */}
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
                onChange={handleFileChange} 
                disabled={isParsing || scraping}
                className="file-input"
              />
              <div className="upload-box">
                {resumeFile ? (
                  <div className="file-selected">
                    <span className="file-icon">📄</span>
                    <span className="file-name">{resumeFile.name}</span>
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
              onClick={handleParseResume} 
              disabled={!resumeFile || isParsing || scraping}
              className="btn btn-primary"
            >
              {isParsing ? (
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

        {/* Editable Keywords */}
        {editableKeywords.length > 0 && (
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
              {editableKeywords.map((keyword, idx) => (
                <span key={idx} className="keyword-tag">
                  {keyword}
                  <button className="keyword-remove" onClick={() => removeKeyword(keyword)}>×</button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Location */}
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
            disabled={scraping || isParsing}
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

        {/* Scrape Button */}
        <button
          onClick={handleScrapeJobs}
          disabled={!editableKeywords.length || !location || scraping || isParsing}
          className="btn btn-scrape"
        >
          {scraping ? (
            <>
              <span className="spinner"></span>
              Scraping {currentKeyword}...
            </>
          ) : (
            <>
              <span>🚀</span> Start Scraping <span className="shortcut-hint">Ctrl+S</span>
            </>
          )}
        </button>

        {/* Progress Bar */}
        {scraping && <ProgressBar progress={progress} currentKeyword={currentKeyword} />}

        {/* Stats Cards */}
        {showStats && jobs.length > 0 && (
          <div className="stats-grid animate-in">
            <StatsCard icon="💼" value={filteredJobs.length} label="Jobs Found" />
            <StatsCard icon="🏢" value={uniqueCompanies.length} label="Companies" />
            <StatsCard icon="🎯" value={editableKeywords.length} label="Keywords" />
            <StatsCard icon="⭐" value={favorites.length} label="Favorites" />
          </div>
        )}

        {/* Filter & Search */}
        {jobs.length > 0 && (
          <div className="filter-section animate-in">
            <input
              type="text"
              placeholder="🔍 Search jobs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <select
              value={filterCompany}
              onChange={e => setFilterCompany(e.target.value)}
              className="filter-select"
            >
              <option value="">All Companies</option>
              {uniqueCompanies.map((company, idx) => (
                <option key={idx} value={company}>{company}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="company">Sort by Company</option>
              <option value="title">Sort by Title</option>
            </select>
          </div>
        )}

        {/* Jobs List */}
        {filteredJobs.length > 0 && (
          <div className="jobs-container animate-in">
            <div className="jobs-header">
              <h3>💼 Jobs Found ({filteredJobs.length})</h3>
              <div className="download-buttons">
                <button onClick={() => handleDownload('txt')} className="btn btn-download" title="Ctrl+D">
                  TXT
                </button>
                <button onClick={() => handleDownload('csv')} className="btn btn-download">
                  CSV
                </button>
                <button onClick={() => handleDownload('json')} className="btn btn-download">
                  JSON
                </button>
              </div>
            </div>
            
            <div className="jobs-list">
              {filteredJobs.map((job, i) => (
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

        {/* Floating Action Button */}
        {jobs.length > 0 && (
          <div className="fab-container">
            <button className="fab" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              ↑
            </button>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      {toast.show && <Toast message={toast.message} type={toast.type} />}

      {/* Job Modal */}
      {selectedJob && <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </div>
  );
}

export default App;
