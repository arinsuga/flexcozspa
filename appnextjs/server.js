// import { createServer } from 'http';
// import { parse } from 'url';
// import next from 'next';
// import fs from 'fs';
// import path from 'path';
// import { loadEnvConfig } from '@next/env';

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');
const { loadEnvConfig } = require('@next/env');

console.log(`process.env.NODE_ENV: ${process.env.NODE_ENV}`);

const dev = process.env.NODE_ENV !== 'production';
loadEnvConfig('./', dev);

// Log errors to a file for cPanel debugging
const logError = (error) => {
  const logPath = path.join(__dirname, 'server_error.log');
  const timestamp = new Date().toISOString();
  const message = `[${timestamp}] ${error.stack || error}\n`;
  fs.appendFileSync(logPath, message);
  console.error(message);
};

process.on('uncaughtException', (err) => {
  logError(`Uncaught Exception: ${err}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev }); // Next.js instance created
const handle = app.getRequestHandler();

app.prepare() // <--- .env.production is loaded HERE by Next.js
  .then(() => {
    createServer((req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
      } catch (err) {
        logError(`Request Error: ${err}`);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    }).listen(port, () => {
      console.log(`> Server ready on http://localhost:${port}`);
      // Log successful start
      const logPath = path.join(__dirname, 'server_error.log');
      const timestamp = new Date().toISOString();
      fs.appendFileSync(logPath, `[${timestamp}] Server started successfully on port ${port}\n`);
    });
  })
  .catch((err) => {
    logError(`App Prepare Error: ${err}`);
    process.exit(1);
  });