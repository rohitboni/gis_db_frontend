import { useState } from 'react';
import { filesApi } from '../services/api';

const BatchDownload = ({ filters = {} }) => {
  const [merge, setMerge] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  const handleBatchDownload = async () => {
    if (!filters.state && !filters.district) {
      setError('Please select at least a state or district to download files.');
      setTimeout(() => setError(null), 5000);
      return;
    }

    setDownloading(true);
    setError(null);

    try {
      const params = {
        format: 'geojson',
        merge,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== null && v !== '')
        ),
      };

      const blob = await filesApi.downloadBatch(params);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Create filename based on filters
      let filename = 'batch_download';
      if (filters.state) {
        filename = filters.state.replace(/\s+/g, '_');
      }
      if (filters.district) {
        filename += `_${filters.district.replace(/\s+/g, '_')}`;
      }
      
      const extension = merge ? '.geojson' : '.zip';
      link.download = `${filename}${extension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Batch download error:', err);
      setError('Failed to download files. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setDownloading(false);
    }
  };

  const hasFilters = filters.state || filters.district;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <h3 className="text-lg font-bold text-gray-800">Batch Download</h3>
      </div>
      
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 text-red-800 px-4 py-3 rounded-md animate-fade-in">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={merge}
              onChange={(e) => setMerge(e.target.checked)}
              disabled={downloading}
              className="mt-0.5 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-800 block">
                Merge all files into one
              </span>
              <p className="text-xs text-gray-600 mt-1">
                {merge 
                  ? 'All files will be combined into a single GeoJSON file with all features merged.'
                  : 'Files will be downloaded as separate GeoJSON files in a ZIP archive.'}
              </p>
            </div>
          </label>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <p className="text-sm font-semibold text-gray-700">
              Current Filters
            </p>
          </div>
          <div className="space-y-2 text-sm">
            {filters.state && (
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">State</span>
                <span className="text-gray-800 font-medium">{filters.state}</span>
              </div>
            )}
            {filters.district && (
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">District</span>
                <span className="text-gray-800 font-medium">{filters.district}</span>
              </div>
            )}
            {!hasFilters && (
              <p className="text-gray-500 italic text-xs">
                Select a state or district from the browser above to download files.
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleBatchDownload}
          disabled={downloading || !hasFilters}
          className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md flex items-center justify-center gap-2"
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
              <span>Download All Files as GeoJSON</span>
            </>
          )}
        </button>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs text-green-800 text-center leading-relaxed">
            <span className="font-semibold">✓ No data loss:</span> All geometry and properties are preserved during conversion to GeoJSON format.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BatchDownload;

