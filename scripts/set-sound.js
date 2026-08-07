#!/usr/bin/env node
// Usage:
//   node set-sound.js <preset-name>         e.g. chime, ping, success, alert
//   node set-sound.js /path/to/sound-file    any local audio file
//   node set-sound.js --list                 show available presets
const fs = require('fs');
const os = require('os');
const path = require('path');

const SOUNDS_DIR = path.join(__dirname, '..', 'sounds');

function listPresets() {
  return fs
    .readdirSync(SOUNDS_DIR)
    .filter((f) => f.toLowerCase().endsWith('.wav'))
    .map((f) => path.basename(f, path.extname(f)));
}

const arg = process.argv[2];

if (!arg || arg === '--list' || arg === '-l') {
  console.log('Available presets:');
  for (const name of listPresets()) console.log(`  ${name}`);
  console.log('\nUsage:');
  console.log('  node set-sound.js <preset-name>');
  console.log('  node set-sound.js /path/to/your-own-sound-file');
  process.exit(arg ? 0 : 1);
}

const presetPath = path.join(SOUNDS_DIR, `${arg}.wav`);
const resolved = fs.existsSync(presetPath) ? presetPath : path.resolve(arg);

if (!fs.existsSync(resolved)) {
  console.error(`Not a known preset and not a file: ${arg}`);
  console.error(`Known presets: ${listPresets().join(', ')}`);
  process.exit(1);
}

const configDir = path.join(os.homedir(), '.claude');
const configPath = path.join(configDir, 'notify-done.json');

fs.mkdirSync(configDir, { recursive: true });
fs.writeFileSync(configPath, JSON.stringify({ sound: resolved }, null, 2) + '\n');

console.log(`Notification sound set to: ${resolved}`);
console.log(`(saved to ${configPath})`);
