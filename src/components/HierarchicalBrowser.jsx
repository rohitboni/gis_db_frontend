import { useState, useEffect } from 'react';
import { filesApi } from '../services/api';

const HierarchicalBrowser = ({ onFilterChange }) => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [taluks, setTaluks] = useState([]);
  const [villages, setVillages] = useState([]);

  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTaluk, setSelectedTaluk] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');

  const [loading, setLoading] = useState({
    states: false,
    districts: false,
    taluks: false,
    villages: false,
  });

  useEffect(() => {
    loadStates();
  }, []);

  useEffect(() => {
    if (selectedState) {
      loadDistricts(selectedState);
    } else {
      setDistricts([]);
      setSelectedDistrict('');
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedDistrict) {
      loadTaluks(selectedDistrict);
    } else {
      setTaluks([]);
      setSelectedTaluk('');
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedTaluk || selectedDistrict) {
      loadVillages(selectedDistrict, selectedTaluk);
    } else {
      setVillages([]);
      setSelectedVillage('');
    }
  }, [selectedDistrict, selectedTaluk]);

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        state: selectedState || null,
        district: selectedDistrict || null,
        taluk: selectedTaluk || null,
        village: selectedVillage || null,
      });
    }
  }, [selectedState, selectedDistrict, selectedTaluk, selectedVillage, onFilterChange]);

  const loadStates = async () => {
    setLoading((prev) => ({ ...prev, states: true }));
    try {
      const data = await filesApi.getStates();
      setStates(data);
    } catch (error) {
      console.error('Error loading states:', error);
    } finally {
      setLoading((prev) => ({ ...prev, states: false }));
    }
  };

  const loadDistricts = async (state) => {
    setLoading((prev) => ({ ...prev, districts: true }));
    try {
      const data = await filesApi.getDistricts(state);
      setDistricts(data);
    } catch (error) {
      console.error('Error loading districts:', error);
      setDistricts([]);
    } finally {
      setLoading((prev) => ({ ...prev, districts: false }));
    }
  };

  // Taluks and villages not needed for file browsing, but keeping for consistency
  const loadTaluks = async (district) => {
    setLoading((prev) => ({ ...prev, taluks: true }));
    try {
      // For now, return empty as files don't have taluk/village
      setTaluks([]);
    } catch (error) {
      console.error('Error loading taluks:', error);
      setTaluks([]);
    } finally {
      setLoading((prev) => ({ ...prev, taluks: false }));
    }
  };

  const loadVillages = async (district, taluk) => {
    setLoading((prev) => ({ ...prev, villages: true }));
    try {
      // For now, return empty as files don't have taluk/village
      setVillages([]);
    } catch (error) {
      console.error('Error loading villages:', error);
      setVillages([]);
    } finally {
      setLoading((prev) => ({ ...prev, villages: false }));
    }
  };

  const handleClear = () => {
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedTaluk('');
    setSelectedVillage('');
    setDistricts([]);
    setTaluks([]);
    setVillages([]);
  };

  const SelectField = ({ label, value, onChange, options, isLoading, disabled }) => (
    <div className="flex-1">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || isLoading}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow-md transition-all duration-200"
      >
        <option value="">All {label}</option>
        {isLoading ? (
          <option disabled>Loading...</option>
        ) : (
          options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))
        )}
      </select>
    </div>
  );

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-luxury p-6 border border-white/50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-full blur-3xl -z-0"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-500/10 to-blue-500/10 rounded-full blur-3xl -z-0"></div>
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl border-2 border-emerald-400/30">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Browse by Location</h2>
            <p className="text-sm text-gray-500 mt-0.5 font-medium">Filter files by geographic location</p>
          </div>
        </div>
        {(selectedState || selectedDistrict || selectedTaluk || selectedVillage) && (
          <button
            onClick={handleClear}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        <SelectField
          label="State"
          value={selectedState}
          onChange={setSelectedState}
          options={states}
          isLoading={loading.states}
        />
        <SelectField
          label="District"
          value={selectedDistrict}
          onChange={setSelectedDistrict}
          options={districts}
          isLoading={loading.districts}
          disabled={!selectedState}
        />
        <SelectField
          label="Taluk"
          value={selectedTaluk}
          onChange={setSelectedTaluk}
          options={taluks}
          isLoading={loading.taluks}
          disabled={!selectedDistrict}
        />
        <SelectField
          label="Village"
          value={selectedVillage}
          onChange={setSelectedVillage}
          options={villages}
          isLoading={loading.villages}
          disabled={!selectedDistrict && !selectedTaluk}
        />
      </div>
    </div>
  );
};

export default HierarchicalBrowser;

