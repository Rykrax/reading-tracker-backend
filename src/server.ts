import app from "./app.js";
import { environmentConfig } from "./config/environment.config.js";

const port = environmentConfig.PORT;

const startServer = async () => {
  if (environmentConfig.BUILD_MODE === "production") {
    (async () => {
      try {
        app.listen(port, () => {
          console.log(`This is production. Server chạy trên PORT: ${port}`);
        });
      } catch (error) {
        console.log(error);
      }
    })();
  } else {
    (async () => {
      try {
        app.listen(port, () => {
          console.log(`Server chạy trên "http://localhost:${port}"`);
        });
      } catch (error) {
        console.log(error);
      }
    })();
  }
};

startServer();
