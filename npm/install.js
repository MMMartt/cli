#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const URL = "https://github.com/MMMartt/cli/releases/download/0.0.3/gws";
const BIN_DIR = path.join(__dirname, "bin");
const BIN_PATH = path.join(BIN_DIR, "gws");

if (fs.existsSync(BIN_PATH)) {
  console.log("gws binary already exists, skipping download.");
  process.exit(0);
}

fs.mkdirSync(BIN_DIR, { recursive: true });

console.log(`Downloading gws from ${URL} ...`);
try {
  execSync(`curl -fsSL -o "${BIN_PATH}" "${URL}"`, { stdio: "inherit" });
  fs.chmodSync(BIN_PATH, 0o755);
  console.log("gws binary installed successfully.");
} catch (e) {
  console.error("Failed to download gws binary.");
  process.exit(1);
}
