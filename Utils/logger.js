import winston from 'winston';
import path from 'path';

const logPath = path.join(process.cwd(), 'server.log');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: logPath })
  ]
});

export default logger;
