import { useState, useEffect } from 'react';

export const useGeoJSONLoader = (url: string) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadGeoJSON = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        setData(jsonData);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load GeoJSON'));
        setIsLoading(false);
      }
    };

    loadGeoJSON();
  }, [url]);

  return { data, isLoading, error };
};
