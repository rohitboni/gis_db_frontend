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
    <nav className="bg-primary-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center px-2 py-2 text-xl font-bold">
              GIS Data Manager
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 font-medium ${
                  isActive('/') && !location.pathname.startsWith('/features/')
                    ? 'border-white text-white'
                    : 'border-transparent text-primary-100 hover:border-primary-300 hover:text-white'
                }`}
              >
                Home
              </Link>
              <Link
                to="/upload"
                className={`inline-flex items-center px-1 pt-1 border-b-2 font-medium ${
                  isActive('/upload')
                    ? 'border-white text-white'
                    : 'border-transparent text-primary-100 hover:border-primary-300 hover:text-white'
                }`}
              >
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
    <div className="space-y-6">
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
    <div className="space-y-6">
      <FileUpload
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
      />
      {uploadSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
          {uploadSuccess}
        </div>
      )}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {uploadError}
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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

