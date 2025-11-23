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
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-luxury p-12 border border-white/50">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
          <p className="mt-6 text-gray-700 font-semibold text-lg">Loading feature...</p>
        </div>
      </div>
    );
  }

  if (error || !feature) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-luxury p-8 border border-red-200/50">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 font-semibold text-lg mb-4">{error || 'Feature not found'}</p>
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
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-luxury p-8 border border-white/50 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-full blur-3xl -z-0"></div>
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Feature Details</h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">View and edit feature information</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200"
            >
              ← Back
            </button>
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-gradient-primary text-white rounded-xl hover:shadow-lg font-bold transition-all duration-200 shadow-md transform hover:-translate-y-0.5"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 font-bold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
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
                  className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 font-bold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-6 relative z-10">
          <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-xl p-5 border border-blue-100/50">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Name</label>
            {isEditing ? (
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white font-semibold text-gray-900 shadow-sm hover:shadow-md transition-all duration-200"
              />
            ) : (
              <p className="text-xl font-bold text-gray-900">{feature.name}</p>
            )}
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-5 border border-gray-200/50">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Feature ID</label>
            <p className="text-sm text-gray-700 font-mono font-semibold bg-white px-4 py-2 rounded-lg border border-gray-200">{feature.id}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-xl p-5 border border-purple-100/50">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Properties</label>
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
                className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm bg-white shadow-sm hover:shadow-md transition-all duration-200"
                rows={10}
              />
            ) : (
              <pre className="bg-white p-5 rounded-xl overflow-x-auto text-sm font-mono border-2 border-gray-200 shadow-sm">
                {JSON.stringify(feature.properties, null, 2)}
              </pre>
            )}
          </div>

          <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-xl p-5 border border-emerald-100/50">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Location Map</label>
            <div className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg" style={{ width: '100%', height: '400px', overflow: 'hidden' }}>
              <FeatureMap 
                geometry={feature.geometry} 
                featureName={feature.name}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-xl p-5 border border-amber-100/50">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Geometry Type</label>
              <p className="text-sm text-gray-900 font-bold bg-white px-4 py-2 rounded-lg border border-gray-200">{feature.geometry?.type || 'N/A'}</p>
          </div>
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-5 border border-gray-200/50">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Created At</label>
              <p className="text-sm text-gray-700 font-semibold bg-white px-4 py-2 rounded-lg border border-gray-200">
                {new Date(feature.created_at).toLocaleString()}
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-5 border border-gray-200/50">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Updated At</label>
              <p className="text-sm text-gray-700 font-semibold bg-white px-4 py-2 rounded-lg border border-gray-200">
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

