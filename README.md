# GIS Data Manager - Frontend

A React frontend application for managing GIS geographic data with an intuitive user interface.

## Features

- 📤 **File Upload**: Drag and drop or browse to upload geographic files (GeoJSON, KML, Shapefile, GPX, CSV)
- 🔍 **Hierarchical Browser**: Browse data by State → District → Taluk → Village
- 📋 **Features List**: View all features in a searchable, filterable table
- 👁️ **Feature Details**: View and edit individual feature details
- 🗑️ **CRUD Operations**: Create, Read, Update, Delete features

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests

## Setup

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Environment configuration**
The `.env` file is already configured for production:
```env
VITE_API_URL=https://gis-portal.1acre.in
```

For local development, create a `.env.local` file:
```env
VITE_API_URL=http://localhost:8000
```

If not set, it defaults to `https://gis-portal.1acre.in`.

3. **Start development server**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── FileUpload.jsx        # File upload with drag & drop
│   │   ├── HierarchicalBrowser.jsx # State/District/Taluk/Village browser
│   │   ├── FeaturesList.jsx      # Features table with pagination
│   │   └── FeatureDetail.jsx     # Single feature view/edit
│   ├── services/
│   │   └── api.js                # API client service
│   ├── App.jsx                   # Main app component with routing
│   ├── main.jsx                  # React entry point
│   └── index.css                 # Global styles with Tailwind
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Usage

### Upload Files

1. Navigate to the **Upload** page
2. Drag and drop a file or click "Browse Files"
3. Supported formats: GeoJSON, JSON, KML, KMZ, Shapefile (ZIP), GPX, CSV
4. Click "Upload File" to process

### Browse Data

1. Use the hierarchical browser on the home page
2. Select **State** → **District** → **Taluk** → **Village** to filter features
3. The features list automatically updates based on your selections

### View Feature Details

1. Click **View** on any feature in the list
2. See all feature properties and metadata
3. Click **Edit** to modify the feature
4. Click **Delete** to remove the feature

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## API Integration

The frontend communicates with the FastAPI backend at `http://localhost:8000` by default. Make sure the backend is running before using the frontend.

## Design Notes

- Clean, user-friendly interface with no unnecessary animations
- Prominent, well-styled buttons for all actions
- Responsive design that works on desktop and mobile
- Clear visual feedback for loading states and errors
- Intuitive navigation and filtering

