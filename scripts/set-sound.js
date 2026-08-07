#!/usr/bin/env node
// Usage:
//   node set-sound.js <preset-name>         e.g. chime, ping, success, alert
//   node set-sound.js /path/to/sound-file    any local audio file
//   node set-sound.js --list                 show every file in sounds/
//   node set-sound.js --select               interactively pick from sounds/ (or randomize)
//   node set-sound.js --random               randomize every time, right now
const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');

const SOUNDS_DIR = path.join(__dirname, '..', 'sounds');
const AUDIO_EXTS = ['.wav', '.mp3', '.aiff', '.aif', '.ogg', '.m4a'];

function listSoundFiles() {
  return fs
    .readdirSync(SOUNDS_DIR)
    .filter((f) => AUDIO_EXTS.includes(path.extname(f).toLowerCase()))
    .sort();
}

function writeConfig(data) {
  const configDir = path.join(os.homedir(), '.claude');
  const configPath = path.join(configDir, 'notify-done.json');
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2) + '\n');
  return configPath;
}

function setRandom() {
  const configPath = writeConfig({ random: true, dir: SOUNDS_DIR });
  console.log(`Set to randomize every completion from ${SOUNDS_DIR}`);
  console.log(`(saved to ${configPath})`);
}

function setFixed(resolved) {
  const configPath = writeConfig({ sound: resolved });
  console.log(`Notification sound set to: ${resolved}`);
  console.log(`(saved to ${configPath})`);
}

function interactiveSelect() {
  const files = listSoundFiles();
  console.log('Pick a completion sound:');
  files.forEach((f, i) => console.log(`  ${String(i + 1).padStart(2)}) ${path.basename(f, path.extname(f))}`));
  console.log('   r) randomize every time');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('> ', (answer) => {
    rl.close();
    const choice = answer.trim().toLowerCase();
    if (choice === 'r') {
      setRandom();
      return;
    }
    const idx = Number(choice) - 1;
    if (!Number.isInteger(idx) || idx < 0 || idx >= files.length) {
      console.error('Invalid choice.');
      process.exit(1);
    }
    setFixed(path.join(SOUNDS_DIR, files[idx]));
  });
}

const arg = process.argv[2];

if (arg === '--select' || arg === '-s') {
  interactiveSelect();
} else if (arg === '--random') {
  setRandom();
} else if (!arg || arg === '--list' || arg === '-l') {
  console.log('Available sounds:');
  for (const f of listSoundFiles()) console.log(`  ${path.basename(f, path.extname(f))}`);
  console.log('\nUsage:');
  console.log('  node set-sound.js <preset-name>');
  console.log('  node set-sound.js /path/to/your-own-sound-file');
  console.log('  node set-sound.js --select   (interactive picker + randomize)');
  console.log('  node set-sound.js --random   (randomize every completion)');
  process.exit(arg ? 0 : 1);
} else {
  const byName = listSoundFiles().find((f) => path.basename(f, path.extname(f)) === arg);
  const resolved = byName ? path.join(SOUNDS_DIR, byName) : path.resolve(arg);

  if (!fs.existsSync(resolved)) {
    console.error(`Not a known sound and not a file: ${arg}`);
    console.error(`Known sounds: ${listSoundFiles().map((f) => path.basename(f, path.extname(f))).join(', ')}`);
    process.exit(1);
  }
  setFixed(resolved);
}
