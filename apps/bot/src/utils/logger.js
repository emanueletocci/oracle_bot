import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

// Ricostruzione delle variabili globali per ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log format for the Console (colored and simple)
const consoleFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Define log format for Files (no colors, more structured)
const fileFormat = winston.format.printf(({ level, message, timestamp }) => {
  return JSON.stringify({ timestamp, level, message });
});

const logger = winston.createLogger({
  level: 'info', // Logs everything from 'info' and above (info, warn, error)
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }) // Captures the stack trace for errors
  ),
  transports: [
    // 1. Console: Colored for real-time terminal viewing
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        consoleFormat
      )
    }),

    // 2. Rotating File for EVERYTHING (Info + Errors)
    new winston.transports.DailyRotateFile({
      filename: path.join(__dirname, '../../logs/application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true, // Compresses old logs (.gz) to save space
      maxSize: '20m',      // Rotates if the file exceeds 20MB in a day
      maxFiles: '14d',     // Deletes logs older than 14 days
      format: fileFormat
    }),

    // 3. Rotating File ONLY for ERRORS (Critical for debugging)
    new winston.transports.DailyRotateFile({
      filename: path.join(__dirname, '../../logs/error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',      // Only errors here
      zippedArchive: true,
      maxFiles: '30d',
      format: fileFormat
    })
  ],
});

export default logger;