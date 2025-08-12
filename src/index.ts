import express from "express";

const app = express();

// Health check
app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Start HTTP server
app.listen(3000, "0.0.0.0", () => {
  console.log("App listening on port 3000");
});
