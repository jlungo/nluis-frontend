/**
 * Projection and coordinate system utilities
 */
import proj4 from 'proj4';

// UTM zone definitions
const UTM_ZONES = {
  'EPSG:32735': "+proj=utm +zone=35 +south +datum=WGS84 +units=m +no_defs +type=crs",
  'EPSG:32736': "+proj=utm +zone=36 +south +datum=WGS84 +units=m +no_defs +type=crs",
  'EPSG:32737': "+proj=utm +zone=37 +south +datum=WGS84 +units=m +no_defs +type=crs",
};

// Initialize UTM projections once
let initialized = false;
const initializeUTMProjections = () => {
  if (initialized) return;
  Object.entries(UTM_ZONES).forEach(([epsg, def]) => {
    try {
      proj4.defs(epsg, def);
    } catch {}
  });
  initialized = true;
};

/**
 * Calculate UTM coordinates from longitude/latitude
 */
export const calculateUTM = (lng: number, lat: number) => {
  initializeUTMProjections();
  
  const utmZone = Math.floor((lng + 180) / 6) + 1;
  const epsg = `EPSG:${32700 + utmZone}`;
  try {
    const projected = proj4('EPSG:4326', epsg, [lng, lat]);
    return { x: projected[0], y: projected[1], zone: utmZone, epsg };
  } catch {
    return null;
  }
};

/**
 * Convert coordinates from one projection to another
 */
export const convertCoordinates = (
  x: number,
  y: number,
  fromEPSG: string,
  toEPSG: string = 'EPSG:4326'
): [number, number] | null => {
  initializeUTMProjections();
  
  try {
    return proj4(fromEPSG, toEPSG, [x, y]) as [number, number];
  } catch {
    return null;
  }
};

/**
 * Get UTM zone for a given longitude
 */
export const getUTMZoneForLongitude = (lng: number): { zone: number; epsg: string } => {
  const zone = Math.floor((lng + 180) / 6) + 1;
  return {
    zone,
    epsg: `EPSG:${32700 + zone}`
  };
};
