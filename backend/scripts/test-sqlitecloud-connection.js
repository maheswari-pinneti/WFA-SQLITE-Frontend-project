import { Database } from '@sqlitecloud/drivers';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  const url = process.env.SQLITE_CLOUD_URL || process.env.SQLITE_CLOUD_CONNECTION_STRING;
  
  if (!url) {
    console.error('❌ Error: SQLITE_CLOUD_URL or SQLITE_CLOUD_CONNECTION_STRING is missing in your .env file.');
    process.exit(1);
  }

  if (!url.startsWith('sqlitecloud://')) {
    console.error('❌ Error: Connection string must start with "sqlitecloud://".');
    process.exit(1);
  }

  console.log(`[Diagnostic] Attempting to connect to: ${url.split('@')[1] || url}`);
  
  try {
    const db = new Database(url);
    const result = await db.sql('SELECT 1 as active');
    
    if (result && result.length > 0 && result[0].active === 1) {
      console.log('✅ Success: Successfully connected to SQLite Cloud and executed verification query!');
    } else {
      console.warn('⚠️ Warning: Connected, but verification query returned unexpected results:', result);
    }
    db.close();
  } catch (error) {
    console.error('❌ Connection Failed: Could not establish a connection to SQLite Cloud.');
    console.error('Details:', error.message || error);
    process.exit(1);
  }
}

testConnection();
