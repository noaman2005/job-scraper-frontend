import { useEffect } from 'react';

export const useKeyboardShortcuts = (editableKeywords, location, jobs, onScrape, onDownload) => {
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 's' && e.ctrlKey) {
        e.preventDefault();
        if (editableKeywords.length && location) onScrape();
      }
      if (e.key === 'd' && e.ctrlKey) {
        e.preventDefault();
        if (jobs.length) onDownload('txt');
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [editableKeywords, location, jobs, onScrape, onDownload]);
};
