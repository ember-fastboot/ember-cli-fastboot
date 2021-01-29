const path = require("path");
const fs = require("fs");
const execa = require("execa");

module.exports = async function buildDist(name) {
  const pathToApp = path.join(__dirname, "..", "..", name);
  const pathToDist = path.join(pathToApp, "dist");
  if (fs.existsSync(pathToDist)) {
    return pathToDist;
  } else {
    await execa("ember", ["build"], { cwd: pathToApp });
    return pathToDist;
  }
};
