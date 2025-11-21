import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { featuresApi } from '../services/api';
import FeatureMap from './FeatureMap';

const FeatureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [feature, setFeature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    properties: {},
  });

  useEffect(() => {
    loadFeature();
  }, [id]);

  const loadFeature = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await featuresApi.getFeature(id);
      setFeature(data);
      setEditData({
        name: data.name,
        properties: data.properties || {},
      });
    } catch (err) {
      console.error('Error loading feature:', err);
      setError('Failed to load feature. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const updated = await featuresApi.updateFeature(id, editData);
      setFeature(updated);
      setIsEditing(false);
    } catch (err) {
      alert('Failed to update feature. Please try again.');
      console.error('Update error:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${feature.name}"?`)) {
      return;
    }

    try {
      await featuresApi.deleteFeature(id);
      navigate('/');
    } catch (err) {
      alert('Failed to delete feature. Please try again.');
      console.error('Delete error:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading feature...</p>
        </div>
      </div>
    );
  }

  if (error || !feature) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <p className="text-red-600">{error || 'Feature not found'}</p>
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Feature Details</h2>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium transition-colors"
            >
              Back
            </button>
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium transition-colors"
                >
                  Delete
                </button>
              </>
            )}
            {isEditing && (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditData({ name: feature.name, properties: feature.properties || {} });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition-colors"
                >
                  Save
                </button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            {isEditing ? (
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            ) : (
              <p className="text-lg font-semibold text-gray-900">{feature.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
            <p className="text-sm text-gray-600 font-mono">{feature.id}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Properties</label>
            {isEditing ? (
              <textarea
                value={JSON.stringify(editData.properties, null, 2)}
                onChange={(e) => {
                  try {
                    setEditData({ ...editData, properties: JSON.parse(e.target.value) });
                  } catch (err) {
                    // Invalid JSON, but allow typing
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                rows={10}
              />
            ) : (
              <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm">
                {JSON.stringify(feature.properties, null, 2)}
              </pre>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location Map</label>
            <div className="border border-gray-300 rounded-md" style={{ width: '100%', height: '384px', overflow: 'hidden' }}>
              <FeatureMap 
                geometry={feature.geometry} 
                featureName={feature.name}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Geometry Type</label>
            <p className="text-sm text-gray-900">{feature.geometry?.type || 'N/A'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
              <p className="text-gray-600">
                {new Date(feature.created_at).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
              <p className="text-gray-600">
                {new Date(feature.updated_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureDetail;

