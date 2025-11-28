const VITE_MEDIA_PATH = import.meta.env.VITE_MEDIA_PATH as string | undefined;
const VITE_API_URL = import.meta.env.VITE_API_URL as string | undefined;

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

export const API_URL = getApiUrl();
export const MEDIA_PATH = getMediaBasePath();
