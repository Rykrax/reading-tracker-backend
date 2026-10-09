import "reflect-metadata";
import { testConnection } from "./config/database.js";
import { environmentConfig } from "./config/environment.config.js";
import { initializeContainer } from "./di/container.di.js";

const port = environmentConfig.PORT;

const startServer = async () => {
  try {
    await initializeContainer();
    await testConnection();

    const { default: app } = await import("./app.js");

    app.listen(port, () => {
      if (environmentConfig.BUILD_MODE === "production") {
        console.log(`This is production. Server run on PORT: ${port}`);
      } else {
        console.log(`Server run on "http://localhost:${port}"`);
      }
    });
  } catch (error) {
    console.error("Error start server:", error);
    process.exit(1);
  }
};

startServer();
