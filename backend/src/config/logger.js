/**
 * Structured JSON Logger for Production-Ready Observability
 */
export const logger = {
  log(level, event, message, metadata = {}) {
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

  info(event, message, metadata = {}) {
    this.log('INFO', event, message, metadata);
  },

  warn(event, message, metadata = {}) {
    this.log('WARN', event, message, metadata);
  },

  error(event, message, metadata = {}) {
    this.log('ERROR', event, message, metadata);
  }
};

export default logger;
