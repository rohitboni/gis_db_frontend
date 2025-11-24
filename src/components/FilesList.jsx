import { useState, useEffect } from 'react';
import { filesApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

const FilesList = ({ filters = {} }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    loadFiles();
  }, [filters]);

  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== null && v !== '')
        ),
      };
      const data = await filesApi.getFiles(params);
      setFiles(data);
    } catch (err) {
      console.error('Error loading files:', err);
      setError('Failed to load files. Please try again.');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, filename) => {
    if (!window.confirm(`Are you sure you want to delete "${filename}"? This will also delete all features in this file.`)) {
      return;
    }

    try {
      await filesApi.deleteFile(id);
      loadFiles();
    } catch (err) {
      alert('Failed to delete file. Please try again.');
      console.error('Delete error:', err);
    }
  };

  const handleDownload = async (file) => {
    setDownloading({ ...downloading, [file.id]: true });

    try {
      const blob = await filesApi.downloadFile(file.id, 'geojson');
      
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
      setDownloading({ ...downloading, [file.id]: false });
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading && files.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-luxury p-12 border border-white/50">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-700"></div>
          <p className="mt-6 text-gray-700 font-semibold text-lg">Loading files...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-luxury p-8 border border-red-200/50">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 font-semibold text-lg mb-4">{error}</p>
          <button
            onClick={loadFiles}
            className="px-6 py-3 bg-gradient-primary text-white rounded-xl hover:shadow-lg font-semibold transition-all duration-200 shadow-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-luxury p-12 border border-white/50">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-700 font-semibold text-lg mb-2">No files found</p>
          <p className="text-gray-500 text-sm">Upload a file to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      {files.map((file) => (
        <div
          key={file.id}
          className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-luxury hover:shadow-luxury-lg transition-all duration-300 p-6 border border-white/50 hover:border-primary-200/50 flex flex-col min-h-[340px] relative overflow-hidden"
        >
          {/* Decorative gradient overlay */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-300/5 to-primary-400/5 rounded-full blur-3xl -z-0"></div>
          
          {/* Header Section */}
          <div className="flex items-start justify-between mb-5 pb-4 border-b border-gray-200/60 relative z-10">
            <div className="flex-1 min-w-0 pr-3">
              <h3 className="text-xl font-bold text-gray-900 mb-1.5 leading-tight break-words group-hover:text-primary-700 transition-colors">{file.filename}</h3>
              <p className="text-xs text-gray-500 break-words font-medium">{file.original_filename}</p>
            </div>
            <span className="px-4 py-2 bg-gradient-accent text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-lg border-2 border-accent-400/30 flex-shrink-0 relative z-10 flex items-center justify-center min-w-[70px]">
              {file.file_type.toUpperCase()}
            </span>
          </div>

          {/* Data Details Section */}
          <div className="space-y-3.5 mb-6 flex-1 relative z-10">
            {file.state && (
              <div className="flex items-center text-sm bg-gradient-to-r from-primary-50/50 to-primary-100/50 rounded-lg px-3 py-2 border border-primary-200/50">
                <svg className="w-4 h-4 text-primary-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-600 w-16 flex-shrink-0 text-xs font-medium">State:</span>
                <span className="font-bold text-gray-900 text-sm break-words">{file.state}</span>
              </div>
            )}
            {file.district && (
              <div className="flex items-center text-sm bg-gradient-to-r from-primary-50/50 to-primary-100/50 rounded-lg px-3 py-2 border border-primary-200/50">
                <svg className="w-4 h-4 text-primary-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-gray-600 w-16 flex-shrink-0 text-xs font-medium">District:</span>
                <span className="font-bold text-gray-900 text-sm break-words">{file.district}</span>
              </div>
            )}
            <div className="flex items-center text-sm bg-gradient-to-r from-accent-50/50 to-accent-100/50 rounded-lg px-3 py-2 border border-accent-200/50">
              <svg className="w-4 h-4 text-accent-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-gray-600 w-20 flex-shrink-0 text-xs font-medium">Features:</span>
              <span className="font-bold text-gray-900 text-sm">{file.total_features.toLocaleString()}</span>
            </div>
            <div className="flex items-center text-sm bg-gradient-to-r from-accent-50/50 to-accent-100/50 rounded-lg px-3 py-2 border border-accent-200/50">
              <svg className="w-4 h-4 text-accent-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              <span className="text-gray-600 w-20 flex-shrink-0 text-xs font-medium">Size:</span>
              <span className="font-bold text-gray-900 text-sm">{formatFileSize(file.file_size)}</span>
            </div>
          </div>

          {/* Action Section - Fixed at bottom */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200/60 mt-auto relative z-10">
            <span className="text-xs text-gray-500 font-medium">
              {new Date(file.created_at).toLocaleDateString()}
            </span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => navigate(`/files/${file.id}`)}
                className="px-4 py-2 bg-gradient-primary text-white rounded-lg hover:opacity-90 font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                View
              </button>
              <button
                onClick={() => handleDownload(file)}
                disabled={downloading[file.id]}
                className="px-4 py-2 bg-gradient-accent text-white rounded-lg hover:opacity-90 font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {downloading[file.id] ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download</span>
                  </>
                )}
              </button>
              <button
                onClick={() => handleDelete(file.id, file.filename)}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FilesList;

