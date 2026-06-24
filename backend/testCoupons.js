const mongoose = require('mongoose');

async function runTests() {
    try {
        console.log('Testing Coupon Routes...');

        await mongoose.connect('mongodb://127.0.0.1:27017/ecommerce');
        const User = require('./models/User');

        const email = `admin${Date.now()}@test.com`;

        console.log('\n--- Create Admin User ---');
        const signupRes = await fetch('http://localhost:3000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Admin',
                email: email,
                password: 'password123'
            })
        });
        const signupData = await signupRes.json();
        console.log('Signup:', signupData.email || signupData.message);
        const token = signupData.token;

        await User.updateOne({ email }, { isAdmin: true });
        console.log('User made admin in DB');

        console.log('\n--- Create Coupon (Admin) ---');
        const createRes = await fetch('http://localhost:3000/api/admin/coupons', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                code: 'TEST50',
                discountType: 'percentage',
                discountValue: 50,
                expiryDate: new Date(Date.now() + 86400000).toISOString()
            })
        });
        const createData = await createRes.json();
        console.log('Create Coupon:', createData.code);
        const couponId = createData._id;

        console.log('\n--- Update Coupon (Admin) ---');
        const updateRes = await fetch(`http://localhost:3000/api/admin/coupons/${couponId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ discountValue: 60 })
        });
        const updateData = await updateRes.json();
        console.log('Update Coupon (Expected 60):', updateData.discountValue);

        console.log('\n--- Apply Coupon ---');
        const applyRes = await fetch('http://localhost:3000/api/coupons/apply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ code: 'TEST50', cartTotal: 1000 })
        });
        const applyData = await applyRes.json();
        console.log('Apply Coupon:', applyData);

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
        await mongoose.disconnect();
    }
}

runTests();
