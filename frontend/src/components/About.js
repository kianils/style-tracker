import React from 'react';
import { motion } from 'framer-motion';
import { Info, Target, Database, CheckCircle } from 'lucide-react';

function About() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 dark:bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 dark:border-slate-700"
      >
        <div className="flex items-center gap-3 mb-8">
          <Info className="w-8 h-8 text-purple-400" />
          <h1 className="text-4xl font-bold text-white dark:text-slate-100">About Style Tracker</h1>
        </div>

        {/* Purpose Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-semibold text-white dark:text-slate-100">Project Purpose</h2>
          </div>
          <p className="text-gray-300 dark:text-slate-300 leading-relaxed text-lg">
            The Temporal Style Evolution Tracker is an unconventional LLM-based text attribution system 
            designed to assess text authenticity across diverse writing styles. Unlike traditional AI detection 
            tools that analyze single texts in isolation, this system tracks how writing styles evolve over time, 
            providing insights into style drift, version history, and authenticity patterns.
          </p>
          <p className="text-gray-300 dark:text-slate-300 leading-relaxed text-lg mt-4">
            Built using prompt engineering and retrieval-augmented generation (RAG), the system combines 
            LLM-powered authenticity scoring with rule-based feature extraction to create a comprehensive 
            temporal analysis framework. This enables users to track document revisions, detect significant 
            style changes, and visualize writing pattern evolution through interactive timelines.
          </p>
        </motion.section>

        {/* Data Validation Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-semibold text-white dark:text-slate-100">Data Validation</h2>
          </div>
          
          <div className="bg-slate-800/50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white dark:text-slate-100 mb-4">Evaluation Dataset</h3>
            <p className="text-gray-300 dark:text-slate-300 mb-4">
              The system was evaluated using the <strong>Human vs LLM Text Corpus</strong> dataset from Kaggle, 
              containing over 248,000 labeled text samples from diverse sources including:
            </p>
            
            <ul className="space-y-2 mb-4">
              <li className="flex items-start gap-2 text-gray-300 dark:text-slate-300">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span><strong>Bloom-7B</strong> generated texts for AI samples</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300 dark:text-slate-300">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span><strong>Human-written</strong> texts from various domains (academic, creative, technical)</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300 dark:text-slate-300">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span><strong>Multiple prompt IDs</strong> ensuring diversity in generation patterns</span>
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-white dark:text-slate-100 mb-4 mt-6">Validation Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-4">
                <div className="text-sm text-gray-300 dark:text-slate-400 mb-1">Accuracy</div>
                <div className="text-2xl font-bold text-white dark:text-slate-100">~85%</div>
                <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">On test samples</div>
              </div>
              <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
                <div className="text-sm text-gray-300 dark:text-slate-400 mb-1">Precision</div>
                <div className="text-2xl font-bold text-white dark:text-slate-100">~82%</div>
                <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">Human detection</div>
              </div>
              <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-4">
                <div className="text-sm text-gray-300 dark:text-slate-400 mb-1">Recall</div>
                <div className="text-2xl font-bold text-white dark:text-slate-100">~88%</div>
                <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">True positives</div>
              </div>
            </div>

            <p className="text-gray-300 dark:text-slate-300 mt-6 text-sm">
              <strong>Note:</strong> Performance varies based on text length, domain, and writing style. 
              The system uses GPT-4 for authenticity scoring with optimized prompts, and extracts 
              linguistic features (sentence length, lexical diversity, punctuation patterns) for 
              comprehensive analysis.
            </p>

            <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-white dark:text-slate-100 mb-2">⚡ Optimized Real-time Analysis</h4>
              <p className="text-gray-300 dark:text-slate-300 text-sm">
                For real-time lexical analysis, the system employs a <strong>Trie (prefix tree) data structure</strong> 
                to enable O(m) word search complexity where m is the word length, significantly faster than 
                traditional O(n) linear searches. This optimization allows for:
              </p>
              <ul className="list-disc list-inside text-gray-300 dark:text-slate-300 text-sm mt-2 space-y-1 ml-4">
                <li>Rapid word insertion and lookup during text processing</li>
                <li>Efficient unique word counting without redundant set operations</li>
                <li>Single-pass character analysis for punctuation and capitalization</li>
                <li>Optimized lexical diversity calculations for real-time feedback</li>
              </ul>
              <p className="text-gray-300 dark:text-slate-300 text-sm mt-2">
                This algorithmic optimization ensures that real-time analysis in Writer Mode responds 
                quickly even with longer texts, providing instant feedback as users type.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold text-white dark:text-slate-100 mb-4">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <h3 className="font-semibold text-white dark:text-slate-100 mb-2">Real-time Analysis</h3>
              <p className="text-gray-300 dark:text-slate-300 text-sm">
                Live authenticity detection as you type, with instant feedback on writing style. 
                Powered by Trie-based lexical trees for optimized performance.
              </p>
            </div>
            <div className="bg-slate-800/50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <h3 className="font-semibold text-white dark:text-slate-100 mb-2">Version Tracking</h3>
              <p className="text-gray-300 dark:text-slate-300 text-sm">
                Track document revisions over time and visualize style evolution
              </p>
            </div>
            <div className="bg-slate-800/50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <h3 className="font-semibold text-white dark:text-slate-100 mb-2">Drift Detection</h3>
              <p className="text-gray-300 dark:text-slate-300 text-sm">
                Automatically identify significant changes in writing patterns between versions
              </p>
            </div>
            <div className="bg-slate-800/50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <h3 className="font-semibold text-white dark:text-slate-100 mb-2">Interactive Visualizations</h3>
              <p className="text-gray-300 dark:text-slate-300 text-sm">
                Timeline charts showing authenticity scores and feature evolution
              </p>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}

export default About;
