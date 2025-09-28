declare module "shp-write" {
  const shpwrite: {
    zip: (
      geojson: GeoJSON.FeatureCollection,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options?: any
    ) => Blob | ArrayBuffer;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    download?: (geojson: GeoJSON.FeatureCollection, options?: any) => void;
  };
  export default shpwrite;

  export function zip(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fc: {
      type: "FeatureCollection";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      features: { type: "Feature"; properties: any; geometry: any }[];
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    options: any
  ) {
    throw new Error("Function not implemented.");
  }
}
