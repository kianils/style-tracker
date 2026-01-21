# Frontend Setup Guide

## Overview
This project includes a modern React frontend with a Flask backend API for the Temporal Style Evolution Tracker.

## Features
- 🎨 **Modern UI**: Dark theme with gradients and animations
- 📊 **Interactive Charts**: Real-time timeline visualizations using Recharts
- ⚡ **Real-time Analysis**: Instant text authenticity scoring
- 📈 **Version Tracking**: Track document versions over time
- 🎭 **Animations**: Smooth transitions with Framer Motion
- 📱 **Responsive**: Works on desktop and mobile

## Tech Stack
- **Frontend**: React 18, Tailwind CSS, Recharts, Framer Motion
- **Backend**: Flask, Flask-CORS
- **API**: RESTful endpoints

## Setup Instructions

### 1. Install Backend Dependencies
```bash
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory:
```
OPENAI_API_KEY=your-api-key-here
```

For the frontend, create `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:8000/api
```

### 4. Run the Application

**Terminal 1 - Start Flask Backend:**
```bash
python app.py
```
Backend runs on: http://localhost:8000

**Terminal 2 - Start React Frontend:**
```bash
cd frontend
npm start
```
Frontend runs on: http://localhost:3000

## API Endpoints

### `GET /api/health`
Health check endpoint

### `POST /api/analyze`
Analyze text for authenticity
```json
{
  "text": "Your text here"
}
```

### `GET /api/documents`
Get list of all tracked documents

### `POST /api/documents/<document_id>/versions`
Add a new version to a document
```json
{
  "text": "Version text",
  "metadata": {}
}
```

### `GET /api/documents/<document_id>/versions`
Get all versions of a document

### `GET /api/documents/<document_id>/analysis`
Get version history analysis

### `GET /api/documents/<document_id>/drift`
Get style drift detection

## Project Structure

```
├── app.py                    # Flask backend API
├── temporal_tracker.py       # Core tracker logic
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Analyzer.js      # Text analysis component
│   │   │   ├── DocumentTracker.js  # Version tracking component
│   │   │   ├── Dashboard.js     # Main dashboard
│   │   │   └── Navbar.js        # Navigation
│   │   ├── App.js              # Main app component
│   │   └── App.css             # Global styles
│   ├── public/
│   └── package.json
└── requirements.txt
```

## Development

### Build for Production
```bash
cd frontend
npm run build
```

The built files will be in `frontend/build/`. Flask will serve these automatically.

### Customization

**Colors**: Edit `frontend/tailwind.config.js` to customize the color scheme

**API URL**: Update `REACT_APP_API_URL` in `frontend/.env` for different environments

**Styling**: Components use Tailwind CSS classes - modify as needed

## Features in Action

1. **Dashboard**: Overview of all tracked documents
2. **Analyzer**: Real-time text authenticity analysis
3. **Document Tracker**: View version history with charts and drift detection

## Troubleshooting

**CORS Errors**: Make sure Flask-CORS is installed and CORS is enabled in `app.py`

**API Connection**: Check that `REACT_APP_API_URL` matches your Flask server URL

**Build Errors**: Make sure all dependencies are installed (`npm install`)

## Deployment

1. Build the frontend: `cd frontend && npm run build`
2. The Flask app automatically serves the built files
3. Deploy to your preferred hosting (Heroku, AWS, etc.)
4. Set environment variables on your hosting platform
