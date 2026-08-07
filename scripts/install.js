#!/usr/bin/env node
// Registers notify-done in ~/.claude/settings.json directly, as an
// alternative to the interactive `/plugin marketplace add` + `/plugin install` flow.
const fs = require('fs');
const os = require('os');
const path = require('path');

const SETTINGS_PATH = path.join(os.homedir(), '.claude', 'settings.json');
const PLUGIN_ROOT = path.join(__dirname, '..');
const MARKETPLACE_NAME = 'notify-done';
const PLUGIN_ID = 'notify-done@notify-done';

function readSettings() {
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
  } catch {
    return {};
  }
}

const settings = readSettings();

settings.extraKnownMarketplaces = settings.extraKnownMarketplaces || {};
settings.extraKnownMarketplaces[MARKETPLACE_NAME] = {
  source: { source: 'directory', path: PLUGIN_ROOT },
};

settings.enabledPlugins = settings.enabledPlugins || {};
const alreadyInstalled = settings.enabledPlugins[PLUGIN_ID] === true;
settings.enabledPlugins[PLUGIN_ID] = true;

fs.mkdirSync(path.dirname(SETTINGS_PATH), { recursive: true });
fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2) + '\n');

console.log(`notify-done registered in ${SETTINGS_PATH}`);
console.log(alreadyInstalled ? 'Already installed.' : 'Restart Claude Code (or open /plugin once) for the hook to register.');
