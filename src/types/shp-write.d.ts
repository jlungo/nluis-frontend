declare module "shp-write" {
  const shpwrite: {
    zip: (geojson: GeoJSON.FeatureCollection, options?: any) => Blob | ArrayBuffer;
    download?: (geojson: GeoJSON.FeatureCollection, options?: any) => void;
  };
  export default shpwrite;

    export function zip(fc: { type: "FeatureCollection"; features: { type: "Feature"; properties: any; geometry: any; }[]; }, options: any) {
        throw new Error("Function not implemented.");
    }
}
