const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const promoteUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/e-commerce');
        const user = await User.findOne({ email: 'admin@test.com' });
        if (user) {
            user.isAdmin = true;
            await user.save();
            console.log('User admin@test.com promoted to admin');
        } else {
            console.log('User admin@test.com not found');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

promoteUser();
