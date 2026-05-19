# Documentation

`melperjs` is a small utility library split into two entry points:

- **Core module** (`melperjs`) — browser-safe helpers. No Node-only APIs, no `crypto`, no `fs`. Safe to import from any
  JavaScript environment.
- **Node module** (`melperjs/node`) — Node.js-specific helpers built on `crypto`, `fs`, `child_process`, and `os`.
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

- [General Functions](index.md) — browser-safe helpers (`melperjs`)
- [Node.js Functions](./node.md) — Node-only helpers (`melperjs/node`)
