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

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading file...</p>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <p className="text-red-600">{error || 'File not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{file.filename}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium transition-colors"
            >
              Delete File
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Original Filename</label>
            <p className="text-gray-900 font-medium">{file.original_filename}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">File Type</label>
            <p className="text-gray-900 font-medium">{file.file_type.toUpperCase()}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">File Size</label>
            <p className="text-gray-900 font-medium">{formatFileSize(file.file_size)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Total Features</label>
            <p className="text-gray-900 font-medium">{file.total_features.toLocaleString()}</p>
          </div>
          {file.state && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">State</label>
              <p className="text-gray-900 font-medium">{file.state}</p>
            </div>
          )}
          {file.district && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">District</label>
              <p className="text-gray-900 font-medium">{file.district}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Uploaded</label>
            <p className="text-gray-900 font-medium">{new Date(file.created_at).toLocaleString()}</p>
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

