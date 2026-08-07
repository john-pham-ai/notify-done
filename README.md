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

Interactively pick from everything in `sounds/` (bundled presets plus any of
your own files you've dropped in there), or turn on randomize:

```
node /path/to/notify-done/scripts/set-sound.js --select
```

```
Pick a completion sound:
   1) alert
   2) chime
   3) ping
   4) success
   r) randomize every time
> _
```

Or skip the picker and set things directly:

```
node /path/to/notify-done/scripts/set-sound.js success          # bundled preset by name
node /path/to/notify-done/scripts/set-sound.js /path/to/song.mp3 # any local audio file, any name
node /path/to/notify-done/scripts/set-sound.js --random           # randomize every completion, right now
node /path/to/notify-done/scripts/set-sound.js --list             # list everything currently in sounds/
```

**Randomize mode** picks a new file from `sounds/` on every single Stop event —
not a one-time random pick. Re-run `--select`/`r` or `set-sound.js <name>` to
go back to a fixed sound.

That's it — no settings.json editing, no environment variables, no restart needed.
It writes your choice to `~/.claude/notify-done.json`, which `notify-done.js` reads
every time the Stop hook fires. Run it again anytime to switch sounds.

To go back to the default (`chime`), just delete that file:

```
rm ~/.claude/notify-done.json
```

**Note on `sounds/`:** any format you drop in there (`.mp3`, `.aiff`, `.ogg`,
`.m4a`, `.wav`) shows up in `--list`/`--select` immediately — no code changes
needed. Only `.wav` files in that folder are tracked by git, though (see
"Sharing this plugin" below); anything else you add stays local to your
machine automatically.

### Alternative: environment variable

If you'd rather set it via env var (e.g. to override per-shell-session), export
`CLAUDE_NOTIFY_SOUND` — it takes priority over the config file:

```
export CLAUDE_NOTIFY_SOUND="$HOME/Downloads/my-sound.mp3"
```

## How sound selection works

Priority order, first match wins:

1. `CLAUDE_NOTIFY_SOUND` env var (if set and the file exists)
2. `~/.claude/notify-done.json`, written by `set-sound.js`:
   - `{"random": true, "dir": "..."}` — pick a new file from `dir` on every
     single Stop event (not a one-time pick)
   - `{"sound": "..."}` — always play this exact file
3. Bundled default (`sounds/chime.wav`)
4. Built-in OS system sound, only if the bundled file is somehow missing
   (`Glass.aiff` on macOS, `freedesktop/complete.oga` on Linux,
   `SystemSounds.Asterisk` on Windows)

## Installing as a plugin

The normal path (see "Install" above) is `/plugin marketplace add` +
`/plugin install`. If you'd rather skip the interactive flow, run:

```
node /path/to/notify-done/scripts/install.js
```

which writes the equivalent entries directly to `~/.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "notify-done": { "source": { "source": "directory", "path": "/path/to/notify-done" } }
  },
  "enabledPlugins": { "notify-done@notify-done": true }
}
```

It's idempotent, so it's safe to re-run. A `notify-done-install` shell
alias pointing at this script is a convenient way to keep it one command away.

Either way, **restart Claude Code (or open `/plugin` once)** afterwards —
a freshly-enabled plugin's hooks don't register until then.

## Sharing this plugin with others

The bundled presets in `sounds/` are synthesized tones generated with
`ffmpeg` (see `scripts/generate-sounds.sh`) — not sampled from any existing
recording, so they're safe to share as-is.

If you want to use something else, like a personal or game sound clip,
do **not** commit or share audio files you don't have rights to distribute.
Use `set-sound.js`/`--select` with your own local file instead — `.gitignore`
already keeps anything in `sounds/` that isn't a `.wav` out of the repo, so
dropping a personal clip straight into that folder (for the `--select`
picker's convenience) never accidentally gets committed.

To share:
1. Push this folder to an internal git repo.
2. Teammates run `/plugin marketplace add <git-url>` then
   `/plugin install notify-done@<marketplace-name>`.
3. Each person runs `node scripts/set-sound.js /path/to/their/own/sound.mp3`
   (or drops it into their local `sounds/` and runs `--select`).

## Requirements

- **macOS**: `afplay` (built-in) for sound; `terminal-notifier` (`brew install
  terminal-notifier`) strongly recommended for notifications — without it,
  the fallback `osascript` banner is easy to lose to Focus/Do Not Disturb or
  missing per-app notification permissions with no error reported back
- **Linux**: one of `ffplay` / `cvlc` / `mpg123` / `paplay` / `aplay` for sound, `notify-send` for the popup
- **Windows**: PowerShell (built-in)

## Uninstall

```
/plugin uninstall notify-done@notify-done
```
