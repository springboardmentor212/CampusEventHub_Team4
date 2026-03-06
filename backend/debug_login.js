import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './models/User.js';

dotenv.config({ path: ".env.local" });
dotenv.config();

async function test() {
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOne({ email: 'admin@campuseventhub.com' });

    console.log('User found:', !!user);
    if (user) {
        console.log('Hashed Password in DB:', user.password);
        const match = await user.comparePassword('password123');
        console.log('user.comparePassword check:', match);

        const manualMatch = await bcrypt.compare('password123', user.password);
        console.log('Manual bcrypt.compare check:', manualMatch);
    }

    await mongoose.disconnect();
}

test().catch(console.error);
