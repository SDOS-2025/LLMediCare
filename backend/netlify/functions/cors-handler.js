// CORS Handler for OPTIONS requests
exports.handler = async (event) => {
  // Get the requesting origin
  const origin =
    event.headers.origin ||
    event.headers.Origin ||
    "https://splendorous-melba-fc5384.netlify.app";

  // Log the request for debugging
  console.log("CORS Preflight Request:");
  console.log("  Origin:", origin);
  console.log("  Method:", event.httpMethod);
  console.log("  Path:", event.path);

  // Return appropriate CORS headers
  return {
    statusCode: 204, // No content needed for OPTIONS response
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept, Authorization",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400",
      "Content-Length": "0",
    },
  };
};
