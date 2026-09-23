# ControlTmux for Tabby

Control tmux on remote hosts from a right-click menu in Tabby SSH tabs.

Right-click an SSH tab (title or terminal body) to get a **ControlTmux** section:

- **New session** – default name, or *Named…* (types `tmux new-session -s ` for you to complete)
- **Attach to…** – pick from the sessions running on the host
- **Kill session** – pick a session to kill
- **Detach** – detach the current client
- **Close session** – kill the session you are in

Each item has a single-key shortcut shown on the right of the menu.

If tmux isn't installed on the host, the menu offers **Install tmux…**, which detects the package
manager (apt, dnf, yum, apk, pacman, zypper, brew) and runs the install in the tab, using `sudo`
when you aren't root (you type the password in the terminal).

Sessions are listed over a separate exec channel on the same SSH connection, so your terminal is never disturbed.
It works alongside [tabby-tmux](https://github.com/ruanimal/tabby-tmux) (control mode); the two serve different purposes.

## Preview

```
 ControlTmux
 ├─ New session        N  ▸  Default name  D
 │                          Named…         N
 ├─ Attach to…         A  ▸  1  main (attached)
 │                          2  work
 ├─ Kill session       K  ▸  1  main …
 ├─ ───────────
 ├─ Detach             D
 └─ Close session      C
```

## Install

Settings → Plugins → search for `tabby-control-tmux`, then restart Tabby.

## Build from source

```bash
npm install --legacy-peer-deps
npm run build
```

Copy `package.json` and `dist/` into `<Tabby config dir>/plugins/node_modules/tabby-control-tmux/`
(macOS: `~/Library/Application Support/tabby/plugins/node_modules/`) and restart Tabby.

## Notes

- Actions type commands into the active tab, so use them at a shell prompt.
- Requires `tmux` on the remote host (or use the install item).

## License

MIT
