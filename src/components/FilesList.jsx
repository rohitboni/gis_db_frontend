import { useState, useEffect } from 'react';
import { filesApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

const FilesList = ({ filters = {} }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading && files.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading files...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadFiles}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <p className="text-gray-600">No files found. Upload a file to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {files.map((file) => (
        <div
          key={file.id}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-1">{file.filename}</h3>
              <p className="text-sm text-gray-500">{file.original_filename}</p>
            </div>
            <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
              {file.file_type.toUpperCase()}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            {file.state && (
              <div className="flex items-center text-sm">
                <span className="text-gray-600 w-20">State:</span>
                <span className="font-medium text-gray-900">{file.state}</span>
              </div>
            )}
            {file.district && (
              <div className="flex items-center text-sm">
                <span className="text-gray-600 w-20">District:</span>
                <span className="font-medium text-gray-900">{file.district}</span>
              </div>
            )}
            <div className="flex items-center text-sm">
              <span className="text-gray-600 w-20">Features:</span>
              <span className="font-medium text-gray-900">{file.total_features.toLocaleString()}</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-gray-600 w-20">Size:</span>
              <span className="font-medium text-gray-900">{formatFileSize(file.file_size)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <span className="text-xs text-gray-500">
              {new Date(file.created_at).toLocaleDateString()}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/files/${file.id}`)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium text-sm transition-colors"
              >
                View Features
              </button>
              <button
                onClick={() => handleDelete(file.id, file.filename)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium text-sm transition-colors"
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

