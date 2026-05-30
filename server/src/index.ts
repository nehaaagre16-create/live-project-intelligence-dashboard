import { DashboardServer } from './api/server.js';
import * as path from 'path';

const projectRoot = process.env.PROJECT_ROOT || path.resolve('/home/paperclip/paperclip');
const port = parseInt(process.env.PORT || '3456', 10);

const server = new DashboardServer(projectRoot, port);

server.start().catch(console.error);

process.on('SIGINT', () => {
  console.log('Shutting down...');
  server.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down...');
  server.stop();
  process.exit(0);
});
