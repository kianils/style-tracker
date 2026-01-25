import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, TrendingUp, Activity, FileText, PenTool, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

function Analyzer({ onAnalyze }) {
  const { theme, toggleTheme } = useTheme();
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [documentId, setDocumentId] = useState('');
  const [saving, setSaving] = useState(false);
  const [writerMode, setWriterMode] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const debounceTimer = useRef(null);

  // Real-time analysis with debouncing
  useEffect(() => {
    if (!realTimeEnabled || !writerMode || text.length < 50) {
      return;
    }

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debounced analysis
    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await axios.post(`${API_BASE}/analyze`, { text });
        setResult(response.data);
      } catch (error) {
        console.error('Real-time analysis error:', error);
        // Silently fail for real-time analysis to avoid disrupting writing
      }
    }, 1500); // 1.5 second debounce

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [text, realTimeEnabled, writerMode]);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const response = await axios.post(`${API_BASE}/analyze`, { text });
      setResult(response.data);
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to analyze text';
      setResult({ error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVersion = async () => {
    if (!documentId.trim() || !text.trim()) {
      alert('Please enter both document ID and text');
      return;
    }
    
    setSaving(true);
    try {
      await axios.post(`${API_BASE}/documents/${documentId}/versions`, {
        text,
        metadata: { source: 'web_analyzer' }
      });
      alert('Version saved successfully!');
      setText('');
      setResult(null);
      if (onAnalyze) onAnalyze();
    } catch (error) {
      console.error('Save error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to save version';
      alert(`Error: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const authenticityColor = result?.authenticity_score > 0.5 
    ? 'text-green-400' 
    : result?.authenticity_score < 0.5 
    ? 'text-red-400' 
    : 'text-yellow-400';

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-white/10 dark:bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 dark:border-slate-700`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white dark:text-slate-100">
                  {writerMode ? 'Writer Mode' : 'Text Authenticity Analyzer'}
                </h1>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 dark:text-slate-300 mb-2">
                {writerMode ? 'Start Writing...' : 'Enter Text to Analyze'}
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={writerMode 
                  ? "Write your text here and get real-time authenticity feedback..." 
                  : "Paste your text here to analyze its authenticity..."}
                className={`w-full ${writerMode ? 'h-96' : 'h-48'} px-4 py-3 bg-slate-800/50 dark:bg-slate-900/50 border border-slate-700 dark:border-slate-600 rounded-lg text-white dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all`}
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-gray-400 dark:text-slate-400">
                  {text.length} characters
                </span>
                {writerMode && realTimeEnabled && text.length >= 50 && (
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <Activity className="w-3 h-3 animate-pulse" />
                    Analyzing...
                  </span>
                )}
              </div>
            </div>

            {!writerMode && (
              <div className="flex gap-4 mb-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAnalyze}
                  disabled={loading || !text.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
                >
                  {loading ? (
                    <>
                      <Activity className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Analyze Text
                    </>
                  )}
                </motion.button>
              </div>
            )}

            <AnimatePresence>
              {result && !result.error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-slate-800/50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-700 dark:border-slate-600 mb-6"
                >
                  <h2 className="text-2xl font-bold text-white dark:text-slate-100 mb-4 flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    Analysis Results
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg p-4 border border-purple-500/30"
                    >
                      <div className="text-sm text-gray-300 dark:text-slate-300 mb-1">Authenticity Score</div>
                      <div className={`text-4xl font-bold ${authenticityColor}`}>
                        {(result.authenticity_score * 100).toFixed(1)}%
                      </div>
                      <div className="mt-2 w-full bg-slate-700 dark:bg-slate-800 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.authenticity_score * 100}%` }}
                          transition={{ duration: 1 }}
                          className={`h-2 rounded-full ${
                            result.authenticity_score > 0.5 ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-lg p-4 border border-blue-500/30"
                    >
                      <div className="text-sm text-gray-300 dark:text-slate-300 mb-1">Prediction</div>
                      <div className="text-3xl font-bold text-white dark:text-slate-100">
                        {result.prediction === 'human' ? '👤 Human' : '🤖 AI'}
                      </div>
                      <div className="text-sm text-gray-400 dark:text-slate-400 mt-2">
                        Confidence: {(result.confidence * 100).toFixed(1)}%
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-br from-orange-600/20 to-red-600/20 rounded-lg p-4 border border-orange-500/30"
                    >
                      <div className="text-sm text-gray-300 dark:text-slate-300 mb-1">Style Features</div>
                      <div className="text-2xl font-bold text-white dark:text-slate-100">
                        {Object.keys(result.style_features).length}
                      </div>
                      <div className="text-sm text-gray-400 dark:text-slate-400 mt-2">Metrics extracted</div>
                    </motion.div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white dark:text-slate-100 mb-3">Style Features</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(result.style_features).map(([key, value]) => (
                        <div key={key} className="bg-slate-700/50 dark:bg-slate-800/50 rounded p-3">
                          <div className="text-xs text-gray-400 dark:text-slate-400 mb-1">{key.replace(/_/g, ' ')}</div>
                          <div className="text-white dark:text-slate-100 font-semibold">
                            {typeof value === 'number' ? value.toFixed(2) : value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-700 dark:border-slate-600 pt-4">
                    <h3 className="text-lg font-semibold text-white dark:text-slate-100 mb-3">Save as Version</h3>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={documentId}
                        onChange={(e) => setDocumentId(e.target.value)}
                        placeholder="Enter document ID (e.g., essay_1)"
                        className="flex-1 px-4 py-2 bg-slate-700 dark:bg-slate-800 border border-slate-600 dark:border-slate-700 rounded-lg text-white dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSaveVersion}
                        disabled={saving}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save Version'}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {result?.error && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-300">
                {result.error}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Sidebar Toolbar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-80 flex-shrink-0 order-1 lg:order-2"
        >
          <div className={`bg-white/10 dark:bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20 dark:border-slate-700 sticky top-8`}>
            <h3 className="text-lg font-semibold text-white dark:text-slate-100 mb-4">Tools</h3>
            
            {/* Writer Mode Toggle */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300 dark:text-slate-300 flex items-center gap-2">
                  <PenTool className="w-4 h-4" />
                  Writer Mode
                </label>
                <button
                  onClick={() => {
                    setWriterMode(!writerMode);
                    if (!writerMode) {
                      setRealTimeEnabled(true);
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    writerMode ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      writerMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-gray-400 dark:text-slate-400">
                {writerMode 
                  ? 'Real-time analysis enabled as you type' 
                  : 'Enable for live writing feedback'}
              </p>
            </div>

            {/* Real-time Toggle (only in writer mode) */}
            {writerMode && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300 dark:text-slate-300 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Real-time Analysis
                  </label>
                  <button
                    onClick={() => setRealTimeEnabled(!realTimeEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      realTimeEnabled ? 'bg-green-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        realTimeEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-400 dark:text-slate-400">
                  {realTimeEnabled 
                    ? 'Analyzing text automatically' 
                    : 'Manual analysis only'}
                </p>
              </div>
            )}

            {/* Theme Toggle - More Obvious */}
            <div className="border-t border-slate-700 dark:border-slate-600 pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300 dark:text-slate-300 flex items-center gap-2">
                  {theme === 'dark' ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-yellow-400" />}
                  <span className="font-semibold">{theme === 'dark' ? 'Dark' : 'Light'} Mode</span>
                </label>
                <button
                  onClick={toggleTheme}
                  className={`px-3 py-2 rounded-lg transition-all border-2 flex items-center gap-1 ${
                    theme === 'dark' 
                      ? 'bg-yellow-500/20 border-yellow-500/50 hover:bg-yellow-500/30' 
                      : 'bg-blue-500/20 border-blue-500/50 hover:bg-blue-500/30'
                  }`}
                  title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-5 h-5 text-yellow-400" />
                      <span className="text-xs text-yellow-300 font-semibold">Light</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-5 h-5 text-blue-400" />
                      <span className="text-xs text-blue-300 font-semibold">Dark</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400 dark:text-slate-400 mt-1">
                {theme === 'dark' ? 'Currently using dark theme' : 'Currently using light theme'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Analyzer;
