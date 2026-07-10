#!/usr/bin/env node

/**
 * Simple HTTP server for serving the built web app
 * Usage: node scripts/serve.js [port]
 */

import { createServer } from 'http';
import { readFileSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const port = process.argv[2] || 3000;
const distPath = resolve(__dirname, '../dist');

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip'
};

// Create HTTP server
const server = createServer((req, res) => {
  let filepath = join(distPath, req.url === '/' ? 'index.html' : req.url);
  
  // Security: Prevent directory traversal
  if (!filepath.startsWith(distPath)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  try {
    // Try to read the file
    const stats = readFileSync(filepath, { throwIfNoEntry: false });
    
    if (!stats) {
      // File not found, try adding .html extension
      filepath = join(distPath, req.url, 'index.html');
      const statsHtml = readFileSync(filepath, { throwIfNoEntry: false });
      
      if (!statsHtml) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      
      // Serve the HTML file
      const content = readFileSync(filepath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
      return;
    }
    
    // Get file extension
    const ext = filepath.substring(filepath.lastIndexOf('.'));
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    // Read and serve the file
    const content = readFileSync(filepath);
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600'
    });
    res.end(content);
  } catch (err) {
    console.error('Error serving file:', err);
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

// Start server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Serving files from: ${distPath}`);
  console.log('Press Ctrl+C to stop');
});

// Handle errors
server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

// Handle SIGTERM for graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});
