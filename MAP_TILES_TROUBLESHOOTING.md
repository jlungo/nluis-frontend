# Map Tiles Troubleshooting Guide

## Problem: Plan tiles aren't displaying on the map

## Diagnostic Logging Added ✅

I've enhanced the code with console logging to help identify the issue. When you reload the page, check the browser console for these messages:

### Expected Console Messages

1. **🗺️ PlansLayers: Tile source configured** - Shows the tile URL and configuration
2. **✅ Plans tiles source loaded successfully** - Confirms tiles are loading
3. **🗺️ Plans tiles source exists after style load** - Confirms source is registered

### Error Messages to Look For

- **⚠️ PlansLayers: No tile source available** - Missing locality ID
- **🗺️ Map Tile Error** - Shows HTTP status codes and URLs
- **❌ Tile not found (404)** - Backend endpoint doesn't exist
- **❌ Tile forbidden (403)** - Permission issue
- **🔐 Tile auth error (401)** - Authentication problem
- **❌ Network or CORS error** - CORS configuration issue

## Common Issues & Solutions

### 1. Source Layer Name Mismatch ⚠️

**Symptom**: Tiles load but nothing renders on the map  
**Cause**: The hardcoded `source-layer="zones"` doesn't match the backend MVT layer name  
**Solution**: Check your backend MVT tile structure

To verify, open browser DevTools → Network tab → find a `.mvt` request → check the response.
The MVT file should contain a layer named "zones". If it has a different name (e.g., "default", "plans", "parcels"), update PlansLayers.tsx:

```tsx
source-layer="your-actual-layer-name"  // Change on lines 56 and 85
```

### 2. Opacity Too Low

**Symptom**: Tiles might be there but invisible  
**Cause**: Low opacity value  
**Check**: Look for the opacity slider in your UI controls  
**Solution**: Increase `plansOpacity` to 0.8 or higher

### 3. Authentication Issues

**Symptom**: 401 errors in console  
**Cause**: Expired or missing access token  
**Solution**: The code now auto-refreshes tokens. If it persists, check:
- Token is being sent in Authorization header
- Backend accepts the token format
- Token hasn't expired

### 4. CORS Configuration

**Symptom**: Network errors without status codes  
**Cause**: Backend doesn't allow tile requests from your origin  
**Solution**: Add CORS headers on backend:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Authorization
```

### 5. Z-Index / Layer Ordering

**Symptom**: Tiles load but are hidden behind base map  
**Check**: In Mapbox, layers render in order they're added  
**Solution**: The PlansLayers component should render AFTER the base map, which it does

### 6. Incorrect Tile URL

**Symptom**: 404 errors for tile requests  
**Console**: Check the logged `tileURL` value  
**Expected format**: `https://api.example.com/zoning/plans/latest/{localityId}/tiles/{z}/{x}/{y}.mvt`  
**Solution**: Verify:
- API_BASE is correct in your .env file
- Backend endpoint matches this URL pattern
- LocalityId is a valid value

### 7. Zoom Level Out of Range

**Symptom**: Tiles only show at certain zoom levels  
**Cause**: `minzoom` and `maxzoom` configuration  
**Current**: minzoom: 1, maxzoom: 22  
**Solution**: These should be fine. If tiles only show when very zoomed in/out, check backend tile generation

## Step-by-Step Debugging

1. **Open the application in your browser**
2. **Open Browser DevTools** (F12)
3. **Go to Console tab**
4. **Look for the log messages** listed above
5. **Check the Network tab** for `.mvt` requests:
   - Are they being made?
   - What's the HTTP status?
   - What's the response size?
6. **Inspect the map layers** using Mapbox Inspect tool:
   ```javascript
   // In browser console:
   window.mapInstance = map; // Add this temporarily
   console.log(window.mapInstance.getStyle().layers);
   ```

## Quick Fixes to Try

### Fix #1: Verify showPlans is true
```javascript
// In browser console:
console.log(useSubdivisionStore.getState().showPlans);
// Should be true
```

### Fix #2: Check locality ID
```javascript
// In browser console:
console.log('Locality ID:', localityId);
// Should be a valid number or string
```

### Fix #3: Increase opacity
Look for the opacity slider in your map controls and increase it to maximum.

### Fix #4: Check if tiles are actually loading
```javascript
// In browser console after map loads:
const source = map.getSource('plans-tiles');
console.log('Source:', source);
console.log('Layers:', map.getStyle().layers.filter(l => l.id.includes('plans')));
```

## Backend Verification

Test the tile endpoint directly:
```bash
# Replace with your actual values:
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://your-api.com/zoning/plans/latest/YOUR_LOCALITY_ID/tiles/10/512/512.mvt"
```

Expected: Binary MVT data (should not be empty or return HTML error page)

## Next Steps

1. Check the console logs after adding these enhancements
2. Share the error messages/logs if tiles still don't display
3. Verify the tile URL is correct and accessible
4. Check the Network tab for the actual HTTP requests
5. Verify the MVT layer name matches "zones"
