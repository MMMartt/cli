#!/usr/bin/env node

const { spawnSync } = require("child_process");
const path = require("path");

const binPath = path.join(__dirname, "bin", "gws");
const result = spawnSync(binPath, process.argv.slice(2), {
  cwd: process.cwd(),
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status);
