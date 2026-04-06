type LogLevel = 'info' | 'warn' | 'error';

class Logger {
  private isProduction = import.meta.env.PROD;

  private log(level: LogLevel, ...args: unknown[]): void {
    if (this.isProduction && level === 'info') {
      // Skip info logs in production
      return;
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case 'info':
        console.log(prefix, ...args);
        break;
      case 'warn':
        console.warn(prefix, ...args);
        break;
      case 'error':
        console.error(prefix, ...args);
        break;
    }
  }

  info(...args: unknown[]): void {
    this.log('info', ...args);
  }

  warn(...args: unknown[]): void {
    this.log('warn', ...args);
  }

  error(...args: unknown[]): void {
    this.log('error', ...args);
  }
}

export default new Logger();
