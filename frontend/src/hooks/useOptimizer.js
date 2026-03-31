/**
 * useOptimizer.js
 * Custom React hook for resume optimization logic
 */

import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE = '/api';

export function useOptimizer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState('');

  const optimize = useCallback(async ({ resumeFile, resumeText, jdFile, jdText }) => {
    setLoading(true);
    setError(null);
    setResult(null);

    const steps = [
      'Extracting text from files…',
      'Analyzing job description…',
      'Identifying keyword gaps…',
      'Rewriting with AI…',
      'Calculating match score…',
    ];

    // Simulate progress messages
    let stepIdx = 0;
    setProgress(steps[stepIdx]);
    const progressInterval = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, steps.length - 1);
      setProgress(steps[stepIdx]);
    }, 2500);

    try {
      const formData = new FormData();
      if (resumeFile) formData.append('resume', resumeFile);
      else if (resumeText) formData.append('resumeText', resumeText);

      if (jdFile) formData.append('jd', jdFile);
      else if (jdText) formData.append('jdText', jdText);

      const response = await axios.post(`${API_BASE}/optimize`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 90000, // 90s timeout for AI processing
      });

      setResult(response.data);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
      setProgress('');
    }
  }, []);

  // Download as DOCX
  const downloadDOCX = useCallback(async (resumeText) => {
    try {
      const response = await axios.post(
        `${API_BASE}/download/docx`,
        { resumeText },
        { responseType: 'blob' }
      );
      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Optimized_Resume.docx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to generate DOCX: ' + (err.response?.data?.error || err.message));
    }
  }, []);

  // Download as PDF (uses browser print)
  const downloadPDF = useCallback(async (resumeText) => {
    try {
      const response = await axios.post(`${API_BASE}/preview/html`, { resumeText });
      const printWindow = window.open('', '_blank');
      printWindow.document.write(response.data);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    } catch (err) {
      alert('Failed to generate PDF: ' + (err.response?.data?.error || err.message));
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
    setProgress('');
  }, []);

  return { loading, error, result, progress, optimize, downloadDOCX, downloadPDF, reset };
}
