import { useState } from 'react';
import axios from 'axios';

export const useResume = (API_URL, showToast) => {
  const [resumeFile, setResumeFile] = useState(null);
  const [matchedKeywords, setMatchedKeywords] = useState([]);
  const [editableKeywords, setEditableKeywords] = useState([]);
  const [isParsing, setIsParsing] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setResumeFile(file);
    if (file) showToast(`📄 ${file.name} uploaded`, 'info');
  };

  const handleParseResume = async () => {
    if (!resumeFile) return showToast("Please upload a resume first", 'error');
    setIsParsing(true);
    setMatchedKeywords([]);
    setEditableKeywords([]);

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

  return {
    resumeFile,
    setResumeFile,
    matchedKeywords,
    editableKeywords,
    setEditableKeywords,
    isParsing,
    handleFileChange,
    handleParseResume,
  };
};
