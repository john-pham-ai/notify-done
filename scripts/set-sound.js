#!/usr/bin/env node
// Usage: node set-sound.js /path/to/sound.(mp3|wav|aiff|...)
// Writes ~/.claude/notify-done.json so notify-done.js picks it up on the next Stop event.
const fs = require('fs');
const os = require('os');
const path = require('path');

const soundPath = process.argv[2];

if (!soundPath) {
  console.error('Usage: node set-sound.js /path/to/sound-file');
  process.exit(1);
}

const resolved = path.resolve(soundPath);

if (!fs.existsSync(resolved)) {
  console.error(`File not found: ${resolved}`);
  process.exit(1);
}

const configDir = path.join(os.homedir(), '.claude');
const configPath = path.join(configDir, 'notify-done.json');

fs.mkdirSync(configDir, { recursive: true });
fs.writeFileSync(configPath, JSON.stringify({ sound: resolved }, null, 2) + '\n');

console.log(`Notification sound set to: ${resolved}`);
console.log(`(saved to ${configPath})`);
