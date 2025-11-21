import express from "express";
import path from "path";

const app = express();
const PORT = process.env.PORT || 10000;

// Serve static files from the Vite build
app.use(express.static(path.resolve(__dirname, "../../client/dist")));

// For all other routes, serve index.html (SPA fallback)
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../../client/dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

