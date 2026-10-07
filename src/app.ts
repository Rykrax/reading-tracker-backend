import express, { type Application } from "express";

const app: Application = express();

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

export default app;
