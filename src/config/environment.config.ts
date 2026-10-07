import "dotenv/config";

export const environmentConfig = {
  PORT: Number(process.env.PORT) || 8080,
  NODE_ENV: process.env.NODE_ENV,
  BUILD_MODE: process.env.BUILD_MODE,
};
