#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');

const TITLE = 'Claude Code';
const MESSAGE = 'Task complete';
const CONFIG_PATH = require('path').join(os.homedir(), '.claude', 'notify-done.json');

const DEFAULT_SOUND = {
  darwin: '/System/Library/Sounds/Glass.aiff',
  linux: '/usr/share/sounds/freedesktop/stereo/complete.oga',
  win32: null, // handled separately below (System.Media.SystemSounds)
};

function run(cmd, args) {
  spawnSync(cmd, args, { stdio: 'ignore' });
}

function has(cmd) {
  const finder = process.platform === 'win32' ? 'where' : 'which';
  return spawnSync(finder, [cmd]).status === 0;
}

function configuredSound() {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    return config.sound;
  } catch {
    return undefined;
  }
}

// Precedence: CLAUDE_NOTIFY_SOUND env var > ~/.claude/notify-done.json > OS default.
function resolveSound(platform) {
  const candidate = process.env.CLAUDE_NOTIFY_SOUND || configuredSound();
  if (candidate && fs.existsSync(candidate)) return candidate;
  return DEFAULT_SOUND[platform];
}

const platform = os.platform();
const sound = resolveSound(platform);

if (platform === 'darwin') {
  if (sound) run('afplay', [sound]);
  if (has('terminal-notifier')) {
    run('terminal-notifier', ['-title', TITLE, '-message', MESSAGE]);
  } else {
    run('osascript', ['-e', `display notification "${MESSAGE}" with title "${TITLE}"`]);
  }
} else if (platform === 'linux') {
  if (sound) {
    if (has('ffplay')) {
      run('ffplay', ['-nodisp', '-autoexit', '-loglevel', 'quiet', sound]);
    } else if (has('cvlc')) {
      run('cvlc', ['--play-and-exit', '--intf', 'dummy', sound]);
    } else if (has('mpg123')) {
      run('mpg123', ['-q', sound]);
    } else if (has('paplay')) {
      run('paplay', [sound]);
    } else if (has('aplay')) {
      run('aplay', [sound]);
    }
  }
  if (has('notify-send')) {
    run('notify-send', [TITLE, MESSAGE]);
  }
} else if (platform === 'win32') {
  const soundCmd = sound
    ? [
        'Add-Type -AssemblyName PresentationCore;',
        '$player = New-Object System.Windows.Media.MediaPlayer;',
        `$player.Open([uri]"${sound}");`,
        '$player.Play();',
        'Start-Sleep -Seconds 3;',
        '$player.Close();',
      ]
    : ['[System.Media.SystemSounds]::Asterisk.Play();'];

  const ps = [
    ...soundCmd,
    'Add-Type -AssemblyName System.Windows.Forms;',
    'Add-Type -AssemblyName System.Drawing;',
    '$notify = New-Object System.Windows.Forms.NotifyIcon;',
    '$notify.Icon = [System.Drawing.SystemIcons]::Information;',
    '$notify.Visible = $true;',
    `$notify.ShowBalloonTip(3000, "${TITLE}", "${MESSAGE}", [System.Windows.Forms.ToolTipIcon]::Info);`,
    'Start-Sleep -Milliseconds 1500;',
    '$notify.Dispose();',
  ].join(' ');
  run('powershell', ['-NoProfile', '-Command', ps]);
}
