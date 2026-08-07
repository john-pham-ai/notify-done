# notify-done

Claude Code plugin that plays a sound and shows a desktop notification whenever
Claude finishes responding (a `Stop` hook). Works on macOS, Linux, and Windows.

## Install

**As a local plugin** (for yourself, or to test before sharing):

```
/plugin marketplace add /path/to/notify-done
/plugin install notify-done@notify-done
```

Restart Claude Code (or open `/plugin` once) after installing so the hook registers.

**Shared via git**, once you've pushed this folder to a repo:

```
/plugin marketplace add <git-url>
/plugin install notify-done@<marketplace-name>
```

## Bundled sounds

Four short, synthesized (not sampled — no copyright concerns), royalty-free
tones ship in `sounds/`:

| Preset | Description |
|---|---|
| `chime` | two-note rising chime (the default) |
| `ping` | single short beep |
| `success` | three-note ascending arpeggio |
| `alert` | two quick beeps |

## Changing the sound (easiest way)

Pick a bundled preset by name:

```
node /path/to/notify-done/scripts/set-sound.js success
```

Or use your own audio file instead:

```
node /path/to/notify-done/scripts/set-sound.js /path/to/your-sound.mp3
```

List what's available anytime:

```
node /path/to/notify-done/scripts/set-sound.js --list
```

That's it — no settings.json editing, no environment variables, no restart needed.
It writes your choice to `~/.claude/notify-done.json`, which `notify-done.js` reads
every time the Stop hook fires. Run it again anytime to switch sounds.

To go back to the default (`chime`), just delete that file:

```
rm ~/.claude/notify-done.json
```

### Alternative: environment variable

If you'd rather set it via env var (e.g. to override per-shell-session), export
`CLAUDE_NOTIFY_SOUND` — it takes priority over the config file:

```
export CLAUDE_NOTIFY_SOUND="$HOME/Downloads/my-sound.mp3"
```

## How sound selection works

Priority order, first match wins:

1. `CLAUDE_NOTIFY_SOUND` env var (if set and the file exists)
2. `sound` field in `~/.claude/notify-done.json` (written by `set-sound.js`)
3. Bundled default (`sounds/chime.wav`)
4. Built-in OS system sound, only if the bundled file is somehow missing
   (`Glass.aiff` on macOS, `freedesktop/complete.oga` on Linux,
   `SystemSounds.Asterisk` on Windows)

## Sharing this plugin with others

The bundled presets in `sounds/` are synthesized tones generated with
`ffmpeg` (see `scripts/generate-sounds.sh`) — not sampled from any existing
recording, so they're safe to share as-is.

If you want to use something else, like a personal or game sound clip,
do **not** commit or share audio files you don't have rights to distribute.
Use `set-sound.js` with your own local file instead — it stays out of the repo.

To share:
1. Push this folder to an internal git repo.
2. Teammates run `/plugin marketplace add <git-url>` then
   `/plugin install notify-done@<marketplace-name>`.
3. Each person runs `node scripts/set-sound.js /path/to/their/own/sound.mp3`.

## Requirements

- **macOS**: `afplay` (built-in), optional `terminal-notifier` for nicer notifications
- **Linux**: one of `ffplay` / `cvlc` / `mpg123` / `paplay` / `aplay` for sound, `notify-send` for the popup
- **Windows**: PowerShell (built-in)

## Uninstall

```
/plugin uninstall notify-done@notify-done
```
