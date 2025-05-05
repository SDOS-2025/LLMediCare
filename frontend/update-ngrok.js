/**
 * This script updates the ngrok URL in all necessary configuration files.
 * Run it with: node update-ngrok.js YOUR_NEW_NGROK_URL
 * Example: node update-ngrok.js https://abc-123-xyz.ngrok-free.app
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Check if URL was provided
if (process.argv.length < 3) {
  console.error("Error: Please provide the new ngrok URL.");
  console.error("Usage: node update-ngrok.js YOUR_NEW_NGROK_URL");
  console.error(
    "Example: node update-ngrok.js https://abc-123-xyz.ngrok-free.app"
  );
  process.exit(1);
}

const newNgrokUrl = process.argv[2].trim();

// Validate URL format
if (!newNgrokUrl.startsWith("https://") || !newNgrokUrl.includes("ngrok")) {
  console.warn(
    "Warning: The URL provided does not look like a valid ngrok URL."
  );
  console.warn("Expected format: https://something.ngrok-free.app");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Do you want to continue anyway? (y/n): ", (answer) => {
    if (answer.toLowerCase() !== "y") {
      console.log("Operation cancelled.");
      rl.close();
      process.exit(0);
    }
    rl.close();
    updateFiles(newNgrokUrl);
  });
} else {
  updateFiles(newNgrokUrl);
}

function updateFiles(ngrokUrl) {
  console.log(`Updating ngrok URL to: ${ngrokUrl}`);

  // 1. Update environment.js
  const envFile = path.join(__dirname, "src", "utils", "environment.js");
  if (fs.existsSync(envFile)) {
    let content = fs.readFileSync(envFile, "utf8");
    content = content.replace(
      /(API_BASE_URL:\s*)"https:\/\/[^"]*"/g,
      `$1"${ngrokUrl}"`
    );
    fs.writeFileSync(envFile, content);
    console.log("✅ Updated src/utils/environment.js");
  } else {
    console.error("❌ Could not find environment.js");
  }

  // 2. Update netlify-config.js
  const netlifyConfigFile = path.join(__dirname, "public", "netlify-config.js");
  if (fs.existsSync(netlifyConfigFile)) {
    let content = fs.readFileSync(netlifyConfigFile, "utf8");
    content = content.replace(
      /(API_BASE_URL:\s*)"https:\/\/[^"]*"/g,
      `$1"${ngrokUrl}"`
    );
    fs.writeFileSync(netlifyConfigFile, content);
    console.log("✅ Updated public/netlify-config.js");
  } else {
    console.error("❌ Could not find netlify-config.js");
  }

  console.log("\nDone! Your application should now use the new ngrok URL.");
  console.log("\nReminders:");
  console.log("1. Make sure to redeploy your frontend to Netlify");
  console.log(
    "2. Update your backend settings if needed (CORS_ALLOWED_ORIGINS and ALLOWED_HOSTS)"
  );
  console.log("3. Restart your backend server to apply the changes");
}
