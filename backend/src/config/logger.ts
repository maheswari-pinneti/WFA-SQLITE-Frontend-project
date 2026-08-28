/**
 * Structured JSON Logger for Production-Ready Observability
 */
export const logger = {
  log(level: string, event: string, message: string, metadata: Record<string, any> = {}) {
    const logData = {
      timestamp: new Date().toISOString(),
      level,
      service: 'wfa-api',
      event,
      message,
      ...metadata,
    };
    console.log(JSON.stringify(logData));
  },

  info(event: string, message: string, metadata: Record<string, any> = {}) {
    this.log('INFO', event, message, metadata);
  },

  warn(event: string, message: string, metadata: Record<string, any> = {}) {
    this.log('WARN', event, message, metadata);
  },

  error(event: string, message: string, metadata: Record<string, any> = {}) {
    this.log('ERROR', event, message, metadata);
  }
};

export default logger;
