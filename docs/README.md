# Documentation

`melperjs` is a lightweight utility library split into two entry points:

- **Core module** (`melperjs`) — browser-safe helpers. Safe to import from any JavaScript environment.
- **Node module** (`melperjs/node`) — Node.js-specific helpers built on `crypto`, `fs`, `child_process`, `os`, and more.
  Importing this in a browser will fail.

## Usage

```javascript
// ES Module
import * as helper from "melperjs";
import * as nodeHelper from "melperjs/node";

// CommonJS
const helper = require("melperjs");
const nodeHelper = require("melperjs/node");
```

Both forms are supported via dual ESM/CJS builds.

## Sections

- [General Functions](general.md) — browser-safe helpers (`melperjs`)
- [Node.js Functions](./node.md) — Node-only helpers (`melperjs/node`)
