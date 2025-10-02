const VITE_MEDIA_PATH = import.meta.env.VITE_MEDIA_PATH as string | undefined;
const VITE_API_URL = import.meta.env.VITE_API_URL as string | undefined;
const VITE_MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

function getApiUrl() {
  let url: string = "";

  if (VITE_API_URL && VITE_API_URL.length > 0) url = VITE_API_URL;
  else throw new Error("No environment setup!");
  return url;
}

function getMediaBasePath() {
  let url: string = "";

  if (VITE_MEDIA_PATH && VITE_MEDIA_PATH.length > 0) url = VITE_MEDIA_PATH;
  else if (VITE_API_URL && VITE_API_URL.length > 0)
    url = VITE_API_URL.replace(/\/api\/v1$/, "");

  return url;
}

function getMapboxToken() {
  if (!VITE_MAPBOX_TOKEN) throw new Error("Mapbox token not set in environment!");
  return VITE_MAPBOX_TOKEN;
}

export const API_URL = getApiUrl();
export const MEDIA_PATH = getMediaBasePath();
export const MAPBOX_TOKEN = getMapboxToken();
