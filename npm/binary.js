const { Package } = require("./binary-install");
const { configureProxy } = require("axios-proxy-builder");

const {
  artifactDownloadUrls,
} = require("./package.json");

const artifactDownloadUrl = artifactDownloadUrls[0];

const getPackage = () => {
  const url = artifactDownloadUrl;
  return new Package(url);
};

const install = (suppressLogs) => {
  if (!artifactDownloadUrl || artifactDownloadUrl.length === 0) {
    console.warn("in demo mode, not installing binaries");
    return;
  }
  const pkg = getPackage();
  const proxy = configureProxy(pkg.url);

  return pkg.install(proxy, suppressLogs);
};

const run = (binaryName) => {
  const pkg = getPackage();
  const proxy = configureProxy(pkg.url);

  pkg.run(binaryName, proxy);
};

module.exports = {
  install,
  run,
  getPackage,
};