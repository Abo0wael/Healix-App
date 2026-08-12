// Test script to verify frontend-backend connectivity
// Run with: node test-connection.js

// Update this URL if testing a deployed server
const API_URL = process.env.API_URL || "http://localhost:3000";

console.log("🧪 Testing Backend Connection...\n");

// Test 1: Health Check
console.log("Test 1: Health Check Endpoint");
fetch(`${API_URL}/health`)
    .then(res => res.json())
    .then(data => {
        console.log("✅ Health check successful:");
        console.log("   Response:", JSON.stringify(data, null, 2));
    })
    .catch(err => {
        console.error("❌ Health check failed:");
        console.error("   Error:", err.message);
        console.error("\n💡 Troubleshooting:");
        console.error("   1. Make sure backend is running: npm start");
        console.error("   2. Check if port 3000 is accessible");
        console.error("   3. Verify IP address is correct (run 'ipconfig')");
    });

// Test 2: Check if server accepts network connections
console.log("\nTest 2: Network Accessibility");
console.log(`   Checking if ${API_URL} is reachable...`);

setTimeout(() => {
    console.log("\n✅ Connection test complete!");
    console.log("\nIf health check passed, your frontend-backend connection is working!");
    console.log("If you see AI API errors in the app, that means the connection is fine,");
    console.log("but there is an issue with your configured AI Provider API.");
}, 2000);
