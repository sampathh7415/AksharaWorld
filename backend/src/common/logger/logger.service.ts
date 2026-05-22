import { Injectable, LoggerService as NestLogger, LogLevel } from '@nestjs/common';

@Injectable()
export class LoggerService implements NestLogger {
  private context = 'App';

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, context?: string) {
    this.write('LOG', message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.write('ERROR', message, context, trace);
  }

  warn(message: string, context?: string) {
    this.write('WARN', message, context);
  }

  debug(message: string, context?: string) {
    if (process.env.NODE_ENV !== 'production') {
      this.write('DEBUG', message, context);
    }
  }

  verbose(message: string, context?: string) {
    this.write('VERBOSE', message, context);
  }

  private write(level: string, message: string, context?: string, trace?: string) {
    const ts = new Date().toISOString();
    const ctx = context || this.context;
    const line = `[${ts}] [${level}] [${ctx}] ${message}`;
    if (level === 'ERROR') {
      console.error(line);
      if (trace) console.error(trace);
    } else {
      console.log(line);
    }
  }
}
