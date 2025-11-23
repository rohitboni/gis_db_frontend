import { useState } from 'react';
import { filesApi } from '../services/api';

// All Indian States and Union Territories in correct order
const INDIAN_STATES_AND_UTS = [
  // States (28)
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  // Union Territories (8)
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

const FileUpload = ({ onUploadSuccess, onUploadError }) => {
  const [file, setFile] = useState(null);
  const [selectedState, setSelectedState] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedState) {
      // Only allow file selection if state is selected
      setFile(selectedFile);
      setUploadProgress(0);
    } else if (selectedFile && !selectedState) {
      // If file selected but no state, clear it
      return;
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (!selectedState) {
      return; // Don't allow file drop if no state selected
    }
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInputChange = (e) => {
    if (!selectedState) {
      e.target.value = ''; // Clear file input if no state selected
      return;
    }
    handleFileSelect(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    
    if (!selectedState) {
      if (onUploadError) {
        onUploadError('Please select a state before uploading.');
      }
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);

    try {
      const result = await filesApi.uploadFile(
        file, 
        selectedState, 
        null, 
        (progress) => {
          // Update progress as file uploads
          setUploadProgress(progress);
        }
      );
      // Upload complete - set all states immediately
      setIsUploading(false);
      setUploadProgress(100);
      setUploadSuccess(true);
      
      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
      
      // Reset to normal state after showing success animation for 3 seconds
      // Clear file but keep state selected for next upload
      setTimeout(() => {
        setIsUploading(false); // Ensure it's false
        setFile(null);
        setUploadProgress(0);
        setUploadSuccess(false);
        // Keep selectedState so user can upload another file for the same state
      }, 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      setUploadProgress(0);
      setUploadSuccess(false);
      if (onUploadError) {
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
          onUploadError(`Upload timeout. The file (${fileSizeMB} MB) may be too large or your connection is slow. Please try again with a stable connection.`);
        } else if (error.message.includes('maxBodyLength') || error.message.includes('Request body larger')) {
          onUploadError('File is too large. Maximum file size may be limited. Please contact support.');
        } else {
          onUploadError(error.response?.data?.detail || error.message || 'Upload failed. Please try again.');
        }
      }
    }
  };

  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const types = {
      geojson: 'GeoJSON',
      json: 'JSON',
      kml: 'KML',
      kmz: 'KMZ',
      shp: 'Shapefile',
      zip: 'ZIP (Shapefile)',
      gpx: 'GPX',
      csv: 'CSV',
    };
    return types[ext] || ext.toUpperCase();
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-luxury p-8 border border-white/50 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-full blur-3xl -z-0"></div>
      
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Upload Geographic File</h2>
          <p className="text-sm text-gray-500 mt-1">Upload and manage your GIS data files</p>
        </div>
      </div>
      
      {/* State Selection */}
      <div className="mb-6 relative z-10">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Select State / Union Territory <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedState}
          onChange={(e) => {
            const newState = e.target.value;
            setSelectedState(newState);
            // Clear file if state is cleared
            if (!newState) {
              setFile(null);
            }
          }}
          disabled={isUploading}
          className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:cursor-not-allowed font-semibold text-base shadow-sm hover:shadow-md transition-all duration-200"
        >
          <option value="">-- Select State / Union Territory --</option>
          {INDIAN_STATES_AND_UTS.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-gray-500 font-medium">
          You must select a state before uploading a file. All features in this file will be associated with the selected state.
        </p>
      </div>
      
      {!selectedState && (
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center bg-gradient-to-br from-gray-50 to-gray-100/50 opacity-70 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-24 h-24 bg-gray-200 rounded-2xl flex items-center justify-center">
              <svg
                  className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              </div>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-700">
                Please select a state first
              </p>
              <p className="text-sm text-gray-600 mt-2 font-medium">
                Choose a state or union territory from the dropdown above to enable file upload
              </p>
            </div>
          </div>
        </div>
      )}
      
      {selectedState && (
        <div
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 relative z-10 ${
            isDragging
              ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-purple-50 shadow-lg scale-[1.02]'
              : uploadSuccess
              ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg'
              : file
              ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50 shadow-md'
              : 'border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50 hover:border-primary-400 hover:bg-gradient-to-br hover:from-primary-50 hover:to-indigo-50 hover:shadow-md'
          }`}
          onDragOver={selectedState ? handleDragOver : undefined}
          onDragLeave={selectedState ? handleDragLeave : undefined}
          onDrop={selectedState ? handleDrop : undefined}
        >
        {file ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              {uploadSuccess ? (
                <svg
                  className="w-16 h-16 text-green-500 animate-scale-in"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-16 h-16 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              )}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800">{file.name}</p>
              <p className="text-sm text-gray-600 mt-1">
                {getFileType(file.name)} • {(file.size / 1024 / 1024).toFixed(2)} MB
                {file.size > 50 * 1024 * 1024 && (
                  <span className="ml-2 text-orange-600 font-medium">
                    (Large file - upload may take several minutes)
                  </span>
                )}
              </p>
              {selectedState && (
                <p className="text-sm text-primary-600 mt-1 font-medium">
                  State: {selectedState}
                </p>
              )}
            </div>
            {isUploading && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  Uploading: {uploadProgress}%
                </p>
                <p className="text-xs text-gray-500">
                  Please wait, this may take a while for large files...
                </p>
              </div>
            )}
            {uploadSuccess && uploadProgress === 100 && (
              <div className="w-full space-y-3 animate-fade-in">
                <div className="w-full bg-green-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: '100%', animation: 'slide-in 0.5s ease-out' }}
                  ></div>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{
                      strokeDasharray: 50,
                      strokeDashoffset: 50,
                      animation: 'checkmark 0.6s ease-out forwards'
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <p className="text-green-600 font-semibold text-lg">
                    Upload complete!
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  Your file has been successfully uploaded and processed.
                </p>
              </div>
            )}
            {!uploadSuccess && (
              <div className="flex gap-3 justify-center mt-6">
                <button
                  onClick={() => {
                    setFile(null);
                    setUploadProgress(0);
                    setUploadSuccess(false);
                    // Keep state selected, only clear file
                  }}
                  disabled={isUploading}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200"
                >
                  Clear File
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading || !selectedState}
                  className="px-8 py-3 bg-gradient-primary text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all duration-200 shadow-md hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                >
                  {isUploading ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            )}
            {!selectedState && file && (
              <p className="text-sm text-red-600 mt-2">
                Please select a state before uploading.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <svg
                className="w-20 h-20 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-700">
                Drag and drop your file here
              </p>
              <p className="text-sm text-gray-500 mt-2">or</p>
            </div>
            <label className={`inline-block ${!selectedState ? 'pointer-events-none opacity-50' : ''}`}>
              <input
                type="file"
                className="hidden"
                accept=".geojson,.json,.kml,.kmz,.shp,.zip,.gpx,.csv"
                onChange={handleFileInputChange}
                disabled={!selectedState}
              />
              <span className={`px-6 py-3 rounded-md font-medium inline-block transition-colors ${
                selectedState 
                  ? 'bg-primary-600 text-white hover:bg-primary-700 cursor-pointer' 
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}>
                Browse Files
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-4">
              Supported formats: GeoJSON, JSON, KML, KMZ, Shapefile (ZIP), GPX, CSV
            </p>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default FileUpload;
