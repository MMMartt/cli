const { createWriteStream, existsSync, mkdirSync, mkdtemp } = require("fs");
const { join, sep } = require("path");
const { spawnSync } = require("child_process");
const { tmpdir } = require("os");

const axios = require("axios");
const rimraf = require("rimraf");
const tmpDir = tmpdir();

const error = (msg) => {
  console.error(msg);
  process.exit(1);
};

class Package {
  constructor(url) {
    let errors = [];
    if (typeof url !== "string") {
      errors.push("url must be a string");
    } else {
      try {
        new URL(url);
      } catch (e) {
        errors.push(e);
      }
    }

    if (errors.length > 0) {
      let errorMsg =
        "One or more of the parameters you passed to the Binary constructor are invalid:\n";
      errors.forEach((error) => {
        errorMsg += error;
      });
      errorMsg +=
        '\n\nCorrect usage: new Package("my-binary", "https://example.com/binary/download.tar.gz", {"my-binary": "my-binary"})';
      error(errorMsg);
    }

    this.url = url;
    this.installDirectory = join(__dirname, "node_modules", ".bin_real");

    if (!existsSync(this.installDirectory)) {
      mkdirSync(this.installDirectory, { recursive: true });
    }
  }

  exists() {
    const binPath = join(this.installDirectory, 'gws');
    if (!existsSync(binPath)) {
      return false;
    }
    return true;
  }

  install(fetchOptions, suppressLogs = false) {
    if (this.exists()) {
      if (!suppressLogs) {
        console.error(
          `gws is already installed, skipping installation.`,
        );
      }
      return Promise.resolve();
    }

    if (existsSync(this.installDirectory)) {
      rimraf.sync(this.installDirectory);
    }

    mkdirSync(this.installDirectory, { recursive: true });

    if (!suppressLogs) {
      console.error(`Downloading release from ${this.url}`);
    }

    return axios({ ...fetchOptions, url: this.url, responseType: "stream" })
      .then((res) => {
        return new Promise((resolve, reject) => {
          mkdtemp(`${tmpDir}${sep}`, (err, directory) => {
            let tempFile = join(directory, 'gws');
            const sink = res.data.pipe(createWriteStream(tempFile));
            sink.on("error", (err) => reject(err));
            sink.on("close", () => {
              const result = spawnSync("install", [
                "-m", "755",
                tempFile,
                this.installDirectory,
              ]);
              if (result.status === 0) {
                resolve();
              } else if (result.error) {
                reject(result.error);
              } else {
                reject(
                  new Error(
                    `An error occurred untarring the artifact: stdout: ${result.stdout}; stderr: ${result.stderr}`,
                  ),
                );
              }
            });
          });
        });
      })
      .then(() => {
        if (!suppressLogs) {
          console.error(`gws has been installed!`);
        }
      })
      .catch((e) => {
        error(`Error fetching release: ${e.message}`);
      });
  }

  run(binaryName, fetchOptions) {
    const promise = !this.exists()
      ? this.install(fetchOptions, true)
      : Promise.resolve();

    promise
      .then(() => {
        const [, , ...args] = process.argv;

        const options = { cwd: process.cwd(), stdio: "inherit" };

        const binRelPath = 'gws';
        if (!binRelPath) {
          error(`${binaryName} is not a known binary in gws`);
        }
        const binPath = join(this.installDirectory, binRelPath);
        const result = spawnSync(binPath, args, options);

        if (result.error) {
          error(result.error);
        }

        process.exit(result.status);
      })
      .catch((e) => {
        error(e.message);
        process.exit(1);
      });
  }
}

module.exports.Package = Package;
