import { useState, useEffect, useCallback } from 'react';
import MapBoxMap from './MapBoxMap';
import { FeatureSummaryPanel } from './FeatureSummaryPanel';

interface LandUseLegendItem {
  swahili: string;
  english: string;
  hex: string;
}

import {
  tanzaniaLandUseLegend,
  tanzaniaRegionLandUse,
  tanzaniaDistrictLandUse,
  tanzaniaWardLandUse,
  tanzaniaVillageLandUse,
  tanzaniaRegionAreas,
  tanzaniaDistrictAreas,
  tanzaniaWardAreas,
  tanzaniaVillageAreas,
  getNationalLandUseTotals
} from '@/data/tanzaniaLandUseData';

const TanzaniaMapDashboard = () => {
  // Add viewport height CSS variable for more reliable full-height layouts
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVH();
    window.addEventListener('resize', setVH);
    return () => window.removeEventListener('resize', setVH);
  }, []);
  // State for selected features
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedLandUseType, setSelectedLandUseType] = useState<string | null>(null);

  // Map state
  const [activeLayers, setActiveLayers] = useState({
    regions: true,
    districts: false,
    wards: false,
    villages: false
  });
  const [layerData, setLayerData] = useState<{[key: string]: any}>({
    regions: null,
    districts: null,
    wards: null,
    villages: null
  });

  // Handle feature click with better debugging
  const handleFeatureClick = useCallback((name: string, type: string, properties: any) => {
    console.log('=== DASHBOARD FEATURE CLICK ===');
    console.log('Clicked:', { name, type, properties });
    console.log('Current state:', { selectedFeature, selectedType });
    
    // Always update selection, this ensures the selectedType is accurate
    if (name === selectedFeature && type === selectedType) {
      console.log('Deselecting feature');
      setSelectedFeature(null);
      setSelectedType(null);
      setSelectedLandUseType(null);
    } else {
      console.log('Selecting new feature:', { name, type });
      // Set both at the same time to avoid render issues
      setSelectedFeature(name);
      setSelectedType(type);
      setSelectedLandUseType(null);
    }
    console.log('=== END DASHBOARD FEATURE CLICK ===');
  }, [selectedFeature, selectedType]);

  // Debug effect to track state changes
  useEffect(() => {
    console.log('=== DASHBOARD STATE CHANGE ===');
    console.log('Selected Feature:', selectedFeature);
    console.log('Selected Type:', selectedType);
    console.log('Active Layers:', activeLayers);
    console.log('=== END DASHBOARD STATE CHANGE ===');
  }, [selectedFeature, selectedType, activeLayers]);

  // Load initial regions data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('Attempting to fetch regions data...');
        const response = await fetch('https://raw.githubusercontent.com/Heed725/Tanzania_Adm_Geojson/main/Regions.geojson');
        if (!response.ok) throw new Error('Failed to load regions data');
        const data = await response.json();
        if (!data.features || data.features.length === 0) {
          throw new Error('No features found in regions data');
        }
        
        console.log('Loaded regions data:', data);
        
        // Log the first feature to see what properties we have
        console.log('First feature properties:', data.features[0]?.properties);
        
        // Ensure each feature has the required properties
        const processedData = {
          ...data,
          features: data.features.map((feature: any, index: number) => {
            const name = feature.properties.Region_Nam || 
                        feature.properties.Region || 
                        feature.properties.NAME_1 || 
                        feature.properties.name || 
                        `Region ${index}`;
            return {
              ...feature,
              id: name,
              properties: {
                ...feature.properties,
                name: name,
                type: 'regions'
              }
            };
          })
        };
        
        console.log('Processed regions data:', processedData);
        
        setLayerData(prev => ({
          ...prev,
          regions: processedData
        }));
      } catch (error) {
        console.error('Error loading regions:', error);
        // Ensure layers are disabled if load fails
        setActiveLayers(prev => ({
          ...prev,
          regions: false
        }));
      }
    };

    loadInitialData();
  }, []);

  // Load layer data
  const loadLayerData = async (layerName: keyof typeof activeLayers) => {
    const githubUrls = {
      regions: "https://raw.githubusercontent.com/Heed725/Tanzania_Adm_Geojson/main/Regions.geojson",
      districts: "https://raw.githubusercontent.com/Heed725/Tanzania_Adm_Geojson/main/District_Unsegmented.geojson",
      wards: "https://raw.githubusercontent.com/Heed725/Tanzania_Adm_Geojson/main/Wards.geojson",
      villages: "https://raw.githubusercontent.com/Heed725/Tanzania_Adm_Geojson/main/Villages.geojson"
    };

    console.log(`Fetching ${layerName} data from ${githubUrls[layerName]}`);
    
    const response = await fetch(githubUrls[layerName]);
    if (!response.ok) {
      console.error(`Failed to load ${layerName} data:`, response.statusText);
      throw new Error(`Failed to load ${layerName} data: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Loaded ${layerName} data:`, {
      featureCount: data.features?.length,
      firstFeature: data.features?.[0]
    });

    if (!data.features || data.features.length === 0) {
      throw new Error(`No features found in ${layerName} data`);
    }

    // Ensure each feature has a unique ID, name, and type property
    data.features = data.features.map((feature: any, index: number) => {
      let name = '';
      switch (layerName) {
        case 'regions':
          name = feature.properties.Region_Nam || 
                 feature.properties.Region || 
                 feature.properties.NAME_1 || 
                 feature.properties.name || 
                 `Region ${index}`;
          break;
        case 'districts':
          name = feature.properties.DCouncil_N || 
                 feature.properties.District_N ||
                 feature.properties.District ||
                 feature.properties.name ||
                 `District ${index}`;
          break;
        case 'wards':
          name = feature.properties.Ward_Name || 
                 feature.properties.Ward ||
                 feature.properties.name ||
                 `Ward ${index}`;
          break;
        case 'villages':
          name = feature.properties.Village_Na ||
                 feature.properties.Village ||
                 feature.properties.name ||
                 `Village ${index}`;
          break;
      }
      return {
        ...feature,
        id: name,
        properties: {
          ...feature.properties,
          id: name,
          name: name,
          type: layerName
        }
      };
    });

    return data;
  };

  const handleLayerToggle = async (layerName: keyof typeof activeLayers) => {
    console.log(`Handling layer toggle for ${layerName}. Current state:`, {
      hasData: !!layerData[layerName],
      isActive: activeLayers[layerName]
    });

    // Clear selection when toggling layers
    setSelectedFeature(null);
    setSelectedType(null);
    setSelectedLandUseType(null);

    // If we already have the data, just toggle visibility
    if (layerData[layerName]) {
      console.log(`${layerName} data already loaded, toggling visibility`);
      setActiveLayers(prev => ({
        ...prev,
        [layerName]: !prev[layerName]
      }));
      return;
    }

    // If we need to load the data
    try {
      console.log(`Starting load of ${layerName} data...`);
      const data = await loadLayerData(layerName);
      
      if (!data.features?.length) {
        throw new Error(`No features found in ${layerName} data`);
      }

      console.log(`Successfully loaded ${layerName} data:`, {
        featureCount: data.features.length,
        firstFeatureName: data.features[0]?.properties?.name,
        hasGeometry: !!data.features[0]?.geometry
      });

      // Update layer data and enable the layer
      setLayerData(prev => ({
        ...prev,
        [layerName]: data
      }));

      // Ensure the layer is visible after loading
      setActiveLayers(prev => ({
        ...prev,
        [layerName]: true
      }));

    } catch (error) {
      console.error(`Error loading ${layerName}:`, error);
      setActiveLayers(prev => ({
        ...prev,
        [layerName]: false
      }));
      setLayerData(prev => ({
        ...prev,
        [layerName]: null
      }));
    }
  };

  const renderNationalLandUseSummary = (landUseType: string) => {
    const { totals } = getNationalLandUseTotals();
    const data = (totals as Record<string, any>)[landUseType];
    const legend = tanzaniaLandUseLegend.find((lu) => lu.swahili === landUseType);

    return (
      <div>
        <div className="font-semibold mb-1 text-muted-foreground">
          National Summary for {legend?.english || landUseType}
        </div>
        <table className="w-full text-xs border rounded overflow-hidden mb-2">
          <thead>
            <tr className="bg-muted text-foreground">
              <th className="px-2 py-1 text-left">Type</th>
              <th className="px-2 py-1 text-left">% of Tanzania</th>
              <th className="px-2 py-1 text-left">Area (ha)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-2 py-1 flex items-center gap-2">
                <span
                  style={{
                    background: legend?.hex,
                    width: 14,
                    height: 14,
                    display: 'inline-block',
                    borderRadius: 2,
                    border: '1px solid #ccc',
                  }}
                ></span>
                {legend?.english}
              </td>
              <td className="px-2 py-1">{data ? data.percent + '%' : '-'}</td>
              <td className="px-2 py-1">{data ? data.hectares.toLocaleString() : '-'}</td>
            </tr>
          </tbody>
        </table>
        <div className="text-xs text-muted-foreground">
          Percent and area (ha) are mock or null if not available.
        </div>
      </div>
    );
  };

  const renderLandUseBreakdown = (name: string, type: string) => {
    let landUseData: Record<string, Record<string, number>>;
    let areaData: Record<string, number>;
    
    switch (type) {
      case 'regions':
        landUseData = tanzaniaRegionLandUse;
        areaData = tanzaniaRegionAreas;
        break;
      case 'districts':
        landUseData = tanzaniaDistrictLandUse;
        areaData = tanzaniaDistrictAreas;
        break;
      case 'wards':
        landUseData = tanzaniaWardLandUse;
        areaData = tanzaniaWardAreas;
        break;
      case 'villages':
        landUseData = tanzaniaVillageLandUse;
        areaData = tanzaniaVillageAreas;
        break;
      default:
        return null;
    }

    const featureLU = name in landUseData ? landUseData[name] : {};
    const totalHa = name in areaData ? areaData[name] : null;

    const typeLabel = type === 'regions' ? 'region' :
                    type === 'districts' ? 'district' :
                    type === 'wards' ? 'ward' :
                    type === 'villages' ? 'village' : '';

    return (
      <div>
        <div className="font-semibold mb-1 text-muted-foreground">
          Land Use Breakdown for {name}
        </div>
        <div className="text-xs text-blue-600 mb-2">
          Selected: {name} ({typeLabel})
        </div>
        <table className="w-full text-xs border rounded overflow-hidden mb-2">
          <thead>
            <tr className="bg-muted text-foreground">
              <th className="px-2 py-1 text-left">Type</th>
              <th className="px-2 py-1 text-left">% of {typeLabel}</th>
              <th className="px-2 py-1 text-left">Area (ha)</th>
            </tr>
          </thead>
          <tbody>
            {tanzaniaLandUseLegend.map((lu) => {
              const percent = featureLU[lu.swahili] ?? featureLU[lu.swahili.replace(' / ', '_')] ?? null;
              const areaHa =
                percent && totalHa
                  ? ((percent / 100) * totalHa).toLocaleString(undefined, { maximumFractionDigits: 0 })
                  : '';
              return (
                <tr key={lu.swahili} className="border-t">
                  <td className="px-2 py-1 flex items-center gap-2">
                    <span
                      style={{
                        background: lu.hex,
                        width: 14,
                        height: 14,
                        display: 'inline-block',
                        borderRadius: 2,
                        border: '1px solid #ccc',
                      }}
                    ></span>
                    {lu.english}
                  </td>
                  <td className="px-2 py-1">{percent != null ? percent + '%' : '-'}</td>
                  <td className="px-2 py-1">{areaHa}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="text-xs text-muted-foreground">
          Percent and area (ha) are mock or null if not available.
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-[100vh] flex flex-col bg-gray-50 overflow-hidden" style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
      {/* Header */}
      <div className="p-4 bg-white border-b">
        <h1 className="text-2xl font-semibold">Tanzania Land Use Dashboard</h1>
        {/* Debug info */}
        <div className="text-xs text-gray-500 mt-1">
          Selected: {selectedFeature ? `${selectedFeature} (${selectedType})` : 'None'}
        </div>
      </div>

      {/* Main Content - Three Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL - Legend */}
        <div className="w-72 bg-white border-r flex flex-col">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-lg">Legend</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {/* Land Use Types */}
            <div className="mb-6">
              <h4 className="font-medium mb-3 text-sm text-gray-600">Land Use Types</h4>
              {tanzaniaLandUseLegend.map((item: LandUseLegendItem) => (
                <div 
                  key={item.swahili} 
                  className={`flex items-center gap-2 mb-2 hover:bg-gray-100 p-2 rounded cursor-pointer ${
                    selectedLandUseType === item.swahili ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                  onClick={() => {
                    setSelectedLandUseType(item.swahili);
                    setSelectedFeature(null);
                    setSelectedType(null);
                  }}
                >
                  <div
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: item.hex }}
                  />
                  <span className="text-sm">{item.english}</span>
                </div>
              ))}
            </div>

            {/* Administrative Layers */}
            <div>
              <h4 className="font-medium mb-3 text-sm text-gray-600">Administrative Layers</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={activeLayers.regions}
                    onChange={() => handleLayerToggle('regions')}
                    className="rounded border-gray-300"
                  />
                  Regions
                  <span className="text-xs text-green-600">🟢</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={activeLayers.districts}
                    onChange={() => handleLayerToggle('districts')}
                    className="rounded border-gray-300"
                  />
                  District Councils
                  <span className="text-xs text-blue-600">🔵</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={activeLayers.wards}
                    onChange={() => handleLayerToggle('wards')}
                    className="rounded border-gray-300"
                  />
                  Wards
                  <span className="text-xs text-red-600">🔴</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={activeLayers.villages}
                    onChange={() => handleLayerToggle('villages')}
                    className="rounded border-gray-300"
                  />
                  Villages
                  <span className="text-xs text-yellow-600">🟡</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE PANEL - Map */}
        <div className="flex-1 bg-white relative overflow-hidden">
          <div className="absolute inset-0">
            <MapBoxMap
              selectedFeature={selectedFeature}
              selectedType={selectedType}
              activeLayers={activeLayers}
              layerData={layerData}
              onFeatureClick={handleFeatureClick}
            />
          </div>
        </div>

        {/* RIGHT PANEL - Stats */}
        <div className="w-80 bg-white border-l flex flex-col overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="p-4">
              {selectedFeature && selectedType ? (
                <div>
                  {renderLandUseBreakdown(selectedFeature, selectedType)}
                </div>
              ) : selectedLandUseType ? (
                <div>
                  {renderNationalLandUseSummary(selectedLandUseType)}
                </div>
              ) : (
                <FeatureSummaryPanel 
                  selectedFeature={selectedFeature}
                  selectedType={selectedType}
                />
              )}
              {selectedFeature && (
                <button
                  className="mt-3 px-3 py-1.5 rounded-lg bg-gray-100 text-xs font-medium hover:bg-gray-200 w-full transition-all"
                  onClick={() => {
                    console.log('Clear selection button clicked');
                    setSelectedFeature(null);
                    setSelectedType(null);
                    setSelectedLandUseType(null);
                  }}
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TanzaniaMapDashboard;