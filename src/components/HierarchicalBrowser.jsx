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
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || isLoading}
        className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed font-medium"
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Browse by Location</h2>
        {(selectedState || selectedDistrict || selectedTaluk || selectedVillage) && (
          <button
            onClick={handleClear}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

