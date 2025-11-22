# SubdivisionMapViewer Refactoring Summary

## Overview
The original `SubdivisionMapViewer.tsx` (~1564 lines) has been refactored into modular, maintainable components following separation of concerns principles.

## New Structure

### 📁 Utilities (`utils/`)
Extracted pure functions for reusability and testability:

#### `geometryHelpers.ts`
- `fcToBounds()` - Calculate bounds from FeatureCollection
- `extractCoordinatesFromGeometry()` - Extract coords from any geometry type
- `calculateBoundsFromFeature()` - Calculate bounds from a feature
- `calculateAreaFromBounds()` - Calculate area from bounds
- `getZoomPaddingForArea()` - Dynamic padding based on feature area

#### `projectionHelpers.ts`
- `calculateUTM()` - Convert WGS84 to UTM coordinates
- `convertCoordinates()` - Project conversion between coordinate systems
- `getUTMZoneForLongitude()` - Get UTM zone info

#### `tilesHelpers.ts`
- `getAPIBase()` - Get API base URL
- `getPlansTilesTemplate()` - Get MVT tiles endpoint URL
- `getPlansTilesSource()` - Get tile source config
- `isApiUrl()` - Check if URL is API call
- `invalidateTiles()` - Refresh tiles with cache-busting
- `refreshLocalityTiles()` - Refresh tiles for specific locality

---

### 🪝 Custom Hooks (`hooks/`)
Isolated stateful logic and effects:

#### `useMapInstance.ts`
- Manages map ref and getMap() helper
- Single source of truth for map access

#### `useZoomToFeature.ts`
- Zoom to any feature with smart padding
- Automatic zoom level based on feature size

#### `usePlanInteraction.ts`
- Plan click handler with multi-select
- Plan hover state management
- Double-click zoom
- Right-click context actions
- All plan interaction logic isolated

#### `useLocalityBoundary.ts`
- Fetch locality boundary from API
- Calculate bounds automatically
- Handle loading/error states

#### `useMapRequestTransform.ts`
- Authorize tile requests with tokens
- Check if URL is API call
- Single responsibility

#### `useMapStyleEffects.ts`
- `useMapStyle()` - Apply map style
- `useMapLabelVisibility()` - Toggle label visibility
- `useMapPaintProperties()` - Update layer paint properties
- Separated concerns for each effect

#### `useCreateSubdivision.ts`
- Create subdivision features with proper geometry
- Auto-calculate centroid and UTM
- Clip to selected plan
- Memoized for performance

#### `usePlanSummaries.ts`
- Compute plan summaries from tile features
- Sync with API plan metadata
- Handle selection state
- Integrate tile load events

#### `useTileErrorHandler.ts`
- Handle 401 token errors
- Refresh tokens and invalidate tiles
- Graceful error recovery

#### `useZoneSelectionSync.ts`
- Sync store selection state to map features
- Delta updates (only change what's needed)
- Prevent redundant feature state calls

---

### 🎨 Layer Components (`components/`)
Reusable Mapbox layer configurations:

#### `PlansLayers.tsx`
- Vector tiles source for plans
- Fill and line layers
- Selection and hover styles
- Color mode support

#### `LocalityLayers.tsx`
- Locality boundary visualization
- Dashed outline style
- Light fill background

#### `ParcelLayers.tsx`
- Parent parcel display
- Two-layer approach (fill + outline)
- Consistent styling

---

### 📄 Main Component
`SubdivisionMapViewer.refactored.tsx`

**Before Refactoring:**
- 1564 lines
- Mixed concerns
- Hard to test
- Difficult to extend
- Multiple state management patterns

**After Refactoring:**
- ~650 lines (58% reduction)
- Clear separation of concerns
- Easy to test (hooks are pure functions)
- Easy to extend (add new utility/hook)
- Consistent patterns throughout

**Key Improvements:**
1. **Hooks Usage**: All logic moved to custom hooks
2. **Pure Functions**: Utilities are side-effect free
3. **Composition**: Layer components are simple and reusable
4. **Documentation**: Organized with section comments
5. **Maintainability**: Each file has single responsibility

---

## Migration Guide

### Step 1: Replace the original file
```bash
mv SubdivisionMapViewer.tsx SubdivisionMapViewer.old.tsx
mv SubdivisionMapViewer.refactored.tsx SubdivisionMapViewer.tsx
```

### Step 2: Test imports
Verify all utility and hook imports are working:
```tsx
import { calculateUTM } from '../utils/projectionHelpers';
import { useZoomToFeature } from '../hooks/useZoomToFeature';
```

### Step 3: Run tests
```bash
npm test
```

### Step 4: Visual regression testing
- Zoom to features
- Click plans (multi-select)
- Hover over plans
- Switch map styles
- Toggle labels
- Toggle plans visibility
- Test fullscreen
- Test drawing modes
- Test points dialog

---

## Benefits

### 🎯 Maintainability
- Each file has a single responsibility
- Easier to find and fix bugs
- Clear dependencies

### 🧪 Testability
- Pure functions can be unit tested
- Hooks can be tested with testing library
- Components are simpler

### ♻️ Reusability
- Hooks can be used in other components
- Utilities can be shared across codebase
- Layer components are composable

### 📈 Scalability
- Easy to add new features (new hooks/utilities)
- Easy to optimize (memoization where needed)
- Pattern is consistent and extensible

### 🔍 Readability
- Clear code organization
- Reduced cognitive load per file
- Better code comments

---

## File Statistics

| Category | Count | Purpose |
|----------|-------|---------|
| Utilities | 3 | Pure geometry, projection, tiles functions |
| Hooks | 10 | Stateful logic and effects |
| Layer Components | 3 | Mapbox layer configurations |
| Main Component | 1 | Orchestration and rendering |
| **Total** | **17 new files** | **Modular, maintainable structure** |

---

## Performance Considerations

1. **Memoization**: All hooks use `useCallback` appropriately
2. **Dependency Arrays**: Carefully managed to prevent unnecessary re-renders
3. **Feature State**: Delta updates prevent redundant Mapbox feature state calls
4. **Tile Caching**: Proper cache-busting with timestamps

---

## Next Steps (Optional)

1. **Extract Draw Handlers**: Create `hooks/useDraw.ts` for draw event logic
2. **Extract Points Logic**: Create `hooks/usePointsDialog.ts` for points handling
3. **Add Unit Tests**: Test utilities and hooks independently
4. **Add Integration Tests**: Test component interaction
5. **Optimize Render**: Profile performance and optimize critical paths
