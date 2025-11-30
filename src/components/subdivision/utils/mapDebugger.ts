/**
 * Map debugging utilities
 * 
 * Add this to the window object to help debug map issues in the browser console.
 * Usage in console: window.debugMap()
 */

export const createMapDebugger = (mapRef: any, localityId: string | number | null) => {
    return {
        /**
         * Print comprehensive map state information
         */
        printMapState: () => {
            const map = mapRef.current?.getMap?.() || mapRef.current;

            if (!map) {
                console.error('❌ No map instance found');
                return;
            }

            console.group('🗺️ Map Debug Information');

            // Basic map info
            console.log('Map Loaded:', map.loaded());
            console.log('Style Loaded:', map.isStyleLoaded());
            console.log('Zoom Level:', map.getZoom());
            console.log('Center:', map.getCenter());
            console.log('Bounds:', map.getBounds());

            // Sources
            console.group('📦 Sources');
            const style = map.getStyle();
            if (style?.sources) {
                Object.keys(style.sources).forEach(sourceId => {
                    const source = map.getSource(sourceId);
                    console.log(`${sourceId}:`, {
                        type: style.sources[sourceId].type,
                        tiles: style.sources[sourceId].tiles,
                        loaded: source?._loaded,
                        source
                    });
                });
            }
            console.groupEnd();

            // Layers
            console.group('🎨 Layers');
            if (style?.layers) {
                const planLayers = style.layers.filter((l: any) =>
                    l.id.includes('plan') || l.id.includes('zone')
                );
                console.log('Plan-related layers:', planLayers);

                planLayers.forEach((layer: any) => {
                    console.log(`Layer: ${layer.id}`, {
                        type: layer.type,
                        source: layer.source,
                        sourceLayer: layer['source-layer'],
                        visibility: layer.layout?.visibility,
                        paint: layer.paint,
                    });
                });
            }
            console.groupEnd();

            // Tile requests
            console.group('🌐 Recent Tile Activity');
            console.log(`Looking for tiles from locality: ${localityId}`);
            console.log('Check Network tab for .mvt requests');
            console.groupEnd();

            console.groupEnd();
        },

        /**
         * Check if plan tiles are loading
         */
        checkPlanTiles: () => {
            const map = mapRef.current?.getMap?.() || mapRef.current;

            if (!map) {
                console.error('❌ No map instance found');
                return;
            }

            const source = map.getSource('plans-tiles');

            console.group('🔍 Plan Tiles Check');

            if (!source) {
                console.error('❌ plans-tiles source not found');
                console.log('Available sources:', Object.keys(map.getStyle().sources));
            } else {
                console.log('✅ plans-tiles source exists:', source);
            }

            const fillLayer = map.getLayer('plans-fill');
            const lineLayer = map.getLayer('plans-line');

            console.log('plans-fill layer:', fillLayer ? '✅ Exists' : '❌ Missing');
            console.log('plans-line layer:', lineLayer ? '✅ Exists' : '❌ Missing');

            if (fillLayer) {
                console.log('Fill layer visibility:', map.getLayoutProperty('plans-fill', 'visibility'));
                console.log('Fill layer opacity:', map.getPaintProperty('plans-fill', 'fill-opacity'));
            }

            if (lineLayer) {
                console.log('Line layer visibility:', map.getLayoutProperty('plans-line', 'visibility'));
                console.log('Line layer opacity:', map.getPaintProperty('plans-line', 'line-opacity'));
            }

            console.groupEnd();
        },

        /**
         * Force reload tiles
         */
        reloadTiles: () => {
            const map = mapRef.current?.getMap?.() || mapRef.current;

            if (!map) {
                console.error('❌ No map instance found');
                return;
            }

            const source: any = map.getSource('plans-tiles');
            if (source) {
                console.log('🔄 Reloading tiles...');
                const tiles = source.tiles || [];
                const newTiles = tiles.map((tile: string) => {
                    const [base] = tile.split('?');
                    return `${base}?v=${Date.now()}`;
                });

                if (source.setTiles) {
                    source.setTiles(newTiles);
                    console.log('✅ Tiles reloaded with cache bust');
                } else {
                    map.triggerRepaint();
                    console.log('✅ Map repaint triggered');
                }
            } else {
                console.error('❌ plans-tiles source not found');
            }
        },

        /**
         * Test tile URL directly
         */
        testTileUrl: async (z = 10, x = 512, y = 512) => {
            const map = mapRef.current?.getMap?.() || mapRef.current;

            if (!map) {
                console.error('❌ No map instance found');
                return;
            }

            const source: any = map.getSource('plans-tiles');
            if (!source || !source.tiles || source.tiles.length === 0) {
                console.error('❌ No tile URL template found');
                return;
            }

            const template = source.tiles[0];
            const url = template
                .replace('{z}', String(z))
                .replace('{x}', String(x))
                .replace('{y}', String(y));

            console.log('🌐 Testing tile URL:', url);

            try {
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
                    }
                });

                console.log('Response status:', response.status);
                console.log('Response headers:', Object.fromEntries(response.headers.entries()));

                if (response.ok) {
                    const blob = await response.blob();
                    console.log('✅ Tile loaded successfully, size:', blob.size, 'bytes');

                    if (blob.size === 0) {
                        console.warn('⚠️ Tile is empty (0 bytes) - might be no data at this location');
                    }
                } else {
                    const text = await response.text();
                    console.error('❌ Tile request failed:', text);
                }
            } catch (error) {
                console.error('❌ Network error:', error);
            }
        },

        /**
         * List all rendered features in viewport
         */
        listRenderedFeatures: () => {
            const map = mapRef.current?.getMap?.() || mapRef.current;

            if (!map) {
                console.error('❌ No map instance found');
                return;
            }

            const features = map.queryRenderedFeatures();
            const planFeatures = features.filter((f: any) =>
                f.source === 'plans-tiles' ||
                f.layer?.id?.includes('plan')
            );

            console.group('🎯 Rendered Features');
            console.log(`Total features in viewport: ${features.length}`);
            console.log(`Plan features: ${planFeatures.length}`);

            if (planFeatures.length > 0) {
                console.log('Sample plan feature:', planFeatures[0]);
                console.log('All plan features:', planFeatures);
            } else {
                console.warn('⚠️ No plan features rendered in current viewport');
                console.log('Try zooming to an area with plan data');
            }

            console.groupEnd();

            return planFeatures;
        }
    };
};

// Type for the debugger
export type MapDebugger = ReturnType<typeof createMapDebugger>;
