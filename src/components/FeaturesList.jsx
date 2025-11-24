import { useState, useEffect, useRef, useCallback } from 'react';
import { featuresApi, filesApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

const FeaturesList = ({ filters = {}, fileId = null }) => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [limit] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);
  const filtersStringRef = useRef(JSON.stringify(filters));

  // Debounce filters (only if not viewing a specific file)
  useEffect(() => {
    if (!fileId) {
      const currentFiltersString = JSON.stringify(filters);
      if (filtersStringRef.current !== currentFiltersString) {
        filtersStringRef.current = currentFiltersString;
        setPage(0); // Reset to first page when filters change
      }
    }
  }, [filters, fileId]);

  useEffect(() => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    // Debounce the request
    const timeoutId = setTimeout(() => {
      loadFeatures(abortController.signal);
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(timeoutId);
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersStringRef.current, page, fileId]);

  const loadFeatures = async (signal) => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (fileId) {
        // Load features for specific file
        const params = {
          skip: page * limit,
          limit,
          include_geometry: false,
        };
        data = await filesApi.getFileFeatures(fileId, params, { signal });
      } else {
        // Load features with filters
        const currentFilters = JSON.parse(filtersStringRef.current || '{}');
        const params = {
          skip: page * limit,
          limit,
          ...Object.fromEntries(
            Object.entries(currentFilters).filter(([_, v]) => v !== null && v !== '')
          ),
        };
        data = await featuresApi.getFeatures(params, { signal });
      }
      
      if (!signal?.aborted) {
        setFeatures(data);
        setTotalCount(data.length);
      }
    } catch (err) {
      if (err.name === 'AbortError' || err.name === 'CanceledError') {
        // Request was canceled, ignore
        return;
      }
      console.error('Error loading features:', err);
      if (!signal?.aborted) {
        setError('Failed to load features. Please try again.');
        setFeatures([]);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await featuresApi.deleteFeature(id);
      loadFeatures();
    } catch (err) {
      alert('Failed to delete feature. Please try again.');
      console.error('Delete error:', err);
    }
  };

  const getPropertyValue = (properties, key) => {
    return (
      properties?.[key] ||
      properties?.[key.toLowerCase()] ||
      properties?.[key.toUpperCase()] ||
      'N/A'
    );
  };

  if (loading && features.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-luxury p-12 border border-white/50">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
          <p className="mt-6 text-gray-700 font-semibold text-lg">Loading features...</p>
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
            onClick={loadFeatures}
            className="px-6 py-3 bg-gradient-primary text-white rounded-xl hover:shadow-lg font-semibold transition-all duration-200 shadow-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (features.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-luxury p-12 border border-white/50">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-700 font-semibold text-lg mb-2">No features found</p>
          <p className="text-gray-500 text-sm">Try adjusting your filters or upload a file</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-luxury overflow-hidden border border-white/50">
      <div className="px-6 py-5 border-b border-gray-200/60 bg-gradient-to-r from-gray-50/50 to-slate-50/50">
        <h2 className="text-2xl font-bold text-gray-900">
          Features <span className="text-primary-600">({features.length})</span>
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200/60">
          <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                District
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Taluk
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Village
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Survey Number
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200/60">
            {features.map((feature) => (
              <tr key={feature.id} className="hover:bg-gradient-to-r hover:from-primary-50/30 hover:to-primary-50/30 transition-all duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">{feature.name}</div>
                  <div className="text-xs text-gray-500 font-medium">
                    {new Date(feature.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-medium">
                    {getPropertyValue(feature.properties, 'District_Name')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-medium">
                    {getPropertyValue(feature.properties, 'Taluk_Name')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-medium">
                    {getPropertyValue(feature.properties, 'Village_Name')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-medium">
                    {getPropertyValue(feature.properties, 'Survey_Number')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/features/${feature.id}`)}
                      className="text-primary-600 hover:text-primary-800 font-semibold transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(feature.id, feature.name)}
                      className="text-red-600 hover:text-red-800 font-semibold transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {features.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200/60 bg-gradient-to-r from-gray-50/50 to-slate-50/50 flex items-center justify-between">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-700 font-semibold">
            Page {page + 1} <span className="text-gray-500">({features.length} items)</span>
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={features.length < limit}
            className="px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default FeaturesList;

