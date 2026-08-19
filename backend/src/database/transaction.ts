import { transaction } from './sqlite-cloud.js';

export interface Session {
  withTransaction<T>(fn: () => Promise<T>): Promise<T>;
  endSession(): Promise<void>;
}

export const mongoose = {
  startSession: async (): Promise<Session> => ({
    withTransaction: async <T>(fn: () => Promise<T>): Promise<T> => {
      return await transaction(fn);
    },
    endSession: async () => {}
  }),
  connection: {
    readyState: 1
  }
};

export default mongoose;
