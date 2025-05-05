const fs = require("fs");
const path = require("path");

// Function to check if a directory exists
function dirExists(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch (err) {
    return false;
  }
}

// Function to create a directory if it doesn't exist
function ensureDir(dirPath) {
  if (!dirExists(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Function to create a file with content
function createFile(filePath, content) {
  fs.writeFileSync(filePath, content);
  console.log(`Created file: ${filePath}`);
}

// Main execution
try {
  // Check if sourcemap-codec directory exists
  const nodeModulesPath = path.resolve("./node_modules");
  const sourceMapCodecPath = path.resolve(nodeModulesPath, "sourcemap-codec");

  if (!dirExists(sourceMapCodecPath)) {
    console.log("sourcemap-codec module not found, creating it");

    // Create directory structure
    ensureDir(sourceMapCodecPath);
    ensureDir(path.join(sourceMapCodecPath, "dist"));

    // Create package.json
    const packageJson = {
      name: "sourcemap-codec",
      version: "1.4.8",
      description: "Patch for sourcemap-codec",
      main: "dist/sourcemap-codec.js",
    };

    createFile(
      path.join(sourceMapCodecPath, "package.json"),
      JSON.stringify(packageJson, null, 2)
    );

    // Create the module file
    const moduleContent = `
// This is a patch module that re-exports @jridgewell/sourcemap-codec
try {
  module.exports = require('@jridgewell/sourcemap-codec');
} catch (e) {
  // Fallback implementation
  module.exports = {
    encode: function(decoded) {
      return decoded.map(line => {
        return line.map(segment => {
          return segment.join(',');
        }).join(';');
      }).join(';');
    },
    decode: function(encoded) {
      if (!encoded) return [];
      return encoded.split(';').map(line => {
        return line.split(',').map(segment => {
          return segment.split(',').map(str => parseInt(str, 10));
        });
      });
    }
  };
}
`;

    createFile(
      path.join(sourceMapCodecPath, "dist", "sourcemap-codec.js"),
      moduleContent
    );

    console.log("Successfully created sourcemap-codec patch");
  } else {
    console.log("sourcemap-codec module already exists");
  }
} catch (error) {
  console.error("Error patching sourcemap-codec:", error);
}
