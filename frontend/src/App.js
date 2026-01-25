import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import Analyzer from './components/Analyzer';
import DocumentTracker from './components/DocumentTracker';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import About from './components/About';
import { Activity } from 'lucide-react';
import './App.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

function App() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/documents`);
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to load documents. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 light:from-gray-50 light:via-purple-50 light:to-gray-100 transition-colors duration-300">
          <Navbar />
          
          <Routes>
            <Route path="/" element={
              loading ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                  <Activity className="w-12 h-12 text-purple-400 animate-spin mb-4" />
                  <div className="text-white dark:text-slate-100 text-lg">Loading documents...</div>
                </div>
              ) : error ? (
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/20 border border-red-500 rounded-2xl shadow-2xl p-8 text-center"
                  >
                    <p className="text-white dark:text-slate-100 mb-4">{error}</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={fetchDocuments}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
                    >
                      Retry
                    </motion.button>
                  </motion.div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Dashboard documents={documents} onRefresh={fetchDocuments} />
                </motion.div>
              )
            } />
            
            <Route path="/analyze" element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Analyzer onAnalyze={fetchDocuments} />
              </motion.div>
            } />
            
            <Route path="/track/:documentId" element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <DocumentTracker onUpdate={fetchDocuments} />
              </motion.div>
            } />

            <Route path="/about" element={
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <About />
              </motion.div>
            } />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
