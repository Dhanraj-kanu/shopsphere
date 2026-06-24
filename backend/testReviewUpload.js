const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testReviewUpload() {
    try {
        // Authenticate as a user
        console.log("Authenticating...");
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'testuser2@example.com',
            password: 'password'
        });
        const token = loginRes.data.token;

        // Generate a mock "large" base64 image string (about 1MB)
        console.log("Generating large payload...");
        const largeString = 'A'.repeat(1024 * 1024); // 1MB of 'A's
        const mockBase64 = `data:image/jpeg;base64,${Buffer.from(largeString).toString('base64')}`;

        // Attempt to submit review for an existing product
        // Assuming '60d5ecb8b392ee0015bf28fe' might not work because of purchase validation
        // Let's rely on the error message it gives. If it gives a 400 or 401 instead of 413, the payload fix worked!

        // Let's query products first to get a valid ID
        const productsRes = await axios.get('http://localhost:3000/api/products');
        const firstProductId = productsRes.data[0]._id;
        console.log(`Testing review on product ${firstProductId}...`);

        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            }
        };

        const payload = {
            rating: 5,
            title: "Test Large Payload",
            comment: "This is a test to see if large payloads work.",
            images: [mockBase64, mockBase64] // 2 images, ~2.6MB total base64
        };

        const res = await axios.post(`http://localhost:3000/api/reviews/${firstProductId}`, payload, config);

        console.log("Success! Review created:", res.status);
    } catch (error) {
        if (error.response) {
            console.error(`Error ${error.response.status}:`, error.response.data);
        } else {
            console.error("Error:", error.message);
        }
    }
}

testReviewUpload();
