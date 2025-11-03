import { useState, useEffect } from 'react';
import axios from 'axios';
import { triggerConfetti } from '../utils/confetti';

export const useJobs = (API_URL, showToast) => {
  const [scraping, setScraping] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [progress, setProgress] = useState(0);
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [showStats, setShowStats] = useState(false);

  // Filter and sort jobs
  useEffect(() => {
    let filtered = [...jobs];

    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterCompany) {
      filtered = filtered.filter(job => job.company === filterCompany);
    }

    if (sortBy === 'company') {
      filtered.sort((a, b) => a.company.localeCompare(b.company));
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    const uniqueJobs = filtered.filter((job, index, self) =>
      index === self.findIndex(j => j.link === job.link)
    );

    setFilteredJobs(uniqueJobs);
  }, [jobs, searchQuery, filterCompany, sortBy]);

  const handleScrapeJobs = async (editableKeywords, location, selectedPlatforms) => {
    if (!editableKeywords.length) return showToast("No keywords to search", 'error');
    if (!location) return showToast("Please enter location", 'error');
    if (!selectedPlatforms.length) return showToast("Select at least one platform", 'error');

    setScraping(true);
    setJobs([]);
    setProgress(0);
    setShowStats(true);

    try {
      // Single API call with all keywords at once
      setCurrentKeyword('Scraping...');
      
      const response = await axios.post(`${API_URL}/scrape_jobs`, {
        keywords: editableKeywords,
        location,
        platforms: selectedPlatforms  // FIX: Send platforms here
      });

      setJobs(response.data.jobs);
      setProgress(100);
      showToast(`🎉 Found ${response.data.jobs.length} jobs!`, 'success');
      triggerConfetti();
    } catch (err) {
      console.error(err);
      showToast("❌ Error scraping jobs", 'error');
    } finally {
      setScraping(false);
      setCurrentKeyword('');
      setProgress(0);
    }
  };

  const handleDownload = (format, filteredJobs) => {
    let content, blob, filename;

    if (format === 'txt') {
      content = filteredJobs.map(
        (job, idx) => `${idx + 1}. ${job.title} — ${job.company}\n${job.link}\n`
      ).join('\n');
      blob = new Blob([content], { type: 'text/plain' });
      filename = 'jobs.txt';
    } else if (format === 'csv') {
      content = 'Title,Company,Link\n' + filteredJobs.map(
        job => `"${job.title}","${job.company}","${job.link}"`
      ).join('\n');
      blob = new Blob([content], { type: 'text/csv' });
      filename = 'jobs.csv';
    } else if (format === 'json') {
      content = JSON.stringify(filteredJobs, null, 2);
      blob = new Blob([content], { type: 'application/json' });
      filename = 'jobs.json';
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast(`✅ Downloaded as ${format.toUpperCase()}`, 'success');
  };

  return {
    scraping,
    jobs,
    filteredJobs,
    searchQuery,
    setSearchQuery,
    filterCompany,
    setFilterCompany,
    sortBy,
    setSortBy,
    progress,
    currentKeyword,
    showStats,
    handleScrapeJobs,
    handleDownload,
  };
};
