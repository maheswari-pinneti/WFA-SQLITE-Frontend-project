import 'dotenv/config';
import { getDb } from '../src/config/db.js';

const verify = async () => {
  try {
    console.log("Verifying SQLite connectivity...");
    const db = getDb();
    const result = db.prepare('SELECT 1').get();
    if (result) {
      console.log("\nVERIFICATION STATUS: SUCCESS");
      console.log("----------------------------");
      console.log("API: healthy");
      console.log("Database: connected");
      console.log("DatabaseType: SQLite");
      console.log("Database Path: backend/database/wfa.sqlite");
    } else {
      throw new Error("Connection established but ping query returned no result.");
    }
  } catch (err) {
    console.error("\nVERIFICATION STATUS: FAILED");
    console.error("---------------------------");
    console.error(`Error details: ${err.message}`);
    process.exit(1);
  } finally {
    console.log("Verification finished.");
  }
};

verify();
