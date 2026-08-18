import mongoose from 'mongoose';
import 'dotenv/config';
import { connectMongoDB } from '../src/config/mongodb.js';

const verify = async () => {
  try {
    console.log("Verifying MongoDB Atlas connectivity...");
    const conn = await connectMongoDB();
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      console.log("\nVERIFICATION STATUS: SUCCESS");
      console.log("----------------------------");
      console.log("API: healthy");
      console.log("Database: connected");
      console.log("DatabaseType: MongoDB Atlas");
      console.log(`Database Name: ${mongoose.connection.db.databaseName}`);
    } else {
      throw new Error("Connection established but readyState is not active.");
    }
  } catch (err) {
    console.error("\nVERIFICATION STATUS: FAILED");
    console.error("---------------------------");
    console.error(`Error details: ${err.message}`);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Verification finished.");
  }
};

verify();
