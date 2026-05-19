# Node.js Functions

Node-only utilities exported from `melperjs/node`. These rely on Node modules (`crypto`, `fs`, `child_process`, `os`)
and will not run in a browser.

## Cryptographic Random (CSPRNG)

All `secureRandom*` helpers use Node's `crypto` module (`crypto.randomInt`, `crypto.randomBytes`, `crypto.randomUUID`).
Use these for session tokens, API keys, nonces, and anything security-sensitive. For non-secure / faster equivalents,
see the `random*` family in [General Functions](./general.md).

### secureRandomBoolean()

Returns `true` or `false` with cryptographically uniform probability.

- **Returns:** `Boolean`.

### secureRandomString(length, useNumbers = true, useUppercase = false)

Generates a cryptographically random string from a configurable character set.

- **Parameters:**
    - `length` (Number): Output length.
    - `useNumbers` (Boolean): Include digits `0-9`.
    - `useUppercase` (Boolean): Include uppercase letters.
- **Returns:** Random string.

### secureRandomHex(length)

Generates a cryptographically random hexadecimal string.

- **Parameters:**
    - `length` (Number): Output length.
- **Returns:** Hex string of the requested length.

### secureRandomInteger(min, max)

Returns a cryptographically random integer in `[min, max)`. Thin wrapper over `crypto.randomInt`.

- **Parameters:**
    - `min` (Number): Inclusive lower bound.
    - `max` (Number): Exclusive upper bound.
- **Returns:** Integer in `[min, max)`.

### secureRandomUuid(useDashes = true)

Generates a cryptographically random UUID v4 via `crypto.randomUUID()`. Suitable for security tokens.

- **Parameters:**
    - `useDashes` (Boolean): When `false`, dashes are stripped.
- **Returns:** UUID string.

### secureRandomWeighted(object)

Picks a key from `object` with probability proportional to its weight, using `crypto.randomInt` for selection. Weights
must be positive integers.

- **Parameters:**
    - `object` (Object): Map of key → positive integer weight.
- **Returns:** Selected key.

### secureRandomElement(object)

Picks a cryptographically random value from an array or from an object's own enumerable values. Returns `undefined` for
empty or nullish input.

- **Parameters:**
    - `object` (Array|Object): Source collection.
- **Returns:** A random value, or `undefined`.

## Deterministic Random (seeded)

### uuidFromSeed(seed, useDashes = true)

Builds a deterministic UUID by MD5-hashing the seed and setting RFC 4122 v3 version/variant bits. Same seed always
yields the same UUID. Use for stable identifiers derived from input data; do not use for unpredictability.

- **Parameters:**
    - `seed` (String|Buffer): Seed value hashed with MD5.
    - `useDashes` (Boolean): When `false`, dashes are stripped.
- **Returns:** UUID string.

## Hashing

### hash(algorithm, data)

Computes a hex digest using any algorithm supported by Node's `crypto.createHash`.

- **Parameters:**
    - `algorithm` (String): e.g., `"sha1"`, `"sha256"`, `"md5"`.
    - `data` (String|Buffer): Input data.
- **Returns:** Hex digest.

### md5(data)

Shortcut for `hash("md5", data)`.

- **Returns:** 32-char hex MD5 digest.

### sha256(data)

Shortcut for `hash("sha256", data)`.

- **Returns:** 64-char hex SHA-256 digest.

## Encoding

### base64Encode(data)

Encodes input to Base64. Strings are treated as UTF-8; pass a `Buffer` for binary data.

- **Parameters:**
    - `data` (String|Buffer): Input data.
- **Returns:** Base64 string.

### base64Decode(data, encoding = 'utf8')

Decodes Base64 input to a string using the given output encoding.

- **Parameters:**
    - `data` (String): Base64 string.
    - `encoding` (String): Buffer encoding for the result (`'utf8'`, `'hex'`, etc.).
- **Returns:** Decoded string.

## Bcrypt (Passwords)

### bcryptHash(plainText, {key = "", strength = 12, preHash = true} = {})

Hashes plaintext with bcrypt. An optional pre-hash `key` (application-wide secret, sometimes called "pepper") is appended to the plaintext before hashing. `strength` controls the bcrypt cost factor. When `preHash` is `true` (default), the input is SHA-256-hashed first so that very long passwords (bcrypt silently truncates at 72 bytes) are handled safely and uniquely.

- **Parameters:**
    - `plainText` (String): Password or other secret to hash.
    - `options.key` (String): Extra secret appended before hashing. Default `""`.
    - `options.strength` (Number): bcrypt cost (rounds). Default `12`.
    - `options.preHash` (Boolean): Pre-hash with SHA-256 before bcrypt. Default `true`. Disable only for back-compat with hashes generated without it.
- **Returns:** Bcrypt hash string.

### bcryptVerify(plainText, hash, {key = "", preHash = true} = {})

Verifies that `plainText` (with the same `key`) matches a previously generated bcrypt hash. `preHash` must match the value used during hashing.

- **Parameters:**
    - `plainText` (String): Plaintext to verify.
    - `hash` (String): Bcrypt hash from `bcryptHash`.
    - `options.key` (String): Same `key` used during hashing.
    - `options.preHash` (Boolean): Must match the `preHash` used for `bcryptHash`. Default `true`.
- **Returns:** `Boolean` indicating match.

## Proxy Helpers

### normalizeProxy(proxy, protocol = "http")

Normalizes a wide range of proxy formats into a canonical `protocol://[user:pass@]host:port` URL. Supports:

- `host:port`
- `host:port:user:pass` (auth appended)
- `user:pass:host:port` (auth prepended; auto-detected via numeric port pattern)
- `host:portStart:portEnd:user:pass` (random port in range, inclusive)
- `user:pass:host:portStart:portEnd` (auth prepended, random port in range)
- `user:pass@host:port`
- `user:pass@host:portStart:portEnd` (random port in range)
- Any of the above prefixed with `scheme://` (`http`, `https`, `socks5`, `socks5h`, …)

Returns `null` for empty or non-string input. Does not crash on unparseable input — returns it as-is wrapped with
`protocol://`.

- **Parameters:**
    - `proxy` (String): Source proxy string.
    - `protocol` (String): Default protocol when none is present in the input.
- **Returns:** Canonical proxy URL, or `null` when input is empty/missing.

### parseProxy(proxy, protocol = "http")

Normalizes `proxy` via `normalizeProxy`, then decomposes it into structured fields. Returns `null` when normalization
fails (empty input).

- **Parameters:**
    - `proxy` (String): Source proxy string.
    - `protocol` (String): Default protocol when none is present in the input.
- **Returns:** `{protocol, host, port, auth?: {username, password}}` or `null`.

### proxyValue(rawProxy, replacements = {})

Picks a random proxy from a newline-separated list, normalizes it, and applies placeholder substitution.

`{SESSION}` is a built-in placeholder:

- If `SESSION` is not provided, it is autofilled with a non-secure `randomHex(8)`.
- If `SESSION` is a string, it is treated as a seed and replaced via `seedHex(seed, 8)` (deterministic).
- If `SESSION` is a function, the function is called per invocation.

Any other key in `replacements` is also substituted (`{KEY}` → value). For non-SESSION entries: functions are called,
strings are used literally.

- **Parameters:**
    - `rawProxy` (String): Newline-separated proxy list.
    - `replacements` (Object): Placeholder values keyed by placeholder name.
- **Returns:** Final proxy URL string, or `null` if the list is empty.

## File I/O (JSON)

### readJsonFile(filePath, defaultValue = {})

Asynchronously reads a JSON file and parses it. Returns `defaultValue` on any failure (missing file, malformed JSON,
permission error).

- **Parameters:**
    - `filePath` (String): Path to JSON file.
    - `defaultValue` (Any): Fallback when read or parse fails.
- **Returns:** `Promise` resolving to parsed JSON or `defaultValue`.

### readJsonFileSync(filePath, defaultValue = {})

Synchronous version of `readJsonFile`.

- **Parameters:**
    - `filePath` (String): Path to JSON file.
    - `defaultValue` (Any): Fallback when read or parse fails.
- **Returns:** Parsed JSON or `defaultValue`.

### writeJsonFile(filePath, data)

Asynchronously writes `data` as JSON. Errors propagate to the caller.

- **Parameters:**
    - `filePath` (String): Destination path.
    - `data` (Any): JSON-serializable value.
- **Returns:** `Promise` that resolves once the file is written.

### writeJsonFileSync(filePath, data)

Synchronous version of `writeJsonFile`.

- **Parameters:**
    - `filePath` (String): Destination path.
    - `data` (Any): JSON-serializable value.
- **Returns:** `undefined`.

## File System

### createNumberedDirs(mainDirectory, start = 0, end = 9)

Creates `mainDirectory` (recursive) and a numbered subdirectory for each integer in `[start, end]` (inclusive). Existing
directories are kept.

- **Parameters:**
    - `mainDirectory` (String): Parent directory path.
    - `start` (Number): First subdirectory index. Default `0`.
    - `end` (Number): Last subdirectory index. Default `9`.
- **Returns:** `undefined`.

### clearDirectory(directoryPath, keepDir = true)

Recursively removes all files and subdirectories under `directoryPath`. When `keepDir` is `true` (default), the root
directory itself is preserved (created if missing); when `false`, the root is removed too.

- **Parameters:**
    - `directoryPath` (String): Directory to clear.
    - `keepDir` (Boolean): Whether to keep (or recreate) the root directory.
- **Returns:** `Promise<void>`.

## Process & Network

### executeCommand(command)

Runs a shell command (promisified `child_process.exec`) and returns the trimmed stdout. Rejects only on a non-zero exit
code; output on stderr alone does not reject.

- **Parameters:**
    - `command` (String): Shell command line.
- **Returns:** `Promise<String>` with the command's stdout.
- **Throws:** When the command exits with a non-zero code.

### hostIp()

Returns the first non-loopback, non-internal IPv4 address found in the host's network interfaces, skipping `127.0.0.1`
and any address starting with `192.168.`. Falls back to `127.0.0.1` if none qualifies.

- **Returns:** IPv4 address string.

### gitVersion()

Builds a version string from the UTC timestamp of the latest git commit in the current working directory.

- **Returns:** `YYMMDD.HHMM` string, or `"1.0"` when git is unavailable or the timestamp cannot be parsed.
