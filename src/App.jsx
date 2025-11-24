import { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import FileUpload from './components/FileUpload';
import HierarchicalBrowser from './components/HierarchicalBrowser';
import FilesList from './components/FilesList';
import FileDetail from './components/FileDetail';
import FeatureDetail from './components/FeatureDetail';

const Navigation = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gradient-luxury shadow-luxury-lg border-b border-white/10 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-700/30 via-primary-600/20 to-primary-800/30"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500/5 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 px-2 py-2 group">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md group-hover:bg-white/30 transition-all duration-300 shadow-lg group-hover:scale-105">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight drop-shadow-sm">GIS Portal</span>
            </Link>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-2">
              <Link
                to="/"
                className={`inline-flex items-center px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  isActive('/') && !location.pathname.startsWith('/features/')
                    ? 'bg-white/25 text-white shadow-xl backdrop-blur-md border border-white/30'
                    : 'text-white/90 hover:bg-white/15 hover:text-white hover:backdrop-blur-sm'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>
              <Link
                to="/upload"
                className={`inline-flex items-center px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  isActive('/upload')
                    ? 'bg-white/25 text-white shadow-xl backdrop-blur-md border border-white/30'
                    : 'text-white/90 hover:bg-white/15 hover:text-white hover:backdrop-blur-sm'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const HomePage = () => {
  const [filters, setFilters] = useState({});

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="mb-2">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Geographic Data Management</h1>
        <p className="text-gray-600 font-medium">Browse, manage, and download your GIS files</p>
      </div>
      <HierarchicalBrowser onFilterChange={handleFilterChange} />
      <FilesList filters={filters} />
    </div>
  );
};

const UploadPage = () => {
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const handleUploadSuccess = (result) => {
    setUploadSuccess(`Successfully uploaded "${result.filename}" with ${result.total_features} feature(s)!`);
    setUploadError(null);
    setTimeout(() => setUploadSuccess(null), 5000);
  };

  const handleUploadError = (error) => {
    setUploadError(error);
    setUploadSuccess(null);
    setTimeout(() => setUploadError(null), 5000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="mb-2">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Upload Geographic Files</h1>
        <p className="text-gray-600 font-medium">Upload and process your GIS data files</p>
      </div>
      <FileUpload
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
      />
      {uploadSuccess && (
        <div className="bg-gradient-to-r from-accent-50 to-accent-100/50 border-l-4 border-accent-500 text-accent-800 px-6 py-4 rounded-xl shadow-lg animate-fade-in backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-200 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-accent-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-semibold text-lg">{uploadSuccess}</p>
          </div>
        </div>
      )}
      {uploadError && (
        <div className="bg-gradient-to-r from-red-50 to-red-100/50 border-l-4 border-red-400 text-red-800 px-6 py-4 rounded-xl shadow-lg animate-fade-in backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-semibold text-lg">{uploadError}</p>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-subtle relative">
        {/* Decorative background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-200/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-300/5 rounded-full blur-3xl"></div>
        </div>
        
        <Navigation />
        <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 relative z-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/files/:id" element={<FileDetail />} />
            <Route path="/features/:id" element={<FeatureDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

