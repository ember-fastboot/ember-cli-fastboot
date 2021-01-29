const fs = require("fs");
const path = require("path");
const apps = ["basic-app", "hot-swap-app", "custom-sandbox-app"].map((p) =>
  path.join(__dirname, "..", "..", p, "dist")
);
apps.forEach((dist) => fs.existsSync(dist) && fs.rmdirSync(dist, { recursive: true }));
