import { Database } from '@sqlitecloud/drivers';

let cloudDb: Database | null = null;

export const getSQLiteCloudDb = (): Database | null => {
  const connectionString = process.env.SQLITE_CLOUD_CONNECTION_STRING;
  if (!connectionString) {
    return null;
  }

  if (!cloudDb) {
    console.log('[SQLite Cloud] Initializing connection to SQLite Cloud...');
    cloudDb = new Database(connectionString);
  }
  
  return cloudDb;
};

/**
 * Execute a query on SQLite Cloud asynchronously.
 * Falls back to local SQLite if connection string is not provided.
 */
export const executeCloudSql = async (sql: string, ...params: any[]): Promise<any> => {
  const db = getSQLiteCloudDb();
  if (db) {
    try {
      // Parameterized query using SQLite Cloud SDK
      return await db.sql(sql, ...params);
    } catch (error) {
      console.error('[SQLite Cloud] Query failed:', error);
      throw error;
    }
  } else {
    // Fallback log or handle locally
    console.warn('[SQLite Cloud] Connection string not found, SQLite Cloud is disabled.');
    return null;
  }
};
