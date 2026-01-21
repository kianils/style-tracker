import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, TrendingUp, Clock, Plus, ArrowRight } from 'lucide-react';

function Dashboard({ documents, onRefresh }) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Temporal Style Tracker
        </h1>
        <p className="text-gray-300 text-xl">
          Track writing style evolution over time with AI-powered authenticity analysis
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30"
        >
          <FileText className="w-8 h-8 text-purple-400 mb-3" />
          <div className="text-3xl font-bold text-white mb-1">{documents.length}</div>
          <div className="text-gray-300">Documents Tracked</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30"
        >
          <TrendingUp className="w-8 h-8 text-blue-400 mb-3" />
          <div className="text-3xl font-bold text-white mb-1">
            {documents.reduce((sum, doc) => sum + (doc.version_count || 0), 0)}
          </div>
          <div className="text-gray-300">Total Versions</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-lg rounded-xl p-6 border border-green-500/30"
        >
          <Clock className="w-8 h-8 text-green-400 mb-3" />
          <div className="text-3xl font-bold text-white mb-1">Real-time</div>
          <div className="text-gray-300">Style Analysis</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link to="/analyze">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 hover:border-purple-500/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Analyze Text</h2>
                <p className="text-gray-400">Check authenticity of any text</p>
              </div>
            </div>
            <div className="flex items-center text-purple-400">
              Get Started <ArrowRight className="w-5 h-5 ml-2" />
            </div>
          </motion.div>
        </Link>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Quick Stats</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-300">
              <span>Active Documents</span>
              <span className="text-white font-semibold">{documents.length}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Average Versions</span>
              <span className="text-white font-semibold">
                {documents.length > 0
                  ? (documents.reduce((sum, doc) => sum + (doc.version_count || 0), 0) / documents.length).toFixed(1)
                  : 0}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Your Documents</h2>
        {documents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 backdrop-blur-lg rounded-xl p-12 border border-white/10 text-center"
          >
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-4">No documents tracked yet</p>
            <Link to="/analyze">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold"
              >
                Start Analyzing
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc, idx) => (
              <Link key={doc.document_id} to={`/track/${doc.document_id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-purple-500/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <FileText className="w-8 h-8 text-purple-400" />
                    <span className="text-purple-400 text-sm font-semibold">
                      {doc.version_count} versions
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{doc.document_id}</h3>
                  {doc.updated_at && (
                    <p className="text-gray-400 text-sm">
                      Updated {new Date(doc.updated_at).toLocaleDateString()}
                    </p>
                  )}
                  <div className="mt-4 flex items-center text-purple-400 text-sm">
                    View Details <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
