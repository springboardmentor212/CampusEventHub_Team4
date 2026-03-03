const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: './.env.local' });

async function test() {
    await mongoose.connect(process.env.MONGO_URI);

    // Check the existing user
    const User = mongoose.model('User'); // Already defined? No, let's redefine minimal
    const user = await mongoose.model('User').findOne({ email: 'admin@campuseventhub.com' });

    console.log('User found:', !!user);
    if (user) {
        console.log('Hashed Password in DB:', user.password);
        const match = await bcrypt.compare('password123', user.password);
        console.log('Manual check with bcrypt.compare:', match);
    }

    await mongoose.disconnect();
}

test().catch(console.error);
