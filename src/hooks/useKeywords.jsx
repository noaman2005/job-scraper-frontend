import { useState } from 'react';

export const useKeywords = () => {
  const [customKeywords, setCustomKeywords] = useState(() => {
    return JSON.parse(localStorage.getItem('customKeywords') || '[]');
  });

  const addCustomKeyword = (keyword) => {
    if (keyword && !customKeywords.includes(keyword.toLowerCase())) {
      const updated = [...customKeywords, keyword.toLowerCase()];
      setCustomKeywords(updated);
      localStorage.setItem('customKeywords', JSON.stringify(updated));
      return true;
    }
    return false;
  };

  const removeCustomKeyword = (keyword) => {
    const updated = customKeywords.filter(k => k !== keyword);
    setCustomKeywords(updated);
    localStorage.setItem('customKeywords', JSON.stringify(updated));
  };

  const clearCustomKeywords = () => {
    setCustomKeywords([]);
    localStorage.setItem('customKeywords', JSON.stringify([]));
  };

  return {
    customKeywords,
    addCustomKeyword,
    removeCustomKeyword,
    clearCustomKeywords,
  };
};
