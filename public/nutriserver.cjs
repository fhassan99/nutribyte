const express = require("express");

const app = express();
const mongodbRoutes = require("./nutridb.cjs");

// Serve static files from the public dir
app.use(express.static("public"));
app.use("/api", mongodbRoutes);

// Start the web server
const PORT = process.env.PORT || 8080;
app.listen(PORT, function () {
    console.log(`Listening on port ${PORT}...`);
});