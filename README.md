# LLM Text Attribution Tool - Temporal Style Evolution Tracker

An unconventional LLM-based text attribution system using prompt engineering and RAG to assess text authenticity across diverse writing styles, with a focus on tracking style evolution over time.

## Temporal Style Evolution Tracker (`temporal_tracker.py`)

Tracks how writing styles change over time:
- **Version history analysis**: Compare multiple versions of the same document
- **Style drift detection**: Identify significant changes in writing patterns
- **Timeline visualization**: Visual graphs showing authenticity scores and feature evolution

### Features

- Store multiple versions of documents with timestamps
- Analyze authenticity scores and style features for each version
- Detect style drift between versions with configurable thresholds
- Generate timeline visualizations showing:
  - Authenticity score evolution
  - Style feature changes over time
  - Drift points marked on timeline
- Persistent storage of version history

## Quick Start

```bash
python temporal_tracker.py
```

### Usage Example

1. **Add versions**: Track different versions of a document
   ```
   > add
   Document ID: essay_1
   [Enter text...]
   ```

2. **Analyze history**: Get detailed analysis of style evolution
   ```
   > analyze
   Document ID: essay_1
   ```

3. **Visualize timeline**: Generate timeline graphs
   ```
   > visualize
   Document ID: essay_1
   ```

4. **Detect drift**: Find significant style changes
   ```
   > drift
   Document ID: essay_1
   ```

## Requirements

See `requirements.txt` for dependencies.

### Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up API key (optional, uses fallback if not set):
   ```bash
   export OPENAI_API_KEY="your-key-here"
   ```
   Or create a `.env` file with:
   ```
   OPENAI_API_KEY=your-key-here
   ```

## How It Works

1. **Version Tracking**: Each time you add a version, the system:
   - Analyzes text authenticity using optimized LLM prompts
   - Extracts style features (sentence length, lexical diversity, etc.)
   - Stores metadata with timestamp

2. **Drift Detection**: Compares consecutive versions to identify:
   - Significant changes in style features
   - Authenticity score shifts
   - Threshold-based drift points

3. **Visualization**: Creates multi-panel timeline graphs showing:
   - Authenticity score over time
   - Feature evolution
   - Drift detection points

## Project Structure

```
├── temporal_tracker.py    # Main implementation
├── requirements.txt        # Dependencies
├── README.md              # This file
└── temporal_data/         # Storage directory (created automatically)
    └── history.json       # Version history database
```
