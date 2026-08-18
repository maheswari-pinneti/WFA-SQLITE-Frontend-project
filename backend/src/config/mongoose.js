import { getDb } from './db.js';

export const mongoose = {
  startSession: async () => ({
    withTransaction: async (fn) => {
      const db = getDb();
      db.prepare('BEGIN TRANSACTION').run();
      try {
        await fn();
        db.prepare('COMMIT').run();
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
