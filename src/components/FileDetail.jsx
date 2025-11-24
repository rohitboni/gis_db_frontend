import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { filesApi } from '../services/api';
import FeaturesList from './FeaturesList';

const FileDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadFile();
  }, [id]);

  const loadFile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await filesApi.getFile(id);
      setFile(data);
    } catch (err) {
      console.error('Error loading file:', err);
      setError('Failed to load file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${file.filename}"? This will also delete all ${file.total_features} features.`)) {
      return;
    }

    try {
      await filesApi.deleteFile(id);
      navigate('/');
    } catch (err) {
      alert('Failed to delete file. Please try again.');
      console.error('Delete error:', err);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await filesApi.downloadFile(id, 'geojson');
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${file.filename}.geojson`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download file. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-luxury p-12 border border-white/50">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
          <p className="mt-6 text-gray-700 font-semibold text-lg">Loading file...</p>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-luxury p-8 border border-red-200/50">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 font-semibold text-lg mb-4">{error || 'File not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-primary text-white rounded-xl hover:shadow-lg font-semibold transition-all duration-200 shadow-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* File Summary Card */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-luxury p-8 border border-white/50 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-500/10 to-primary-500/10 rounded-full blur-3xl -z-0"></div>
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{file.filename}</h2>
            <p className="text-sm text-gray-500 font-medium">Download as GeoJSON format</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200"
            >
              ← Back
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-6 py-3 bg-gradient-accent text-white rounded-xl hover:opacity-90 font-bold transition-all duration-200 shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {downloading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download GeoJSON</span>
                </>
              )}
            </button>
            <button
              onClick={handleDelete}
              className="px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 font-bold transition-all duration-200 shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-5 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Original Filename</label>
            <p className="text-gray-900 font-bold text-sm break-words">{file.original_filename}</p>
          </div>
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-5 border border-primary-200/50 shadow-sm hover:shadow-md transition-all duration-200">
            <label className="block text-xs font-bold text-primary-600 uppercase tracking-wide mb-3">File Type</label>
            <p className="text-primary-900 font-bold text-sm">{file.file_type.toUpperCase()}</p>
          </div>
          <div className="bg-gradient-to-br from-accent-50 to-accent-50 rounded-xl p-5 border border-accent-200/50 shadow-sm hover:shadow-md transition-all duration-200">
            <label className="block text-xs font-bold text-accent-600 uppercase tracking-wide mb-3">File Size</label>
            <p className="text-accent-900 font-bold text-sm">{formatFileSize(file.file_size)}</p>
          </div>
          <div className="bg-gradient-to-br from-accent-50 to-accent-50 rounded-xl p-5 border border-accent-200/50 shadow-sm hover:shadow-md transition-all duration-200">
            <label className="block text-xs font-bold text-accent-600 uppercase tracking-wide mb-3">Total Features</label>
            <p className="text-accent-900 font-bold text-sm">{file.total_features.toLocaleString()}</p>
          </div>
          {file.state && (
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200/50 shadow-sm hover:shadow-md transition-all duration-200">
              <label className="block text-xs font-bold text-blue-600 uppercase tracking-wide mb-3">State</label>
              <p className="text-blue-900 font-bold text-sm">{file.state}</p>
            </div>
          )}
          {file.district && (
            <div className="bg-gradient-to-br from-primary-50 to-pink-50 rounded-xl p-5 border border-primary-200/50 shadow-sm hover:shadow-md transition-all duration-200">
              <label className="block text-xs font-bold text-primary-600 uppercase tracking-wide mb-3">District</label>
              <p className="text-primary-900 font-bold text-sm">{file.district}</p>
            </div>
          )}
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-5 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Uploaded</label>
            <p className="text-gray-900 font-bold text-sm">{new Date(file.created_at).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Features List */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Features in this file</h3>
        <FeaturesList fileId={id} />
      </div>
    </div>
  );
};

export default FileDetail;

