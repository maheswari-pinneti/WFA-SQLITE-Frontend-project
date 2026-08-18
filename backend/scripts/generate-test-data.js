import mongoose from 'mongoose';
import 'dotenv/config';
import { connectMongoDB } from '../src/config/mongodb.js';
import { seedMongo } from './seed-mongodb.js';

async function main() {
  try {
    console.log('Connecting to MongoDB database...');
    await connectMongoDB();
    console.log('Seeding database with test data...');
    await seedMongo(true);
    console.log('Database seeded successfully.');
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

main();
