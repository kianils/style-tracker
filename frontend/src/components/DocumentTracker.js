import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ArrowLeft, Plus, TrendingUp, AlertCircle, Activity } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

function DocumentTracker({ onUpdate }) {
  const { documentId } = useParams();
  const [versions, setVersions] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [drift, setDrift] = useState(null);
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [documentId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [versionsRes, analysisRes, driftRes] = await Promise.all([
        axios.get(`${API_BASE}/documents/${documentId}/versions`),
        axios.get(`${API_BASE}/documents/${documentId}/analysis`),
        axios.get(`${API_BASE}/documents/${documentId}/drift`)
      ]);
      
      setVersions(versionsRes.data.versions || []);
      setAnalysis(analysisRes.data);
      setDrift(driftRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVersion = async () => {
    if (!newText.trim()) return;
    
    setSaving(true);
    try {
      await axios.post(`${API_BASE}/documents/${documentId}/versions`, {
        text: newText,
        metadata: { source: 'web_tracker' }
      });
      setNewText('');
      fetchData();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error adding version:', error);
      alert('Failed to add version');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-white">Loading...</div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = versions.map((v, idx) => ({
    version: `v${idx + 1}`,
    score: v.authenticity_score * 100,
    timestamp: new Date(v.timestamp).toLocaleDateString()
  }));

  const featureData = versions.length > 0 ? Object.keys(versions[0].style_features).map(key => ({
    feature: key.replace(/_/g, ' '),
    value: versions[versions.length - 1].style_features[key] || 0
  })) : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6">
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{documentId}</h1>
            <p className="text-gray-300">{versions.length} versions tracked</p>
          </div>
          {drift?.drift_detected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 bg-orange-500/20 border border-orange-500 rounded-lg px-4 py-2"
            >
              <AlertCircle className="w-5 h-5 text-orange-400" />
              <span className="text-orange-300 font-semibold">Style Drift Detected</span>
            </motion.div>
          )}
        </div>

        {/* Add New Version */}
        <div className="mb-8 bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Version
          </h2>
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Enter new version of the text..."
            className="w-full h-32 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3 resize-none"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddVersion}
            disabled={saving || !newText.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold disabled:opacity-50 hover:bg-purple-700"
          >
            {saving ? 'Saving...' : 'Add Version'}
          </motion.button>
        </div>

        {/* Charts */}
        {versions.length > 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-800/50 rounded-lg p-6 border border-slate-700"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Authenticity Evolution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="version" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    dot={{ fill: '#A78BFA', r: 5 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-800/50 rounded-lg p-6 border border-slate-700"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Style Features</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={featureData.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="feature" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        )}

        {/* Analysis Summary */}
        {analysis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-4">
              <div className="text-sm text-gray-300 mb-1">Trend</div>
              <div className="text-2xl font-bold text-white capitalize">
                {analysis.authenticity_trend?.direction || 'stable'}
              </div>
            </div>
            <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
              <div className="text-sm text-gray-300 mb-1">Time Span</div>
              <div className="text-2xl font-bold text-white">
                {analysis.time_span?.duration_days || 0} days
              </div>
            </div>
            <div className="bg-orange-600/20 border border-orange-500/30 rounded-lg p-4">
              <div className="text-sm text-gray-300 mb-1">Drift Score</div>
              <div className="text-2xl font-bold text-white">
                {drift?.drift_score ? drift.drift_score.toFixed(3) : '0.000'}
              </div>
            </div>
          </div>
        )}

        {/* Versions List */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Version History</h3>
          <div className="space-y-4">
            {versions.map((version, idx) => (
              <motion.div
                key={version.version_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-purple-500/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-purple-400 font-bold">{version.version_id}</span>
                    <span className="text-gray-400 text-sm">
                      {new Date(version.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    version.authenticity_score > 0.5
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {(version.authenticity_score * 100).toFixed(1)}%
                  </div>
                </div>
                <p className="text-gray-300 text-sm line-clamp-2">
                  {version.text.substring(0, 200)}...
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default DocumentTracker;
