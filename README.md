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

## Changing the sound (easiest way)

Run this one command with the path to any audio file you want:

```
node /path/to/notify-done/scripts/set-sound.js /path/to/your-sound.mp3
```

That's it — no settings.json editing, no environment variables, no restart needed.
It writes your choice to `~/.claude/notify-done.json`, which `notify-done.js` reads
every time the Stop hook fires. Run it again anytime to switch sounds.

To go back to the default system sound, just delete that file:

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
3. Built-in OS default sound (`Glass.aiff` on macOS, `freedesktop/complete.oga`
   on Linux, `SystemSounds.Asterisk` on Windows)

## Sharing this plugin with others

Do **not** commit or share audio files you don't have rights to distribute
(e.g. ripped game audio). This plugin ships with no bundled sound file for
exactly that reason — everyone who installs it runs `set-sound.js` once with
their own local file.

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
