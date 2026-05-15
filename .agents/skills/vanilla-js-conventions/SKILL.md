---
name: vanilla-js-conventions
description: Use when editing js/app.js or adding new UI behavior. Captures the intentional vanilla style of this codebase — no modules, no build, terse one-liners, HTML-escape rules.
---

# Vanilla JS conventions

## Hard rules

1. **No build step.** Plain `<script>` tags in `index.html`. Do NOT add `import` / `export` / `require` / bundlers.
2. **No frameworks.** No React, Vue, Svelte, jQuery, Alpine. DOM via `document.querySelector`.
3. **One file.** `js/app.js` is one file by design. Do not split into modules.
4. **Globals are intentional.** `Store`, `window.SEED_DATA`, `window.CLOUD_CONFIG`, `data`, helpers — all top-level. Keep new code in the same style.

## Style baseline (matches existing code)

- DOM helpers at `js/app.js:1`: `$` = `querySelector`, `$$` = `querySelectorAll` returning array. Use them.
- One-liner arrow functions for small helpers, e.g. `const fdate = s => s ? new Date(...).toLocaleDateString('vi-VN') : '-';`
- HTML built via template literals + interpolation. Render flow: data → template literal → `el.innerHTML = ...`.
- Single-quote strings, no semicolon discipline strictly enforced (existing code is comma-chained).
- No JSDoc, no TypeScript, no type annotations.

## HTML escaping — non-negotiable

Any user-supplied or seed string going into `innerHTML` MUST pass through `clean()` at `js/app.js:4`:

```js
const clean = v => String(v ?? '').replace(/[<>&"]/g, m =>
  ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;' }[m]));
```

Patterns:

- `${clean(t.title)}` ✅
- `${t.title}` ❌ (XSS via task title)
- onclick handlers passing IDs: `onclick="openTask('${t.id}')"` — IDs are generated, safe. Names/titles in attributes still need `clean()`.

## Save / sync pipeline

After mutating `data`:

```js
persist('Đã tạo công việc'); // optional Vietnamese activity message
```

`persist()` at `js/app.js:18` runs: `activity()` → `Store.save()` (noop) → `render()` → `debouncedPush()` (cloud).

Do NOT call `render()` and `pushCloud()` manually — use `persist`.

## Avoid

- `eval`, `new Function`, dynamic `<script>` injection.
- Storing secrets or tokens in `data`.
- Adding `console.log` in committed code.
- ESM imports — they break the static `<script>` load order.
- `async/await` in render code paths — keeps render synchronous. Async only in sync/cloud helpers.

## Adding a new page

1. Add a `<button data-page="x">` to sidebar in `index.html`.
2. Add `<section class="page" id="page-x">` markup.
3. Hook render in the main `render()` function in `js/app.js`.
4. No router — page swap is class toggle on `.page` elements.
