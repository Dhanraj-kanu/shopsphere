const axios = require('axios');

async function testOrderCreation() {
    try {
        // First authenticate a test user
        const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'testuser2@example.com',
            password: 'password'
        });
        const token = loginRes.data.token;

        // Then create an order
        const orderData = {
            orderItems: [
                {
                    name: 'Test Product',
                    qty: 1,
                    image: '/images/test.jpg',
                    price: 2499,
                    product: '60d5ecb8b392ee0015bf28fe' // Mock object id, hopefully valid format
                }
            ],
            shippingAddress: {
                name: 'Test Name',
                email: 'test@example.com',
                address: '123 Test St',
                city: 'Test City',
                postalCode: '123456',
                country: 'India',
                phone: '1234567890'
            },
            paymentMethod: 'TestMethod',
            paymentResult: {
                id: 'pay_test123',
                status: 'success',
                update_time: '2023-01-01T00:00:00Z',
                email_address: 'test@example.com'
            },
            itemsPrice: 2499,
            taxPrice: 0,
            shippingPrice: 50,
            totalPrice: 2549,
            discountAmount: 0,
            couponInfo: null
        };

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.post('http://localhost:3000/api/orders', orderData, config);

        console.log('Order created successfully:', res.data._id);
    } catch (error) {
        console.error('Order creation failed:', error.response ? error.response.data : error.message);
    }
}

testOrderCreation();
