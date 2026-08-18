import { getDb } from './connection.js';

export interface Session {
  withTransaction<T>(fn: () => Promise<T>): Promise<T>;
  endSession(): Promise<void>;
}

export const mongoose = {
  startSession: async (): Promise<Session> => ({
    withTransaction: async <T>(fn: () => Promise<T>): Promise<T> => {
      const db = getDb();
      db.prepare('BEGIN TRANSACTION').run();
      try {
        const res = await fn();
        db.prepare('COMMIT').run();
        return res;
      } catch (err) {
        db.prepare('ROLLBACK').run();
        throw err;
      }
    },
    endSession: async () => {}
  }),
  connection: {
    readyState: 1
  }
};

export default mongoose;
