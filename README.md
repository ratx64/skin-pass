# SkinPass

SkinPass is a niche, fun CS2 utility that converts inspect links into deterministic passwords directly in your browser.

It now supports:
- modern inspect links (`steam://run/730//+csgo_econ_action_preview%20...`)
- legacy inspect links (`steam://rungame/730/...+csgo_econ_action_preview%20S...A...D...`)
- optional secret phrase for private outputs
- algorithm versioning (`v2` recommended, `v1` for compatibility)

## Key ideas

- Local only: no server-side conversion.
- Deterministic: same inputs produce same output.
- Optional privacy hardening: add a secret phrase so others cannot reproduce your password from the link alone.

## Quick start

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Usage

1. Paste an inspect link.
2. Optionally add a secret phrase.
3. Keep `v2` selected unless you need `v1` compatibility.
4. Convert and copy the generated password.

Example modern input:

```text
steam://run/730//+csgo_econ_action_preview%206F7FC5AFF797D36E776D4F8967476A5F6B57EE9891826C2FB16807071F67605B78D3
```

Example legacy input:

```text
steam://rungame/730/76561202255233023/+csgo_econ_action_preview%20S76561198144091202A40446467891D5630817826245312529
```

## Security notes

What this tool is:
- local deterministic converter
- useful for niche/fun workflows

What this tool is not:
- not a password manager replacement
- not protection against malware, keyloggers, or compromised browsers
- not private in public mode (no secret phrase)

If you care about privacy, always set a secret phrase and store final credentials in a trusted password manager.

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS

## License

MIT
