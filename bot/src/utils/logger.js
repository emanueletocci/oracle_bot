import fs from "node:fs";
import path from "node:path";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { LOGS_DIR } from "./paths.js";

const APP_DIR = path.join(LOGS_DIR, "app");
const ERROR_DIR = path.join(LOGS_DIR, "error");
const AUDIT_DIR = path.join(LOGS_DIR, "audit");

fs.mkdirSync(APP_DIR, { recursive: true });
fs.mkdirSync(ERROR_DIR, { recursive: true });
fs.mkdirSync(AUDIT_DIR, { recursive: true });

const consoleFormat = winston.format.printf(({ level, message, timestamp, stack }) => {
	return `${timestamp} [${level}]: ${stack || message}`;
});

const fileFormat = winston.format.printf(({ level, message, timestamp, stack }) => {
	return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = winston.createLogger({
	level: "debug",
	format: winston.format.combine(
		winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
		winston.format.errors({ stack: true }),
	),
	transports: [
		new winston.transports.Console({
			format: winston.format.combine(winston.format.colorize(), consoleFormat),
		}),

		new DailyRotateFile({
			filename: path.join(APP_DIR, "application-%DATE%.log"),
			datePattern: "YYYY-MM-DD",
			auditFile: path.join(AUDIT_DIR, "application-audit.json"),
			maxSize: "20m",
			maxFiles: "14d",
			format: fileFormat,
		}),

		new DailyRotateFile({
			filename: path.join(ERROR_DIR, "error-%DATE%.log"),
			datePattern: "YYYY-MM-DD",
			level: "error",
			auditFile: path.join(AUDIT_DIR, "error-audit.json"),
			maxSize: "20m",
			maxFiles: "30d",
			format: fileFormat,
		}),
	],
});

export default logger;