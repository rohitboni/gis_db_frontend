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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading features...</p>
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
            onClick={loadFeatures}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (features.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <p className="text-gray-600">No features found. Try adjusting your filters or upload a file.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">
          Features ({features.length})
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                District
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Taluk
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Village
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Survey Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {features.map((feature) => (
              <tr key={feature.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{feature.name}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(feature.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {getPropertyValue(feature.properties, 'District_Name')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {getPropertyValue(feature.properties, 'Taluk_Name')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {getPropertyValue(feature.properties, 'Village_Name')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {getPropertyValue(feature.properties, 'Survey_Number')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/features/${feature.id}`)}
                      className="text-primary-600 hover:text-primary-900 font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(feature.id, feature.name)}
                      className="text-red-600 hover:text-red-900 font-medium"
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
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page + 1} ({features.length} items)
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={features.length < limit}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default FeaturesList;

