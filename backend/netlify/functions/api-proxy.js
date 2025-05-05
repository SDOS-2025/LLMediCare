const https = require("https");
const url = require("url");

// API Proxy Function
exports.handler = async (event) => {
  // Get the requesting origin
  const origin =
    event.headers.origin ||
    event.headers.Origin ||
    "https://splendorous-melba-fc5384.netlify.app";

  // Log the request for debugging
  console.log("API Proxy Request:");
  console.log("  Origin:", origin);
  console.log("  Method:", event.httpMethod);
  console.log("  Path:", event.path);

  try {
    // Parse the original URL
    const parsedUrl = url.parse(event.path);
    const path = parsedUrl.pathname.replace(/^\/api/, "");

    // Build the target URL to your Django backend
    const targetUrl = `https://devserver-main--splendorous-melba-fc5384.netlify.app/api${path}${
      event.queryStringParameters
        ? "?" + new URLSearchParams(event.queryStringParameters).toString()
        : ""
    }`;

    console.log("  Target URL:", targetUrl);

    // Make the request to the Django backend
    const response = await makeRequest(
      targetUrl,
      event.httpMethod,
      event.headers,
      event.body
    );

    // Add CORS headers to the response
    const corsHeaders = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept, Authorization",
      "Access-Control-Allow-Credentials": "true",
    };

    // Return the response with CORS headers
    return {
      statusCode: response.statusCode,
      headers: { ...response.headers, ...corsHeaders },
      body: response.body,
    };
  } catch (error) {
    console.error("API Proxy Error:", error);

    // Return error response with CORS headers
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "Origin, X-Requested-With, Content-Type, Accept, Authorization",
        "Access-Control-Allow-Credentials": "true",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Internal Server Error",
        message: error.message,
      }),
    };
  }
};

// Helper function to make HTTP requests
function makeRequest(targetUrl, method, headers, body) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(targetUrl);

    // Set up the request options
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.path,
      method: method,
      headers: {
        ...headers,
        host: parsedUrl.hostname,
      },
    };

    // Remove headers that might cause issues
    delete options.headers["host"];
    delete options.headers["Host"];
    delete options.headers["connection"];
    delete options.headers["Connection"];

    // Make the request
    const req = https.request(options, (res) => {
      let responseBody = "";

      res.on("data", (chunk) => {
        responseBody += chunk;
      });

      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseBody,
        });
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    // Send the body if it exists
    if (body) {
      req.write(body);
    }

    req.end();
  });
}
