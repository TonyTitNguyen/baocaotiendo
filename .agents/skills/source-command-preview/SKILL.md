---
name: "source-command-preview"
description: "Start local static server on port 8000 and open the dashboard"
---

# source-command-preview

Use this skill when the user asks to run the migrated source command `preview`.

## Command Template

Start a Python static file server in the background on port 8000, then print the URL `http://localhost:8000` for the user to open.

Steps:
1. Check port 8000 not already in use (`lsof -i:8000`); if busy, pick 8001.
2. Run `python3 -m http.server <port>` in background.
3. Tell user: open `http://localhost:<port>` in browser.
4. Do NOT auto-open browser unless user asks.
