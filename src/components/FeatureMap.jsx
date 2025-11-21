import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const FeatureMap = ({ geometry, featureName }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    if (!geometry || !mapRef.current) {
      console.log('FeatureMap: Missing geometry or mapRef', { 
        hasGeometry: !!geometry, 
        hasMapRef: !!mapRef.current,
        geometryType: geometry?.type 
      });
      return;
    }

    let initTimeout;
    let fitTimeout;
    let finalTimeout;

    // Initialize map if it doesn't exist
    if (!mapInstanceRef.current && mapRef.current) {
      console.log('FeatureMap: Initializing new map');
      try {
        // Set a default view (will be updated when geometry loads)
        mapInstanceRef.current = L.map(mapRef.current, {
          zoomControl: true,
          scrollWheelZoom: true,
          worldCopyJump: false,
          center: [20.5937, 78.9629], // Default to India center
          zoom: 5, // Default zoom level
        });

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapInstanceRef.current);
        
        console.log('FeatureMap: Map initialized successfully');
      } catch (error) {
        console.error('FeatureMap: Error initializing map:', error);
        return;
      }
    }

    // Wait a bit to ensure container is rendered and visible before adding geometry
    initTimeout = setTimeout(() => {
      if (!mapRef.current || !mapInstanceRef.current) {
        console.warn('FeatureMap: mapRef or mapInstance is null after timeout');
        return;
      }

      const map = mapInstanceRef.current;
      
      // Invalidate size to ensure map knows its container size
      map.invalidateSize();

      // Remove previous layer if exists
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }

      // Helper function to get geometry center
      const getGeometryCenter = (geom) => {
        if (!geom || !geom.coordinates) return null;
        
        try {
          if (geom.type === 'Point' && geom.coordinates.length >= 2) {
            const [lon, lat] = geom.coordinates;
            return { lat, lon };
          } else if (geom.type === 'Polygon' && geom.coordinates && geom.coordinates.length > 0) {
            // Get first coordinate of first ring
            const firstRing = geom.coordinates[0];
            if (firstRing && firstRing.length > 0) {
              const [lon, lat] = firstRing[0];
              return { lat, lon };
            }
          } else if (geom.type === 'MultiPolygon' && geom.coordinates && geom.coordinates.length > 0) {
            // Get first coordinate of first polygon's first ring
            const firstPolygon = geom.coordinates[0];
            if (firstPolygon && firstPolygon.length > 0) {
              const firstRing = firstPolygon[0];
              if (firstRing && firstRing.length > 0) {
                const [lon, lat] = firstRing[0];
                return { lat, lon };
              }
            }
          }
        } catch (error) {
          console.error('Error getting geometry center:', error);
        }
        return null;
      };

      // Helper function to fit bounds or center on geometry
      const fitMapToGeometry = (geoJsonLayer, geometry) => {
        // Force multiple invalidateSize calls to ensure map knows its container size
        map.invalidateSize();
        
        // Wait a bit for the map to properly render and know its size
        fitTimeout = setTimeout(() => {
          // Invalidate size multiple times to ensure proper sizing
          map.invalidateSize();
          
          setTimeout(() => {
            map.invalidateSize();
            
            try {
              const bounds = geoJsonLayer.getBounds();
              
              console.log('FeatureMap: Bounds from layer:', bounds);
              console.log('FeatureMap: Map container size:', mapRef.current?.offsetWidth, mapRef.current?.offsetHeight);
              
              if (bounds && bounds.isValid()) {
                const southWest = bounds.getSouthWest();
                const northEast = bounds.getNorthEast();
                
                console.log('FeatureMap: Bounds coordinates:', {
                  southWest: { lat: southWest.lat, lng: southWest.lng },
                  northEast: { lat: northEast.lat, lng: northEast.lng }
                });
                
                // Validate coordinates
                if (
                  !isNaN(southWest.lat) && !isNaN(southWest.lng) &&
                  !isNaN(northEast.lat) && !isNaN(northEast.lng) &&
                  isFinite(southWest.lat) && isFinite(southWest.lng) &&
                  isFinite(northEast.lat) && isFinite(northEast.lng)
                ) {
                  // Check if it's a single point (very small area)
                  const latDiff = Math.abs(northEast.lat - southWest.lat);
                  const lngDiff = Math.abs(northEast.lng - southWest.lng);
                  
                  console.log('FeatureMap: Bounds differences:', { latDiff, lngDiff });
                  
                  if (latDiff < 0.000001 && lngDiff < 0.000001) {
                    // Single point - center on it
                    const center = bounds.getCenter();
                    console.log('FeatureMap: Centering on point:', center);
                    map.setView([center.lat, center.lng], 13);
                  } else {
                    // Has area - fit bounds with padding
                    console.log('FeatureMap: Fitting bounds with padding');
                    
                    // Check container size before fitting
                    const containerWidth = mapRef.current?.offsetWidth || 0;
                    const containerHeight = mapRef.current?.offsetHeight || 0;
                    console.log('FeatureMap: Container size when fitting:', containerWidth, containerHeight);
                    
                    if (containerWidth > 0 && containerHeight > 0) {
                      // Ensure map size is valid
                      map.invalidateSize();
                      
                      // Fit bounds with padding
                      map.fitBounds(bounds, {
                        padding: [100, 100], // Increased padding to ensure feature is visible
                        maxZoom: 18,
                      });
                      
                      // After fitting, invalidate size again and refit to ensure proper positioning
                      setTimeout(() => {
                        map.invalidateSize();
                        const newBounds = geoJsonLayer.getBounds();
                        if (newBounds && newBounds.isValid()) {
                          const newSW = newBounds.getSouthWest();
                          const newNE = newBounds.getNorthEast();
                          console.log('FeatureMap: Refitting bounds:', {
                            southWest: { lat: newSW.lat, lng: newSW.lng },
                            northEast: { lat: newNE.lat, lng: newNE.lng }
                          });
                          map.fitBounds(newBounds, {
                            padding: [100, 100],
                            maxZoom: 18,
                          });
                          map.invalidateSize();
                        }
                      }, 300);
                    } else {
                      console.warn('FeatureMap: Container has invalid size, centering on geometry instead');
                      const geom = geometry.type === 'Feature' ? geometry.geometry : geometry;
                      const center = getGeometryCenter(geom);
                      if (center && !isNaN(center.lat) && !isNaN(center.lon)) {
                        map.setView([center.lat, center.lon], 13);
                      }
                    }
                  }
                  
                  return;
                } else {
                  console.warn('FeatureMap: Invalid bounds coordinates:', { southWest, northEast });
                }
              } else {
                console.warn('FeatureMap: Bounds are not valid');
              }
              
              // Fallback: center on geometry coordinates
              const geom = geometry.type === 'Feature' ? geometry.geometry : geometry;
              const center = getGeometryCenter(geom);
              if (center && !isNaN(center.lat) && !isNaN(center.lon)) {
                console.log('FeatureMap: Centering on geometry center:', center);
                map.setView([center.lat, center.lon], 13);
                setTimeout(() => {
                  map.invalidateSize();
                }, 100);
              } else {
                console.warn('FeatureMap: Could not determine center for geometry:', geometry);
              }
            } catch (error) {
              console.error('FeatureMap: Error fitting bounds:', error);
              // Fallback: try to center on geometry
              const geom = geometry.type === 'Feature' ? geometry.geometry : geometry;
              const center = getGeometryCenter(geom);
              if (center && !isNaN(center.lat) && !isNaN(center.lon)) {
                map.setView([center.lat, center.lon], 13);
              }
            }
          }, 100);
        }, 400); // Increased delay to wait for layer to be fully rendered
      };

      // Create GeoJSON layer
      try {
        console.log('FeatureMap: Creating GeoJSON layer with geometry type:', geometry.type);
        
        // Handle different geometry formats
        let geoJsonData;
        if (geometry.type === 'FeatureCollection') {
          geoJsonData = geometry;
        } else if (geometry.type === 'Feature') {
          // Single feature
          geoJsonData = { type: 'FeatureCollection', features: [geometry] };
        } else {
          // It's a geometry object (Point, Polygon, etc.)
          geoJsonData = { 
            type: 'FeatureCollection', 
            features: [{ 
              type: 'Feature', 
              geometry, 
              properties: {} 
            }] 
          };
        }

        const geoJsonLayer = L.geoJSON(geoJsonData, {
          style: (feature) => {
            return {
              color: '#3b82f6', // blue-500
              weight: 3,
              opacity: 0.8,
              fillColor: '#60a5fa', // blue-400
              fillOpacity: 0.3,
            };
          },
          onEachFeature: (feature, layer) => {
            // Add popup with feature name
            if (featureName) {
              layer.bindPopup(`<strong>${featureName}</strong>`);
            }
          },
        });

        // Add layer to map
        geoJsonLayer.addTo(map);
        layerRef.current = geoJsonLayer;
        console.log('FeatureMap: GeoJSON layer added to map');

        // Wait for map to be ready before fitting bounds
        map.whenReady(() => {
          console.log('FeatureMap: Map is ready, fitting to geometry');
          
          // Ensure map size is known before fitting - wait a bit more
          setTimeout(() => {
            // Check container size
            const containerWidth = mapRef.current?.offsetWidth || 0;
            const containerHeight = mapRef.current?.offsetHeight || 0;
            console.log('FeatureMap: Container size before invalidate:', containerWidth, containerHeight);
            
            if (containerWidth === 0 || containerHeight === 0) {
              console.warn('FeatureMap: Container has zero size, waiting...');
              setTimeout(() => {
                map.invalidateSize();
                fitMapToGeometry(geoJsonLayer, geometry);
              }, 300);
            } else {
              map.invalidateSize();
              fitMapToGeometry(geoJsonLayer, geometry);
            }
          }, 200);
        });
        
      } catch (error) {
        console.error('FeatureMap: Error rendering geometry on map:', error);
      }
    }, 100); // Wait 100ms for container to be visible

    // Cleanup function
    return () => {
      if (initTimeout) clearTimeout(initTimeout);
      if (fitTimeout) clearTimeout(fitTimeout);
      if (finalTimeout) clearTimeout(finalTimeout);
      if (layerRef.current && mapInstanceRef.current) {
        try {
          mapInstanceRef.current.removeLayer(layerRef.current);
        } catch (e) {
          console.warn('Error removing layer:', e);
        }
        layerRef.current = null;
      }
    };
  }, [geometry, featureName]);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn('Error removing map:', e);
        }
        mapInstanceRef.current = null;
        layerRef.current = null;
      }
    };
  }, []);

  if (!geometry) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-md flex items-center justify-center">
        <p className="text-gray-500">No geometry available for this feature</p>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="w-full rounded-md"
      style={{ 
        height: '384px',
        width: '100%',
        minHeight: '384px',
        minWidth: '100%',
        position: 'relative',
        zIndex: 1,
        display: 'block',
        overflow: 'hidden'
      }}
    />
  );
};

export default FeatureMap;
