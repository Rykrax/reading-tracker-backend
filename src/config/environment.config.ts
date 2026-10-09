import "dotenv/config";

export const environmentConfig = {
  PORT: Number(process.env.PORT) || 8080,
  NODE_ENV: process.env.NODE_ENV,
  BUILD_MODE: process.env.BUILD_MODE,
  openLibrary: {
    baseUrl: process.env.OPEN_LIBRARY_BASE_URL,
    coverApiUrl: process.env.COVERS_API_BASE_URL,
  },
};
